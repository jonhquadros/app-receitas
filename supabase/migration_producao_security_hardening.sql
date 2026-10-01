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

COMMIT;
