import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserSubscription, SubscriptionPlan, SubscriptionStatus } from '../types/subscription';

export interface PixSubscriptionForm {
  plan: 'mensal' | 'anual';
  client_request_id: string;
  name: string;
  email: string;
  phone: string;
  document: { type: 'cpf' | 'cnpj'; number: string };
  address: {
    zip_code: string;
    street: string;
    street_number: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

export interface PixSubscriptionResult {
  subscriptionId: string;
  status: string;
  pixQrcode: string | null;
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  loading: boolean;
  hasAccess: boolean;
  isPastDue: boolean;
  checkSubscriptionStatus: () => Promise<UserSubscription | null>;
  createSubscription: (form: PixSubscriptionForm) => Promise<PixSubscriptionResult>;
  cancelSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Extrai a mensagem devolvida pela Edge Function, sem expor detalhes internos.
async function readFunctionError(error: unknown, fallback: string): Promise<string> {
  try {
    const response = (error as any).context;
    if (response && typeof response.json === 'function') {
      const payload = await response.json();
      if (typeof payload?.error === 'string' && payload.error) return payload.error;
    }
  } catch {
    // Sem corpo legível: usa a mensagem padrão.
  }
  return fallback;
}

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

  // Cria a assinatura Pix. A liberação do acesso só acontece depois da confirmação pelo webhook.
  const createSubscription = async (form: PixSubscriptionForm): Promise<PixSubscriptionResult> => {
    if (!user) throw new Error('Faça login antes de assinar.');
    if (!isSupabaseConfigured() || !supabase) throw new Error('Serviço indisponível no momento.');

    const { data, error } = await supabase.functions.invoke('create-uvvipay-subscription', {
      body: form,
    });

    if (error) {
      throw new Error(
        await readFunctionError(error, 'Não foi possível criar a assinatura. Tente novamente.')
      );
    }
    if (!data?.subscription_id) {
      throw new Error('Resposta inesperada do serviço de pagamento. Tente novamente.');
    }

    await fetchSubscription();
    return {
      subscriptionId: String(data.subscription_id),
      status: String(data.status ?? 'incomplete'),
      pixQrcode: data.pix?.qrcode ?? null,
    };
  };

  // Pede o cancelamento. O status final chega pelo webhook subscription.cancelled.
  const cancelSubscription = async (): Promise<void> => {
    if (!isSupabaseConfigured() || !supabase) throw new Error('Serviço indisponível no momento.');

    const { error } = await supabase.functions.invoke('cancel-uvvipay-subscription', { body: {} });
    if (error) {
      throw new Error(await readFunctionError(error, 'Não foi possível cancelar agora. Tente novamente.'));
    }
    await fetchSubscription();
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        hasAccess,
        isPastDue,
        checkSubscriptionStatus: fetchSubscription,
        createSubscription,
        cancelSubscription,
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
