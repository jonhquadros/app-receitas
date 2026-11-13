-- Suporte ao provedor UvviPay (Pix Automático).
-- JÁ APLICADO no projeto alvmzypczzwzotjnvflc (Supabase), versão 20261109145129,
-- nome "uvvipay_phase1_support". Este arquivo serve como histórico e é idempotente.
-- Não remove nada do Stripe.

-- 1. Colunas novas em subscriptions
alter table public.subscriptions
  add column if not exists payment_provider varchar not null default 'stripe',
  add column if not exists uvvipay_customer_id varchar,
  add column if not exists uvvipay_subscription_id varchar,
  add column if not exists uvvipay_plan_id varchar;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'subscriptions_payment_provider_check') then
    alter table public.subscriptions
      add constraint subscriptions_payment_provider_check
      check (payment_provider in ('stripe', 'uvvipay'));
  end if;
end $$;

create unique index if not exists subscriptions_uvvipay_subscription_id_key
  on public.subscriptions (uvvipay_subscription_id)
  where uvvipay_subscription_id is not null;

-- 2. Deduplicação de webhooks (event_id)
create table if not exists public.uvvipay_webhook_events (
  event_id text primary key,
  event_type text not null,
  subscription_id text,
  received_at timestamptz not null default now()
);
alter table public.uvvipay_webhook_events enable row level security;

-- 3. Idempotência da criação de assinatura
create table if not exists public.uvvipay_creation_requests (
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key text not null,
  payload_hash text not null,
  subscription_id text,
  created_at timestamptz not null default now(),
  primary key (user_id, idempotency_key)
);
alter table public.uvvipay_creation_requests enable row level security;

-- 4. Limite de requisições por janela de tempo
create table if not exists public.rate_limit_hits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key, window_start)
);
alter table public.rate_limit_hits enable row level security;

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz;
  v_hits integer;
begin
  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into public.rate_limit_hits as r (key, window_start, hits)
  values (p_key, v_window, 1)
  on conflict (key, window_start)
  do update set hits = r.hits + 1
  returning hits into v_hits;

  return v_hits <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
