-- Production security hardening: RLS entitlement and RPC permissions.
BEGIN;

CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id_param UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF user_id_param IS NULL THEN RETURN FALSE; END IF;
  IF public.is_admin(user_id_param) THEN RETURN TRUE; END IF;
  IF EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_id_param AND manual_override = TRUE
      AND status IN ('active','trialing')
  ) THEN RETURN TRUE; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_id_param AND status IN ('active','trialing')
      AND COALESCE(periodo_atual_fim,current_period_end) IS NOT NULL
      AND COALESCE(periodo_atual_fim,current_period_end) > NOW()
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.has_active_subscription(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_profile() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_role_escalation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;


DROP POLICY IF EXISTS "Leitura de calendário" ON public.calendar_days;
CREATE POLICY "Leitura de calendário" ON public.calendar_days FOR SELECT TO authenticated
USING (public.has_active_subscription(auth.uid()));

DROP POLICY IF EXISTS "Leitura de guia de ingredientes" ON public.ingredient_guide;
CREATE POLICY "Leitura de guia de ingredientes" ON public.ingredient_guide FOR SELECT TO authenticated
USING (public.has_active_subscription(auth.uid()));

DROP POLICY IF EXISTS "Leitura de guia de medidas" ON public.measures_guide;
CREATE POLICY "Leitura de guia de medidas" ON public.measures_guide FOR SELECT TO authenticated
USING (public.has_active_subscription(auth.uid()));

DROP POLICY IF EXISTS "Leitura de listas de compras" ON public.shopping_lists;
CREATE POLICY "Leitura de listas de compras" ON public.shopping_lists FOR SELECT TO authenticated
USING (public.has_active_subscription(auth.uid()));

DROP POLICY IF EXISTS "Leitura de técnicas" ON public.techniques;
CREATE POLICY "Leitura de técnicas" ON public.techniques FOR SELECT TO authenticated
USING (public.has_active_subscription(auth.uid()));

COMMIT;
