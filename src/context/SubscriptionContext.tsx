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

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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
      }

      setSubscription(null);
      return null;
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

  const hasAccess = Boolean(
    isAdmin ||
      (subscription &&
        ['active', 'trialing'].includes(subscription.status) &&
        Boolean(subscription.currentPeriodEnd) &&
        new Date(subscription.currentPeriodEnd).getTime() > Date.now())
  );

  const isPastDue = Boolean(subscription && subscription.status === 'past_due');

  const startCheckout = async (plan: 'mensal' | 'anual') => {
    if (!user) {
      setCheckoutError('Faça login ou crie sua conta gratuita antes de assinar.');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Serviço de banco de dados não configurado.');
      }

      // O backend escolhe o Price ID a partir do plano. O frontend não envia
      // Price IDs nem valores de preço, evitando divergência entre ambientes.
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { plan },
      });

      if (error) {
        let backendMessage = '';
        try {
          const response = (error as any).context;
          if (response && typeof response.json === 'function') {
            const payload = await response.json();
            backendMessage = typeof payload?.error === 'string' ? payload.error : '';
          }
        } catch {
          // Mantém a mensagem genérica caso o corpo da resposta não esteja disponível.
        }

        console.warn('Erro retornado pela Edge Function:', error, backendMessage);
        throw new Error(
          backendMessage ||
            'Não foi possível iniciar o Checkout. Tente novamente em alguns instantes.'
        );
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error('URL de pagamento não foi retornada pelo Stripe.');
    } catch (err: any) {
      console.error('Erro ao iniciar checkout:', err);
      setCheckoutError(err.message || 'Erro ao comunicar com o Stripe.');
    } finally {
      setIsCheckingOut(false);
    }
  };

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
