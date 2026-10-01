import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface BatchRecipeItem {
  numero: number;
  titulo: string;
  categoria: string;
  uso_tradicional: string;
  tempo_preparo_min: number;
  tempo_cozimento_infusao_min: number;
  tempo_total_min: number;
  rendimento: string;
  como_utilizar: string;
  melhor_momento?: string | null;
  armazenamento: string;
  substituicoes?: string | null;
  atencao: string;
  is_preview?: boolean;
  ingredientes: string[];
  utensilios?: string[];
  modo_preparo: string[];
  dicas_seu_neco?: string[];
}

export interface ValidationError {
  index: number;
  numero?: number;
  field: string;
  message: string;
}

export interface ImportResult {
  success: boolean;
  totalProcessed: number;
  inserted: number;
  validationErrors: ValidationError[];
  errors: string[];
}

/**
 * Validação rigorosa dos campos obrigatórios e tipos para cada receita
 */
export function validateRecipeItem(item: any, index: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof item.numero !== 'number' || isNaN(item.numero) || item.numero < 1 || item.numero > 350) {
    errors.push({
      index,
      numero: item.numero,
      field: 'numero',
      message: 'O número da receita deve ser um número inteiro entre 1 e 350.',
    });
  }

  const requiredStringFields = [
    { key: 'titulo', name: 'Título' },
    { key: 'categoria', name: 'Categoria' },
    { key: 'uso_tradicional', name: 'Uso tradicional' },
    { key: 'rendimento', name: 'Rendimento' },
    { key: 'como_utilizar', name: 'Como utilizar' },
    { key: 'armazenamento', name: 'Armazenamento' },
    { key: 'atencao', name: 'Atenção' },
  ];

  for (const { key, name } of requiredStringFields) {
    if (!item[key] || typeof item[key] !== 'string' || item[key].trim() === '') {
      errors.push({
        index,
        numero: item.numero,
        field: key,
        message: `O campo obrigatório "${name}" não foi informado.`,
      });
    }
  }

  if (!Array.isArray(item.ingredientes) || item.ingredientes.length === 0) {
    errors.push({
      index,
      numero: item.numero,
      field: 'ingredientes',
      message: 'A lista de ingredientes deve conter pelo menos 1 item.',
    });
  }

  if (!Array.isArray(item.modo_preparo) || item.modo_preparo.length === 0) {
    errors.push({
      index,
      numero: item.numero,
      field: 'modo_preparo',
      message: 'O modo de preparo (passos) deve conter pelo menos 1 passo.',
    });
  }

  return errors;
}

/**
 * Converte texto CSV (com suporte a delimitador por vírgula ou ponto-e-vírgula) para BatchRecipeItem[]
 * Itens de listas (ingredientes, utensilios, modo_preparo, dicas_seu_neco) usam "|" (pipe) como separador.
 */
export function parseRecipesCSV(csvText: string): BatchRecipeItem[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) return [];

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/"/g, ''));

  const recipes: BatchRecipeItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Split simples respeitando aspas
    const regex = new RegExp(`(?:^|${delimiter})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter}]*))`, 'g');
    const cols: string[] = [];
    let match;
    while ((match = regex.exec(rawLine)) !== null) {
      cols.push((match[1] ? match[1].replace(/""/g, '"') : match[2] || '').trim());
    }

    if (cols.length < headers.length) continue;

    const row: any = {};
    headers.forEach((header, idx) => {
      row[header] = cols[idx];
    });

    const parseList = (str?: string): string[] => {
      if (!str) return [];
      return str
        .split('|')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    };

    const recipe: BatchRecipeItem = {
      numero: parseInt(row.numero, 10),
      titulo: row.titulo || '',
      categoria: row.categoria || '',
      uso_tradicional: row.uso_tradicional || '',
      tempo_preparo_min: parseInt(row.tempo_preparo_min, 10) || 0,
      tempo_cozimento_infusao_min: parseInt(row.tempo_cozimento_infusao_min, 10) || 0,
      tempo_total_min: parseInt(row.tempo_total_min, 10) || 0,
      rendimento: row.rendimento || '',
      como_utilizar: row.como_utilizar || '',
      melhor_momento: row.melhor_momento || null,
      armazenamento: row.armazenamento || '',
      substituicoes: row.substituicoes || null,
      atencao: row.atencao || '',
      is_preview: row.is_preview === 'true' || row.is_preview === true,
      ingredientes: parseList(row.ingredientes),
      utensilios: parseList(row.utensilios),
      modo_preparo: parseList(row.modo_preparo),
      dicas_seu_neco: parseList(row.dicas_seu_neco),
    };

    recipes.push(recipe);
  }

  return recipes;
}

export function parseJsonRecipes(jsonText: string): { recipes: BatchRecipeItem[]; errors: string[] } {
  try {
    const parsed = JSON.parse(jsonText);
    const array = Array.isArray(parsed) ? parsed : [parsed];
    return { recipes: array, errors: [] };
  } catch (err: any) {
    return { recipes: [], errors: [err.message || 'JSON inválido'] };
  }
}

export function parseCsvRecipes(csvText: string): { recipes: BatchRecipeItem[]; errors: string[] } {
  try {
    const recipes = parseRecipesCSV(csvText);
    if (recipes.length === 0) {
      return {
        recipes: [],
        errors: ['Nenhuma linha de receita válida encontrada no CSV. Verifique os cabeçalhos.'],
      };
    }
    return { recipes, errors: [] };
  } catch (err: any) {
    return { recipes: [], errors: [err.message || 'Erro ao processar CSV'] };
  }
}

