// Mapeamento entre eventos/status da UvviPay e o status usado no app (tabela subscriptions).

export type AppStatus = 'active' | 'incomplete' | 'trialing' | 'past_due' | 'canceled';

export function statusFromUvviPay(status: string): AppStatus | null {
  switch (status) {
    case 'ACTIVE': return 'active';
    case 'PENDING': return 'incomplete';
    case 'TRIAL': return 'trialing';
    case 'PAST_DUE': return 'past_due';
    case 'CANCELLED': return 'canceled';
    default: return null;
  }
}

// Eventos de assinatura que alteram o status. transaction.* só é registrado.
// subscription.created e subscription.trial_started NÃO alteram o status: a função de criação
// já grava o status inicial, e esses eventos podem chegar depois de subscription.activated
// (fora de ordem), o que desfaria uma ativação já confirmada.
export function statusFromEvent(event: string): AppStatus | null {
  switch (event) {
    case 'subscription.activated':
    case 'subscription.renewed':
    case 'subscription.reactivated': return 'active';
    case 'subscription.past_due': return 'past_due';
    case 'subscription.cancelled':
    case 'subscription.completed': return 'canceled';
    default: return null;
  }
}

export const isSubscriptionEvent = (event: string) => event.startsWith('subscription.');
