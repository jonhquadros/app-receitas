-- ==============================================================================
-- FASE 4 — CONCESSÃO DE PERMISSÕES PARA OPERAÇÕES ADMINISTRATIVAS (RLS)
-- ==============================================================================

-- 1. CONCEDER PERMISSÕES DE TABELA AO PAPEL AUTHENTICATED
-- (O RLS continuará filtrando estritamente: usuário comum é barrado, admin é permitido)
GRANT ALL ON public.recipes TO authenticated;
GRANT ALL ON public.recipe_ingredients TO authenticated;
GRANT ALL ON public.recipe_utensils TO authenticated;
GRANT ALL ON public.recipe_steps TO authenticated;
GRANT ALL ON public.recipe_tips TO authenticated;
GRANT ALL ON public.subscriptions TO authenticated;

-- 2. POLÍTICA DE ADMIN PARA RECEITAS E TABELAS FILHAS (USANDO public.is_admin())
DROP POLICY IF EXISTS "Admin gerencia receitas" ON public.recipes;
CREATE POLICY "Admin gerencia receitas"
ON public.recipes FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin gerencia ingredientes" ON public.recipe_ingredients;
CREATE POLICY "Admin gerencia ingredientes"
ON public.recipe_ingredients FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin gerencia utensilios" ON public.recipe_utensils;
CREATE POLICY "Admin gerencia utensilios"
ON public.recipe_utensils FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin gerencia passos" ON public.recipe_steps;
CREATE POLICY "Admin gerencia passos"
ON public.recipe_steps FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin gerencia dicas" ON public.recipe_tips;
CREATE POLICY "Admin gerencia dicas"
ON public.recipe_tips FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. POLÍTICA DE ASSINATURAS (USUÁRIO COMUM LÊ A SUA, ADMIN GERENCIA TODAS)
DROP POLICY IF EXISTS "Usuário lê sua própria assinatura" ON public.subscriptions;
CREATE POLICY "Usuário lê sua própria assinatura"
ON public.subscriptions FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admin gerencia assinaturas" ON public.subscriptions;
CREATE POLICY "Admin gerencia assinaturas"
ON public.subscriptions FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
