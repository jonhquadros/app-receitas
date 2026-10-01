-- ==============================================================================
-- INSERÇÃO DA RECEITA 004 DE TESTE (is_preview = true)
-- ==============================================================================

DO $$
DECLARE
    v_recipe_id UUID;
BEGIN
    -- Remove teste anterior se existir
    DELETE FROM public.recipes WHERE numero = 4;

    -- Inserir Receita Principal
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
        'Chá / Infusão',
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

    -- Inserir Ingredientes
    INSERT INTO public.recipe_ingredients (recipe_id, ordem, texto) VALUES
    (v_recipe_id, 1, '250 ml de água filtrada'),
    (v_recipe_id, 2, '1 colher de chá de sementes de erva-doce secas'),
    (v_recipe_id, 3, '5 folhas frescas de hortelã');

    -- Inserir Utensílios
    INSERT INTO public.recipe_utensils (recipe_id, ordem, texto) VALUES
    (v_recipe_id, 1, 'Panela pequena'),
    (v_recipe_id, 2, 'Peneira fina'),
    (v_recipe_id, 3, 'Xícara com tampa (ou um pires para tampar)');

    -- Inserir Passos
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

    -- Inserir Dicas do Seu Neco
    INSERT INTO public.recipe_tips (recipe_id, ordem, texto) VALUES
    (v_recipe_id, 1, '(1) Para a erva-doce soltar ainda mais o sabor, dê uma leve "esmagada" nas sementes com as costas de uma colher antes de colocar a água quente.'),
    (v_recipe_id, 2, '(2) Não deixe as folhas de hortelã abafadas por mais de 10 minutos, ou o chá pode escurecer e perder o frescor.');

END $$;
