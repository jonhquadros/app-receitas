import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserSubscription, SubscriptionPlan, SubscriptionStatus } from '../types/subscription';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  loading: boolean;
  hasAccess: boolean;
  isPastDue: boolean;
  checkSubscriptionStatus: () => Promise<UserSubscription | null>;
  startCheckout: (plan: 'mensal' | 'anual') => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  isCheckingOut: boolean;
  checkoutError: string | null;
  setCheckoutError: (err: string | null) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Stripe Price IDs configuráveis via env vars com fallbacks
export const STRIPE_PRICES = {
  mensal: import.meta.env.VITE_STRIPE_PRICE_MENSAL || 'price_mensal_1990',
  anual: import.meta.env.VITE_STRIPE_PRICE_ANUAL || 'price_anual_9700',
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, session } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Consulta status atual da assinatura no Supabase
  const fetchSubscription = useCallback(async (): Promise<UserSubscription | null> => {
    if (!user || !isSupabaseConfigured() || !supabase) {
      setSubscription(null);
      setLoading(false);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Aviso ao consultar assinatura:', error.message);
      }

      if (data) {
        const sub: UserSubscription = {
          id: data.id,
          userId: data.user_id,
          status: (data.status as SubscriptionStatus) || 'none',
          plan: (data.plano as SubscriptionPlan) || 'mensal',
          currentPeriodEnd: data.periodo_atual_fim || data.current_period_end || null,
          stripeCustomerId: data.stripe_customer_id || null,
          stripeSubscriptionId: data.stripe_subscription_id || null,
          manualOverride: Boolean(data.manual_override),
          updatedAt: data.updated_at,
        };
        setSubscription(sub);
        return sub;
      } else {
        setSubscription(null);
        return null;
      }
    } catch (err) {
      console.warn('Erro ao verificar assinatura:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // REGRA CENTRAL DE ACESSO:
  // 1. Administrador (Fase 4) sempre tem acesso total
  // 2. Se for assinatura ativa: liberado dentro do período
  const hasAccess = Boolean(
    isAdmin ||
      (subscription &&
        ['active', 'trialing'].includes(subscription.status) &&
        Boolean(subscription.currentPeriodEnd) &&
        new Date(subscription.currentPeriodEnd).getTime() > Date.now())
  );

  const isPastDue = Boolean(subscription && subscription.status === 'past_due');

  // Iniciar Checkout do Stripe
  const startCheckout = async (plan: 'mensal' | 'anual') => {
    if (!user) {
      setCheckoutError('Faça login ou crie sua conta gratuita antes de assinar.');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    const priceId = STRIPE_PRICES[plan];

    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Serviço de banco de dados não configurado.');
      }

      // Tentar invocar Edge Function do Supabase create-checkout-session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          plan,
          returnUrl: window.location.origin,
        },
      });

      if (error) {
        console.warn('Edge Function retornou erro ou não está implantada:', error);
        // Se a Edge Function ainda não foi implantada pelo usuário no painel do Supabase,
        // geramos um aviso transparente com instruções
        throw new Error(
          'O Checkout do Stripe precisa da Edge Function "create-checkout-session" configurada no Supabase com suas chaves de teste do Stripe.'
        );
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de pagamento não foi retornada pelo Stripe.');
      }
    } catch (err: any) {
      console.error('Erro ao iniciar checkout:', err);
      setCheckoutError(err.message || 'Erro ao comunicar com o Stripe.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Abrir Portal do Cliente do Stripe para atualizar cartão ou cancelar
  const openCustomerPortal = async () => {
    if (!user) return;

    try {
      if (!isSupabaseConfigured() || !supabase) {
        alert('Serviço não configurado.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-customer-portal', {
        body: { returnUrl: window.location.origin },
      });

      if (error || !data?.url) {
        alert(
          'Para gerenciar ou cancelar sua assinatura, fale diretamente com o suporte no WhatsApp (+55 91 98571-9332) ou aguarde a configuração do Stripe Customer Portal.'
        );
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error('Erro ao abrir portal do cliente:', err);
      alert('Não foi possível abrir o portal no momento. Por favor contate o suporte.');
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        hasAccess,
        isPastDue,
        checkSubscriptionStatus: fetchSubscription,
        startCheckout,
        openCustomerPortal,
        isCheckingOut,
        checkoutError,
        setCheckoutError,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription deve ser utilizado dentro de um SubscriptionProvider');
  }
  return context;
};
