-- Cobranças Pix de renovação (pix_cycle, "Pix a cada renovação").
-- NÃO APLICADA. Revisar antes de rodar no projeto alvmzypczzwzotjnvflc.
-- Uma linha por transação (transaction.waiting_payment). Uma fatura pode gerar
-- várias linhas: cada tentativa dentro da carência tem outro id e outro attempt.

create table if not exists public.renewal_charges (
  transaction_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id text not null,
  invoice_id text not null,
  attempt integer not null,
  amount_cents integer,
  pix_code text,
  pix_expires_at timestamptz,
  status text not null check (status in ('waiting_payment', 'expired', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists renewal_charges_user_status_idx
  on public.renewal_charges (user_id, status);

alter table public.renewal_charges enable row level security;

-- O cliente só lê as próprias cobranças. Escrita apenas pelo webhook (service_role).
drop policy if exists renewal_charges_select_own on public.renewal_charges;
create policy renewal_charges_select_own
  on public.renewal_charges
  for select
  to authenticated
  using (user_id = auth.uid());

revoke all on public.renewal_charges from anon, authenticated;
grant select on public.renewal_charges to authenticated;
grant all on public.renewal_charges to service_role;
