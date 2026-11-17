-- Remove permissões desnecessárias de anon e authenticated nas tabelas novas da UvviPay.
-- JÁ APLICADO no projeto alvmzypczzwzotjnvflc (Supabase), versão 20261116113710,
-- nome "uvvipay_revoke_anon_authenticated". Este arquivo serve como histórico e é idempotente.
-- Antes: anon e authenticated tinham REFERENCES, TRIGGER e TRUNCATE (sem acesso a dados pela API).
-- Depois: nenhuma permissão para anon/authenticated. O service_role (Edge Functions) não é afetado.

revoke all on public.uvvipay_creation_requests from anon, authenticated;
revoke all on public.uvvipay_webhook_events from anon, authenticated;
revoke all on public.rate_limit_hits from anon, authenticated;
