-- ==============================================================================
-- FASE 2: BANCO DE DADOS COMPLETO (SUPABASE POSTGRESQL + RLS + SEGURANÇA)
-- Aplicativo: Receitas Naturais do Seu Neco (350 Receitas)
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ==============================================================================
-- 2. TABELA DE ASSINATURAS (subscriptions - necessária para validação de acesso)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'incomplete', -- 'active', 'canceled', 'past_due', etc.
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABELA DE PERFIS DE USUÁRIO (profiles)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255),
    tema VARCHAR(20) NOT NULL DEFAULT 'automatico' CHECK (tema IN ('claro', 'escuro', 'automatico')),
    role VARCHAR(20) NOT NULL DEFAULT 'usuario' CHECK (role IN ('usuario', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. FUNÇÕES DE SEGURANÇA
-- ==============================================================================
-- Função SECURITY DEFINER para verificar se o usuário é admin sem causar recursão em RLS
CREATE OR REPLACE FUNCTION public.is_admin(user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    IF user_id_param IS NULL THEN
        RETURN FALSE;
    END IF;

    IF auth.role() = 'authenticated' AND user_id_param <> auth.uid() THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id_param AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM PUBLIC, anon;\nGRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- A. Verifica se o usuário possui assinatura ativa ou perfil admin
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF public.is_admin(user_id_param) THEN
        RETURN TRUE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.subscriptions
        WHERE user_id = user_id_param
          AND status IN ('active', 'trialing')
          AND COALESCE(periodo_atual_fim, current_period_end) IS NOT NULL
          AND COALESCE(periodo_atual_fim, current_period_end) > NOW()
    );
END;
$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- B. Trava de segurança: impede que usuário comum altere seu próprio role para 'admin'
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        IF NOT (
            auth.role() = 'service_role' OR 
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        ) THEN
            RAISE EXCEPTION 'Apenas administradores podem alterar o nível de permissão (role).';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- ==============================================================================
-- 5. TABELA PRINCIPAL DE RECEITAS (recipes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero INTEGER NOT NULL UNIQUE CHECK (numero >= 1 AND numero <= 350),
    titulo VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    uso_tradicional TEXT NOT NULL,
    tempo_preparo_min INTEGER NOT NULL DEFAULT 0,
    tempo_cozimento_infusao_min INTEGER NOT NULL DEFAULT 0,
    tempo_total_min INTEGER NOT NULL DEFAULT 0,
    rendimento VARCHAR(100) NOT NULL,
    como_utilizar TEXT NOT NULL,
    melhor_momento TEXT,
    armazenamento TEXT NOT NULL,
    substituicoes TEXT,
    atencao TEXT NOT NULL,
    is_preview BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. TABELAS FILHAS (1:N) COM RELACIONAMENTOS ESTREITOS E ON DELETE CASCADE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    ordem INTEGER NOT NULL,
    texto TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.recipe_utensils (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    ordem INTEGER NOT NULL,
    texto TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.recipe_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    ordem INTEGER NOT NULL,
    texto TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.recipe_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    ordem INTEGER NOT NULL,
    texto TEXT NOT NULL
);

-- ==============================================================================
-- 7. TABELAS COMPLEMENTARES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ingredient_guide (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_popular VARCHAR(150) NOT NULL,
    nome_cientifico VARCHAR(150),
    como_escolher TEXT,
    como_lavar TEXT,
    como_preparar TEXT,
    como_armazenar TEXT,
    como_utilizar TEXT,
    cuidados TEXT,
    interacoes TEXT,
    quem_deve_ter_atencao TEXT
);

CREATE TABLE IF NOT EXISTS public.techniques (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    quando_usar TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.measures_guide (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medida VARCHAR(100) NOT NULL,
    equivalencia VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.shopping_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('basica', 'economica', '7_dias', '30_dias')),
    grupo VARCHAR(50) NOT NULL CHECK (grupo IN ('frutas', 'folhas', 'ervas', 'raizes', 'especiarias', 'complementares')),
    itens JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS public.calendar_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dia INTEGER NOT NULL UNIQUE CHECK (dia >= 1 AND dia <= 30),
    receitas INTEGER[] NOT NULL DEFAULT '{}',
    observacao TEXT
);

CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_recipe_favorite UNIQUE (user_id, recipe_id)
);

CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.recipe_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    CONSTRAINT uq_recipe_tag UNIQUE (recipe_id, tag_id)
);

-- ==============================================================================
-- 8. ÍNDICES DE PERFORMANCE E BUSCA TEXTUAL (FTS)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_recipes_numero ON public.recipes(numero);
CREATE INDEX IF NOT EXISTS idx_recipes_categoria ON public.recipes(categoria);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON public.recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_utensils_recipe_id ON public.recipe_utensils(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe_id ON public.recipe_steps(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_tips_recipe_id ON public.recipe_tips(recipe_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);

CREATE OR REPLACE FUNCTION public.recipes_search_vector(
    titulo TEXT,
    categoria TEXT,
    uso TEXT
) RETURNS tsvector AS $$
BEGIN
    RETURN (
        setweight(to_tsvector('portuguese', unaccent(coalesce(titulo, ''))), 'A') ||
        setweight(to_tsvector('portuguese', unaccent(coalesce(categoria, ''))), 'B') ||
        setweight(to_tsvector('portuguese', unaccent(coalesce(uso, ''))), 'C')
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE INDEX IF NOT EXISTS idx_recipes_fts ON public.recipes 
USING gin(recipes_search_vector(titulo, categoria, uso_tradicional));

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_fts ON public.recipe_ingredients 
USING gin(to_tsvector('portuguese', unaccent(texto)));

-- ==============================================================================
-- 9. HABILITAÇÃO DO ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_utensils ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_guide ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measures_guide ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 10. CONCESSÃO DE PRIVILÉGIOS POSTGRESQL PARA AS ROLES DO SUPABASE (CRÍTICO)
-- ==============================================================================
-- Sem estes GRANTs, o PostgreSQL bloqueia o PostgREST antes da avaliação de RLS com erro 42501
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Leitura de receitas (o filtro real é aplicado pelas políticas de RLS abaixo)
GRANT SELECT ON public.recipes TO anon, authenticated;
GRANT SELECT ON public.recipe_ingredients TO anon, authenticated;
GRANT SELECT ON public.recipe_utensils TO anon, authenticated;
GRANT SELECT ON public.recipe_steps TO anon, authenticated;
GRANT SELECT ON public.recipe_tips TO anon, authenticated;
GRANT SELECT ON public.tags TO anon, authenticated;
GRANT SELECT ON public.recipe_tags TO anon, authenticated;

-- Tabelas auxiliares
GRANT SELECT ON public.ingredient_guide TO authenticated;
GRANT SELECT ON public.techniques TO authenticated;
GRANT SELECT ON public.measures_guide TO authenticated;
GRANT SELECT ON public.shopping_lists TO authenticated;
GRANT SELECT ON public.calendar_days TO authenticated;

-- Perfis, assinaturas e favoritos
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;

-- Funções
GRANT EXECUTE ON FUNCTION public.has_active_subscription(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.recipes_search_vector(TEXT, TEXT, TEXT) TO anon, authenticated;

-- ==============================================================================
-- 11. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- A. RECEITAS (recipes)
DROP POLICY IF EXISTS "Leitura de receitas: preview público ou assinante ativo" ON public.recipes;
CREATE POLICY "Leitura de receitas: preview público ou assinante ativo"
ON public.recipes FOR SELECT
USING (
    is_preview = true
    OR (
        auth.role() = 'authenticated'
        AND public.has_active_subscription(auth.uid())
    )
);

DROP POLICY IF EXISTS "Admin gerencia receitas" ON public.recipes;
CREATE POLICY "Admin gerencia receitas"
ON public.recipes FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- B. TABELAS FILHAS (Ingredientes, Utensílios, Passos, Dicas)
DROP POLICY IF EXISTS "Leitura de ingredientes via regra da receita" ON public.recipe_ingredients;
CREATE POLICY "Leitura de ingredientes via regra da receita"
ON public.recipe_ingredients FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.recipes r 
        WHERE r.id = recipe_id 
          AND (r.is_preview = true OR (auth.role() = 'authenticated' AND public.has_active_subscription(auth.uid())))
    )
);

DROP POLICY IF EXISTS "Leitura de utensílios via regra da receita" ON public.recipe_utensils;
CREATE POLICY "Leitura de utensílios via regra da receita"
ON public.recipe_utensils FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.recipes r 
        WHERE r.id = recipe_id 
          AND (r.is_preview = true OR (auth.role() = 'authenticated' AND public.has_active_subscription(auth.uid())))
    )
);

DROP POLICY IF EXISTS "Leitura de passos via regra da receita" ON public.recipe_steps;
CREATE POLICY "Leitura de passos via regra da receita"
ON public.recipe_steps FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.recipes r 
        WHERE r.id = recipe_id 
          AND (r.is_preview = true OR (auth.role() = 'authenticated' AND public.has_active_subscription(auth.uid())))
    )
);

