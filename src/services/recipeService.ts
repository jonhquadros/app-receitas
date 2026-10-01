import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Recipe } from '../types/recipe';
import { MOCK_RECIPES } from '../data/mockRecipes';

/**
 * Converte o formato do banco de dados (Supabase) para a interface do frontend
 */
export function mapDbRecipeToUi(dbItem: any): Recipe {
  const ingredients = (dbItem.recipe_ingredients || [])
    .sort((a: any, b: any) => a.ordem - b.ordem)
    .map((i: any) => i.texto);

  const utensils = (dbItem.recipe_utensils || [])
    .sort((a: any, b: any) => a.ordem - b.ordem)
    .map((u: any) => u.texto);

  const steps = (dbItem.recipe_steps || [])
    .sort((a: any, b: any) => a.ordem - b.ordem)
    .map((s: any) => s.texto);

  const seuNecoTips = (dbItem.recipe_tips || [])
    .sort((a: any, b: any) => a.ordem - b.ordem)
    .map((t: any) => t.texto);

  const numStr = String(dbItem.numero).padStart(3, '0');

  // Determinar categoria simplificada para filtros
  let mainCategory: Recipe['category'] = 'Infusões';
  const catLower = (dbItem.categoria || '').toLowerCase();
  if (catLower.includes('chá')) mainCategory = 'Chás';
  else if (catLower.includes('suco')) mainCategory = 'Sucos';
  else if (catLower.includes('bebida')) mainCategory = 'Bebidas';
  else if (catLower.includes('tradicional') || catLower.includes('xarope'))
    mainCategory = 'Preparações tradicionais';
  else if (catLower.includes('infus')) mainCategory = 'Infusões';

  const prepTimeDisplay = `Preparação ${dbItem.tempo_preparo_min} min; Infusão ${dbItem.tempo_cozimento_infusao_min} min; Total ${dbItem.tempo_total_min} min`;
  const totalMin = Number(dbItem.tempo_total_min) || 10;

  return {
    id: dbItem.id || String(dbItem.numero),
    code: `RECEITA ${numStr}`,
    title: dbItem.titulo,
    category: mainCategory,
    categoryDisplay: dbItem.categoria,
    traditionalUse: dbItem.uso_tradicional,
    ingredients: ingredients.length > 0 ? ingredients : dbItem.ingredients || [],
    utensils: utensils.length > 0 ? utensils : dbItem.utensils || [],
    prepTime: prepTimeDisplay,
    totalMinutes: totalMin,
    totalTimeDisplay: `${totalMin} min`,
    yield: dbItem.rendimento,
    steps: steps.length > 0 ? steps : dbItem.steps || [],
    howToUse: dbItem.como_utilizar,
    bestMoment: dbItem.melhor_momento || '',
    storage: dbItem.armazenamento,
    substitutions: dbItem.substituicoes || '',
    seuNecoTips: seuNecoTips.length > 0 ? seuNecoTips : dbItem.seuNecoTips || [],
    attention: dbItem.atencao,
    isRecipeOfDay: dbItem.numero === 4,
    isPreview: Boolean(dbItem.is_preview) || dbItem.numero === 4 || dbItem.numero === 1 || dbItem.numero === 2,
  };
}

/**
 * Busca receitas com paginação e filtros no Supabase para suportar o acervo de 350 receitas
 * sem sobrecarregar a memória do navegador
 */
export interface SearchRecipeOptions {
  query?: string;
  category?: string;
  maxMinutes?: number;
  page?: number;
  pageSize?: number;
}

