-- ==============================================================================
-- FASE 4 — MIGRAÇÃO DE AUTH, PROFILES E ADMIN NO SUPABASE
-- ==============================================================================

-- 1. FUNÇÃO SECURITY DEFINER PARA CHECAGEM DE ADMIN (EVITA RECURSÃO INFINITA EM RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    IF user_id_param IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id_param AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon, authenticated;

-- 2. AJUSTE DE has_active_subscription PARA USAR is_admin() SEM RECURSÃO
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.has_active_subscription(UUID) TO anon, authenticated;

-- 3. POLÍTICAS LIVRES DE RECURSÃO EM public.profiles
DROP POLICY IF EXISTS "Usuário lê seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuário lê seu próprio perfil"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Usuário atualiza seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuário atualiza seu próprio perfil"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (
    -- Admin pode alterar tudo, inclusive promover/rebaixar outros usuários
    public.is_admin()
    OR
    -- Usuário normal só altera seu próprio perfil e NÃO pode alterar seu papel (role)
    (
        auth.uid() = id 
        AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Inserção automática de perfil no signup" ON public.profiles;
CREATE POLICY "Inserção automática de perfil no signup"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- 4. TRIGGER COM LOCK EXCLUSIVO: O PRIMEIRO USUÁRIO É ADMIN, OS SEGUINTES SÃO 'USUARIO'
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
DECLARE
    v_profile_count INTEGER;
    v_assigned_role VARCHAR(20) := 'usuario';
    v_display_name TEXT;
BEGIN
    -- Bloqueio exclusivo para evitar race conditions em cadastros simultâneos
    LOCK TABLE public.profiles IN EXCLUSIVE MODE;

    SELECT COUNT(*) INTO v_profile_count FROM public.profiles;

    IF v_profile_count = 0 THEN
        v_assigned_role := 'admin';
    ELSE
        v_assigned_role := 'usuario';
    END IF;

    v_display_name := COALESCE(
        NEW.raw_user_meta_data->>'nome',
        split_part(NEW.email, '@', 1)
    );

    INSERT INTO public.profiles (id, nome, tema, role)
    VALUES (
        NEW.id,
        v_display_name,
        'automatico',
        v_assigned_role
    )
    ON CONFLICT (id) DO UPDATE
    SET nome = COALESCE(public.profiles.nome, EXCLUDED.nome);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Disparador no auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_profile();

-- 5. CRIAR PERFIS PARA USUÁRIOS JÁ EXISTENTES NO AUTH (SE HOUVER)
-- O primeiro usuário criado (usuario_a) recebe 'admin', os seguintes recebem 'usuario'
DO $$
DECLARE
    u RECORD;
    v_count INTEGER;
    v_role VARCHAR(20);
BEGIN
    LOCK TABLE public.profiles IN EXCLUSIVE MODE;
    
    FOR u IN (SELECT id, email, raw_user_meta_data, created_at FROM auth.users ORDER BY created_at ASC) LOOP
        SELECT COUNT(*) INTO v_count FROM public.profiles;
        
        IF v_count = 0 THEN
            v_role := 'admin';
        ELSE
            v_role := 'usuario';
        END IF;

        INSERT INTO public.profiles (id, nome, tema, role, created_at)
        VALUES (
            u.id,
            COALESCE(u.raw_user_meta_data->>'nome', split_part(u.email, '@', 1)),
            'automatico',
            v_role,
            u.created_at
        )
        ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

-- 6. POLÍTICA DE ASSINATURAS (Admin pode visualizar e atualizar assinaturas de todos)
DROP POLICY IF EXISTS "Usuário lê sua própria assinatura" ON public.subscriptions;
CREATE POLICY "Usuário lê sua própria assinatura"
ON public.subscriptions FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admin gerencia assinaturas" ON public.subscriptions;
CREATE POLICY "Admin gerencia assinaturas"
ON public.subscriptions FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