/**
 * Rotina para importar receitas em lote no Supabase
 * Suporta o formato JSON estruturado com validação de dados e tabelas normalizadas.
 */
export async function importRecipesBatch(
  recipes: BatchRecipeItem[],
  onProgress?: (current: number, total: number) => void
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    totalProcessed: recipes.length,
    inserted: 0,
    validationErrors: [],
    errors: [],
  };

  // 1. Validação prévia de todos os itens do lote
  const seenNumbers = new Set<number>();
  recipes.forEach((item, idx) => {
    const itemErrors = validateRecipeItem(item, idx);
    if (itemErrors.length > 0) {
      result.validationErrors.push(...itemErrors);
    }

    if (seenNumbers.has(item.numero)) {
      result.validationErrors.push({
        index: idx,
        numero: item.numero,
        field: 'numero',
        message: `Número de receita duplicado no lote: #${item.numero}`,
      });
    }
    seenNumbers.add(item.numero);
  });

  if (result.validationErrors.length > 0) {
    result.success = false;
    result.errors.push(`O lote possui ${result.validationErrors.length} erro(s) de validação.`);
    return result;
  }

  if (!isSupabaseConfigured() || !supabase) {
    result.success = false;
    result.errors.push('Supabase não configurado. Defina as variáveis no arquivo .env.');
    return result;
  }

  const client = supabase;

  for (let i = 0; i < recipes.length; i++) {
    const item = recipes[i];
    try {
      if (onProgress) {
        onProgress(i + 1, recipes.length);
      }

      // 2. Inserir ou atualizar a receita principal (Upsert por numero)
      const { data: recipeData, error: recipeError } = await client
        .from('recipes')
        .upsert(
          {
            numero: item.numero,
            titulo: item.titulo.trim(),
            categoria: item.categoria.trim(),
            uso_tradicional: item.uso_tradicional.trim(),
            tempo_preparo_min: item.tempo_preparo_min || 0,
            tempo_cozimento_infusao_min: item.tempo_cozimento_infusao_min || 0,
            tempo_total_min: item.tempo_total_min || 0,
            rendimento: item.rendimento.trim(),
            como_utilizar: item.como_utilizar.trim(),
            melhor_momento: item.melhor_momento ? item.melhor_momento.trim() : null,
            armazenamento: item.armazenamento.trim(),
            substituicoes: item.substituicoes ? item.substituicoes.trim() : null,
            atencao: item.atencao.trim(),
            is_preview: item.is_preview ?? false,
          },
          { onConflict: 'numero' }
        )
        .select('id')
        .single();

      if (recipeError || !recipeData) {
        throw new Error(`Erro ao salvar receita #${item.numero}: ${recipeError?.message}`);
      }

      const recipeId = recipeData.id;

      // 3. Limpar tabelas filhas anteriores antes de reinserir (garante ausência de duplicatas)
      await Promise.all([
        client.from('recipe_ingredients').delete().eq('recipe_id', recipeId),
        client.from('recipe_utensils').delete().eq('recipe_id', recipeId),
        client.from('recipe_steps').delete().eq('recipe_id', recipeId),
        client.from('recipe_tips').delete().eq('recipe_id', recipeId),
      ]);

      // 4. Inserir Ingredientes ordenados (ordem: 1, 2, 3...)
      if (item.ingredientes && item.ingredientes.length > 0) {
        const ingredientsRows = item.ingredientes.map((text, idx) => ({
          recipe_id: recipeId,
          ordem: idx + 1,
          texto: text.trim(),
        }));
        const { error: ingError } = await client.from('recipe_ingredients').insert(ingredientsRows);
        if (ingError) throw ingError;
      }

      // 5. Inserir Utensílios ordenados
      if (item.utensilios && item.utensilios.length > 0) {
        const utensilsRows = item.utensilios.map((text, idx) => ({
          recipe_id: recipeId,
          ordem: idx + 1,
          texto: text.trim(),
        }));
        const { error: utError } = await client.from('recipe_utensils').insert(utensilsRows);
        if (utError) throw utError;
      }

      // 6. Inserir Passos ordenados
      if (item.modo_preparo && item.modo_preparo.length > 0) {
        const stepsRows = item.modo_preparo.map((text, idx) => ({
          recipe_id: recipeId,
          ordem: idx + 1,
          texto: text.trim(),
        }));
        const { error: stepError } = await client.from('recipe_steps').insert(stepsRows);
        if (stepError) throw stepError;
      }

      // 7. Inserir Dicas ordenadas
      if (item.dicas_seu_neco && item.dicas_seu_neco.length > 0) {
        const tipsRows = item.dicas_seu_neco.map((text, idx) => ({
          recipe_id: recipeId,
          ordem: idx + 1,
          texto: text.trim(),
        }));
        const { error: tipError } = await client.from('recipe_tips').insert(tipsRows);
        if (tipError) throw tipError;
      }

      result.inserted++;
    } catch (err: any) {
      result.errors.push(`Receita #${item.numero} (${item.titulo}): ${err?.message || err}`);
    }
  }

  result.success = result.errors.length === 0;
  return result;
}