export interface SearchRecipeResult {
  recipes: Recipe[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export async function searchRecipesPaginated(
  options: SearchRecipeOptions = {}
): Promise<SearchRecipeResult> {
  const page = options.page || 1;
  const pageSize = options.pageSize || 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (!isSupabaseConfigured() || !supabase) {
    // Fallback local se o Supabase não estiver configurado
    let filtered = [...MOCK_RECIPES];
    if (options.category && options.category !== 'Todas') {
      filtered = filtered.filter(
        (r) => r.category === options.category || r.categoryDisplay.includes(options.category!)
      );
    }
    if (options.maxMinutes) {
      filtered = filtered.filter((r) => r.totalMinutes <= options.maxMinutes!);
    }
    if (options.query && options.query.trim().length >= 2) {
      const q = options.query.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.traditionalUse.toLowerCase().includes(q) ||
          r.ingredients.some((ing) => ing.toLowerCase().includes(q))
      );
    }
    const paged = filtered.slice(from, to + 1);
    return {
      recipes: paged,
      totalCount: filtered.length,
      page,
      pageSize,
      hasMore: to + 1 < filtered.length,
    };
  }

  try {
    let queryBuilder = supabase
      .from('recipes')
      .select(
        `
        *,
        recipe_ingredients (ordem, texto),
        recipe_utensils (ordem, texto),
        recipe_steps (ordem, texto),
        recipe_tips (ordem, texto)
      `,
        { count: 'exact' }
      )
      .order('numero', { ascending: true });

    if (options.category && options.category !== 'Todas') {
      queryBuilder = queryBuilder.ilike('categoria', `%${options.category}%`);
    }

    if (options.maxMinutes) {
      queryBuilder = queryBuilder.lte('tempo_total_min', options.maxMinutes);
    }

    if (options.query && options.query.trim().length >= 2) {
      const cleanQ = options.query.trim();
      queryBuilder = queryBuilder.or(
        `titulo.ilike.%${cleanQ}%,uso_tradicional.ilike.%${cleanQ}%,categoria.ilike.%${cleanQ}%`
      );
    }

    const { data, count, error } = await queryBuilder.range(from, to);

    if (error) {
      console.warn('Erro ao consultar Supabase paginado:', error.message);
      return {
        recipes: MOCK_RECIPES.slice(0, pageSize),
        totalCount: MOCK_RECIPES.length,
        page,
        pageSize,
        hasMore: false,
      };
    }

    const totalCount = count || 0;
    const dbRecipes = (data || []).map(mapDbRecipeToUi);

    // Se o banco contiver poucas receitas (ex: apenas a prévia #004),
    // mescla graciosamente com o catálogo mock sem duplicar a #004
    let combined = [...dbRecipes];
    if (totalCount < 5) {
      const dbIds = new Set(dbRecipes.map((r) => r.code));
      const mockFiltered = MOCK_RECIPES.filter((m) => !dbIds.has(m.code));
      combined = [...dbRecipes, ...mockFiltered];
    }

    return {
      recipes: combined,
      totalCount: Math.max(totalCount, combined.length),
      page,
      pageSize,
      hasMore: to + 1 < totalCount,
    };
  } catch (err) {
    console.warn('Falha na busca paginada do Supabase:', err);
    return {
      recipes: MOCK_RECIPES.slice(0, pageSize),
      totalCount: MOCK_RECIPES.length,
      page,
      pageSize,
      hasMore: false,
    };
  }
}
export async function fetchRecipes(): Promise<Recipe[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return MOCK_RECIPES;
  }

  try {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (ordem, texto),
        recipe_utensils (ordem, texto),
        recipe_steps (ordem, texto),
        recipe_tips (ordem, texto)
      `)
      .order('numero', { ascending: true });

    if (error) {
      console.warn('Aviso ao carregar do Supabase:', error.message);
      return MOCK_RECIPES;
    }

    if (!data || data.length === 0) {
      // Se a tabela ainda não tiver dados inseridos pelo usuário, usa o fallback de teste
      return MOCK_RECIPES;
    }

    return data.map(mapDbRecipeToUi);
  } catch (err) {
    console.warn('Falha na conexão com Supabase:', err);
    return MOCK_RECIPES;
  }
}
