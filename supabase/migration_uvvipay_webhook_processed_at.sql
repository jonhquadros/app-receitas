-- Marca de conclusão dos eventos do webhook.
-- Sem ela, um evento interrompido no meio (timeout) deixava a linha de deduplicação
-- gravada e o reenvio da UvviPay era descartado como duplicado.
-- Com ela: processed_at nulo = em andamento ou interrompido; preenchido = concluído.

alter table public.uvvipay_webhook_events
  add column if not exists processed_at timestamptz;

-- Eventos já gravados antes desta migration foram processados com sucesso
-- (a versão anterior só gravava a linha depois de aceitar o evento).
update public.uvvipay_webhook_events
   set processed_at = received_at
 where processed_at is null;
