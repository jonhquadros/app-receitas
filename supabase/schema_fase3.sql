-- ========================================================
-- FASE 3: TABELA DE FAVORITOS E POLÍTICAS DE RLS NO SUPABASE
-- ========================================================

CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recipe_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT user_favorites_unique_recipe UNIQUE(user_id, recipe_id)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- 1. Política de Leitura: Usuários autenticados podem ver apenas os seus próprios favoritos
CREATE POLICY "Usuários podem ver seus próprios favoritos"
    ON public.user_favorites
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 2. Política de Inserção: Usuários podem salvar favoritos para o seu próprio ID
CREATE POLICY "Usuários podem salvar seus favoritos"
    ON public.user_favorites
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 3. Política de Exclusão: Usuários podem remover apenas os seus próprios favoritos
CREATE POLICY "Usuários podem remover seus favoritos"
    ON public.user_favorites
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Índices de alta performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_recipe_id ON public.user_favorites(recipe_id);
