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
export function statusFromEvent(event: string): AppStatus | null {
  switch (event) {
    case 'subscription.created': return 'incomplete';
    case 'subscription.trial_started': return 'trialing';
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
