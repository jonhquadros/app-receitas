import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { IngredientGuideItem } from '../types/modules';

export async function fetchIngredientGuide(): Promise<IngredientGuideItem[]> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase não está configurado.');
  }

  const { data, error } = await supabase
    .from('ingredient_guide')
    .select(
      'id,slug,nome_popular,nome_cientifico,categoria,como_escolher,como_lavar,como_preparar,como_armazenar,como_utilizar,cuidados,interacoes,quem_deve_ter_atencao'
    )
    .eq('ativo', true)
    .order('nome_popular', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((item) => ({
    ...item,
    nome_cientifico: item.nome_cientifico ?? '',
    como_escolher: item.como_escolher ?? '',
    como_lavar: item.como_lavar ?? '',
    como_preparar: item.como_preparar ?? '',
    como_armazenar: item.como_armazenar ?? '',
    como_utilizar: item.como_utilizar ?? '',
    cuidados: item.cuidados ?? '',
    interacoes: item.interacoes ?? '',
    quem_deve_ter_atencao: item.quem_deve_ter_atencao ?? '',
  })) as IngredientGuideItem[];
}
