-- ==============================================================================
-- MIGRAÇÃO FASE 7: CAMPOS ADICIONAIS NA TABELA SUBSCRIPTIONS
-- ==============================================================================

-- 1. Adicionar colunas caso ainda não existam
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS plano VARCHAR(50) DEFAULT 'mensal',
ADD COLUMN IF NOT EXISTS periodo_atual_fim TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS manual_override BOOLEAN DEFAULT FALSE;

-- 2. Sincronizar periodo_atual_fim com current_period_end se houver registros antigos
UPDATE public.subscriptions 
SET periodo_atual_fim = current_period_end 
WHERE periodo_atual_fim IS NULL AND current_period_end IS NOT NULL;

-- 3. Assegurar permissões e GRANTs para authenticated
GRANT SELECT ON public.subscriptions TO authenticated;

-- 4. Assegurar políticas RLS
DROP POLICY IF EXISTS "Usuário lê sua própria assinatura" ON public.subscriptions;
CREATE POLICY "Usuário lê sua própria assinatura"
ON public.subscriptions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin gerencia assinaturas" ON public.subscriptions;
CREATE POLICY "Admin gerencia assinaturas"
ON public.subscriptions FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. Atualizar função de verificação de assinatura ativa
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Se for admin, acesso sempre liberado
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id_param AND role = 'admin') THEN
        RETURN TRUE;
    END IF;

    -- Verificar se possui assinatura ativa não expirada
    RETURN EXISTS (
        SELECT 1 FROM public.subscriptions 
        WHERE user_id = user_id_param 
          AND status IN ('active', 'trialing')
          AND (periodo_atual_fim IS NULL OR periodo_atual_fim > NOW() OR current_period_end > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.has_active_subscription(UUID) TO authenticated, anon;
