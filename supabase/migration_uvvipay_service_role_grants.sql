-- Permissões do service_role nas tabelas novas da UvviPay.
-- JÁ APLICADO no projeto alvmzypczzwzotjnvflc (Supabase), versão 20261110111955,
-- nome "uvvipay_service_role_grants". Este arquivo serve como histórico e é idempotente.
-- As Edge Functions usam o service role; sem estas permissões a gravação falha com o erro 42501.
-- Nenhuma permissão é concedida a anon ou authenticated.

grant select, insert, update, delete on public.uvvipay_creation_requests to service_role;
grant select, insert, update, delete on public.uvvipay_webhook_events to service_role;
grant select, insert, update, delete on public.rate_limit_hits to service_role;
