import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserSubscription, SubscriptionPlan, SubscriptionStatus, RenewalCharge } from '../types/subscription';

export type PixMethod = 'pix_automatic' | 'pix_cycle';

export interface PixSubscriptionForm {
  plan: 'mensal' | 'anual';
  method: PixMethod;
  client_request_id: string;
  name: string;
  email: string;
  phone: string;
  document: { type: 'cpf' | 'cnpj'; number: string };
  // Só o Pix Automático envia endereço; no Pix a cada renovação ele não é necessário.
  address?: {
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
  pendingRenewal: RenewalCharge | null;
  renewalPixExpired: boolean;
  refreshRenewal: () => Promise<void>;
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
  const [pendingRenewal, setPendingRenewal] = useState<RenewalCharge | null>(null);
  const [renewalPixExpired, setRenewalPixExpired] = useState(false);

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

  const periodEndKey = subscription?.currentPeriodEnd ?? null;

  // Consulta somente cobranças já criadas pelo webhook. Nunca gera uma nova cobrança.
  const refreshRenewal = useCallback(async (): Promise<void> => {
    if (!user || !isSupabaseConfigured() || !supabase) {
      setPendingRenewal(null);
      setRenewalPixExpired(false);
      return;
    }

    setPendingRenewal(null);
    setRenewalPixExpired(false);

    // Só considera cobranças do ciclo atual: criadas nos 15 dias antes do fim do período.
    // Sem isso, um Pix vencido de meses atrás faria aparecer "O Pix venceu" de forma errada.
    const periodEndMs = periodEndKey ? new Date(periodEndKey).getTime() : NaN;
    const cycleStart = Number.isFinite(periodEndMs)
      ? new Date(periodEndMs - 15 * 24 * 60 * 60 * 1000).toISOString()
      : '1970-01-01T00:00:00.000Z';

    try {
      const { data, error } = await supabase
        .from('renewal_charges')
        .select('transaction_id, pix_code, pix_expires_at, amount_cents, status, created_at')
        .eq('status', 'waiting_payment')
        .gte('created_at', cycleStart)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('Aviso ao consultar Pix de renovação:', error.message);
        return;
      }

      if (!data) {
        // Se o webhook já marcou a cobrança como vencida, identifica esse estado sem expor o código Pix.
        const { data: latestClosedCharge, error: closedError } = await supabase
          .from('renewal_charges')
          .select('status, created_at')
          .in('status', ['expired', 'paid'])
          .gte('created_at', cycleStart)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (closedError) {
          console.warn('Aviso ao consultar situação da última cobrança Pix:', closedError.message);
          return;
        }

        setRenewalPixExpired(latestClosedCharge?.status === 'expired');
        return;
      }

      const expiresAt = data.pix_expires_at ? new Date(data.pix_expires_at) : null;
      const isExpired = Boolean(expiresAt && Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() <= Date.now());

      if (!expiresAt || !Number.isFinite(expiresAt.getTime()) || isExpired || !data.pix_code) {
        setRenewalPixExpired(isExpired);
        return;
      }

      setPendingRenewal({
        transactionId: data.transaction_id,
        pixCode: data.pix_code,
        pixExpiresAt: data.pix_expires_at,
        amountCents: data.amount_cents,
        status: data.status,
        createdAt: data.created_at,
      });
    } catch (err) {
      console.warn('Erro ao consultar Pix de renovação:', err);
    }
  }, [user, periodEndKey]);

  const hasAccess = Boolean(
    isAdmin ||
      (subscription &&
        ['active', 'trialing'].includes(subscription.status) &&
        Boolean(subscription.currentPeriodEnd) &&
        new Date(subscription.currentPeriodEnd).getTime() > Date.now())
  );

  const isPastDue = Boolean(subscription && subscription.status === 'past_due');

  useEffect(() => {
    // Consulta ao montar o provider e quando o status de renovação mudar para past_due.
    refreshRenewal();
  }, [isPastDue, refreshRenewal]);

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
        pendingRenewal,
        renewalPixExpired,
        refreshRenewal,
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
