export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'trialing'
  | 'unpaid'
  | 'none';

export type SubscriptionPlan = 'mensal' | 'anual' | 'manual' | 'vitalicio';

export interface UserSubscription {
  id?: string;
  userId: string;
  status: SubscriptionStatus;
  plan?: SubscriptionPlan;
  currentPeriodEnd?: string | null;
  manualOverride?: boolean;
  updatedAt?: string;
}

export interface PlanConfig {
  id: 'mensal' | 'anual';
  name: string;
  priceFormatted: string;
  pricePerMonthFormatted: string;
  period: string;
  description: string;
  savingsBadge?: string;
  highlight?: boolean;
}

// Valores vigentes. O backend é a fonte final do valor cobrado.
export const PLANS: Record<'mensal' | 'anual', PlanConfig> = {
  mensal: {
    id: 'mensal',
    name: 'Plano Mensal',
    priceFormatted: 'R$ 9,90',
    pricePerMonthFormatted: 'R$ 9,90/mês',
    period: 'por mês',
    description: 'Acesso completo a todas as receitas e guias, com renovação mensal automática via Pix.',
  },
  anual: {
    id: 'anual',
    name: 'Plano Anual',
    priceFormatted: 'R$ 89,00',
    pricePerMonthFormatted: 'apenas R$ 7,42/mês',
    period: 'por ano',
    description: 'Acesso completo por 1 ano inteiro com renovação anual via Pix.',
    savingsBadge: 'Economize R$ 29,80 (25% OFF)',
    highlight: true,
  },
};
