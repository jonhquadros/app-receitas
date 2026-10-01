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
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
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

export const STRIPE_PLANS: Record<'mensal' | 'anual', PlanConfig> = {
  mensal: {
    id: 'mensal',
    name: 'Plano Mensal',
    priceFormatted: 'R$ 19,90',
    pricePerMonthFormatted: 'R$ 19,90/mês',
    period: 'por mês',
    description: 'Acesso completo a todas as receitas e guias, com renovação mensal automática.',
  },
  anual: {
    id: 'anual',
    name: 'Plano Anual',
    priceFormatted: 'R$ 97,00',
    pricePerMonthFormatted: 'apenas R$ 8,08/mês',
    period: 'por ano',
    description: 'Acesso completo por 1 ano inteiro com o maior desconto da sabedoria do Seu Neco.',
    savingsBadge: 'Economize R$ 141,80 (59% OFF)',
    highlight: true,
  },
};