DROP POLICY IF EXISTS "Leitura de dicas via regra da receita" ON public.recipe_tips;
CREATE POLICY "Leitura de dicas via regra da receita"
ON public.recipe_tips FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.recipes r 
        WHERE r.id = recipe_id 
          AND (r.is_preview = true OR (auth.role() = 'authenticated' AND public.has_active_subscription(auth.uid())))
    )
);

-- C. FAVORITOS (favorites)
DROP POLICY IF EXISTS "Usuário lê seus próprios favoritos" ON public.favorites;
CREATE POLICY "Usuário lê seus próprios favoritos"
ON public.favorites FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuário insere seus próprios favoritos" ON public.favorites;
CREATE POLICY "Usuário insere seus próprios favoritos"
ON public.favorites FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuário remove seus próprios favoritos" ON public.favorites;
CREATE POLICY "Usuário remove seus próprios favoritos"
ON public.favorites FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- D. PERFIS (profiles) - Com proteção contra recursão e controle de admin
DROP POLICY IF EXISTS "Usuário lê seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuário lê seu próprio perfil"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Usuário atualiza seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuário atualiza seu próprio perfil"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (
    public.is_admin()
    OR
    (
        auth.uid() = id
        AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Inserção automática de perfil no signup" ON public.profiles;
CREATE POLICY "Inserção automática de perfil no signup"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- E. GUIAS E CONTEÚDOS
DROP POLICY IF EXISTS "Leitura de guia de ingredientes" ON public.ingredient_guide;
CREATE POLICY "Leitura de guia de ingredientes" ON public.ingredient_guide FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Leitura de técnicas" ON public.techniques;
CREATE POLICY "Leitura de técnicas" ON public.techniques FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Leitura de guia de medidas" ON public.measures_guide;
CREATE POLICY "Leitura de guia de medidas" ON public.measures_guide FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Leitura de listas de compras" ON public.shopping_lists;
CREATE POLICY "Leitura de listas de compras" ON public.shopping_lists FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Leitura de calendário" ON public.calendar_days;
CREATE POLICY "Leitura de calendário" ON public.calendar_days FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Leitura de tags" ON public.tags;
CREATE POLICY "Leitura de tags" ON public.tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura de recipe_tags" ON public.recipe_tags;
CREATE POLICY "Leitura de recipe_tags" ON public.recipe_tags FOR SELECT USING (true);

-- F. ASSINATURAS (subscriptions)
DROP POLICY IF EXISTS "Usuário lê sua própria assinatura" ON public.subscriptions;
CREATE POLICY "Usuário lê sua própria assinatura"
ON public.subscriptions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ==============================================================================
-- 12. INSERÇÃO DA RECEITA 004 ORIGINAL DE TESTE (is_preview = true)
-- ==============================================================================
DO $$
DECLARE
    v_recipe_id UUID;
BEGIN
    DELETE FROM public.recipes WHERE numero = 4;

    INSERT INTO public.recipes (
        id,
        numero,
        titulo,
        categoria,
        uso_tradicional,
        tempo_preparo_min,
        tempo_cozimento_infusao_min,
        tempo_total_min,
        rendimento,
        como_utilizar,
        melhor_momento,
        armazenamento,
        substituicoes,
        atencao,
        is_preview
    ) VALUES (
        '00000000-0000-0000-0000-000000000004',
        4,
        'INFUSÃO DE ERVA-DOCE COM HORTELÃ',
        'Infusões',
        'Popularmente consumida após refeições mais pesadas para trazer sensação de leveza e conforto na barriga. A mistura das sementes com a folha fresca cria um sabor doce e ao mesmo tempo refrescante.',
        2,
        7,
        9,
        '1 porção (1 xícara)',
        'Beber morno, em pequenos goles, aproveitando o frescor da hortelã.',
        'Cerca de 30 minutos após o almoço ou jantar.',
        'Deve ser consumido na hora do preparo.',
        'Se não tiver hortelã fresca, pode usar meia colher de chá de hortelã desidratada.',
        'O consumo excessivo de erva-doce não é recomendado para gestantes; sempre consulte um profissional de saúde. Pessoas com alergia a plantas da família da cenoura e aipo podem ter sensibilidade à erva-doce.',
        true
    ) RETURNING id INTO v_recipe_id;

    INSERT INTO public.recipe_ingredients (recipe_id, ordem, texto) VALUES
    (v_recipe_id, 1, '250 ml de água filtrada'),
    (v_recipe_id, 2, '1 colher de chá de sementes de erva-doce secas'),
    (v_recipe_id, 3, '5 folhas frescas de hortelã');

    INSERT INTO public.recipe_utensils (recipe_id, ordem, texto) VALUES
    (v_recipe_id, 1, 'Panela pequena'),
    (v_recipe_id, 2, 'Peneira fina'),
    (v_recipe_id, 3, 'Xícara com tampa (ou um pires para tampar)');

    INSERT INTO public.recipe_steps (recipe_id, ordem, texto) VALUES
    (v_recipe_id, 1, 'Lave bem as folhas de hortelã em água corrente e separe as sementes de erva-doce.'),
    (v_recipe_id, 2, 'Coloque os 250 ml de água na panela e leve ao fogo alto até começar a ferver.'),
    (v_recipe_id, 3, 'Assim que a água ferver, desligue o fogo imediatamente.'),
    (v_recipe_id, 4, 'Coloque as sementes de erva-doce e as folhas de hortelã dentro da panela (ou diretamente na sua xícara, se preferir).'),
    (v_recipe_id, 5, 'Despeje a água quente por cima das ervas.'),
    (v_recipe_id, 6, 'Tampe a panela (ou a xícara com um pires) para não deixar o vapor escapar.'),
    (v_recipe_id, 7, 'Aguarde o tempo de infusão de 5 a 7 minutos.'),
    (v_recipe_id, 8, 'Coe usando a peneira fina.'),
    (v_recipe_id, 9, 'Sirva em seguida.');

    INSERT INTO public.recipe_tips (recipe_id, ordem, texto) VALUES
    (v_recipe_id, 1, '(1) Para a erva-doce soltar ainda mais o sabor, dê uma leve "esmagada" nas sementes com as costas de uma colher antes de colocar a água quente.'),
    (v_recipe_id, 2, '(2) Não deixe as folhas de hortelã abafadas por mais de 10 minutos, ou o chá pode escurecer e perder o frescor.');
END $$;
