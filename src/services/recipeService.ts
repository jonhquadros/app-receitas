import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Recipe } from '../types/recipe';

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
    throw new Error('Supabase não está configurado.');
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
      queryBuilder = queryBuilder.ilike('categoria', `%\${options.category}%`);
    }

    if (options.maxMinutes) {
      queryBuilder = queryBuilder.lte('tempo_total_min', options.maxMinutes);
    }

    if (options.query && options.query.trim().length >= 2) {
      const cleanQ = options.query.trim();
      queryBuilder = queryBuilder.or(
        `titulo.ilike.%\${cleanQ}%,uso_tradicional.ilike.%\${cleanQ}%,categoria.ilike.%\${cleanQ}%`
      );
    }

    const { data, count, error } = await queryBuilder.range(from, to);

    if (error) {
      console.error('Erro ao consultar Supabase paginado:', error.message);
      throw new Error(error.message);
    }

    const recipes = (data || []).map(mapDbRecipeToUi);
    const totalCount = count || 0;

    return {
      recipes,
      totalCount,
      page,
      pageSize,
      hasMore: to + 1 < totalCount,
    };
  } catch (err) {
    console.error('Falha na busca paginada do Supabase:', err);
    throw err instanceof Error ? err : new Error('Falha ao carregar receitas.');
  }
}
export async function fetchRecipes(): Promise<Recipe[]> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase não está configurado.');
  }

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
    console.error('Falha ao carregar receitas:', error);
    throw new Error(error.message);
  }

  return (data || []).map(mapDbRecipeToUi);
}
