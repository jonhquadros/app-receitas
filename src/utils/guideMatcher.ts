import { TECHNIQUES_DATA } from '../data/extraModulesData';
import { IngredientGuideItem, TechniqueKey } from '../types/modules';

export interface IngredientMatch {
  id: string;
  name: string;
}

export interface TechniqueMatch {
  id: TechniqueKey;
  name: string;
}

// Compara o texto da receita com os nomes reais cadastrados no Supabase.
// A normalização ignora acentos, caixa e variações após barra (ex.: fruta/folha).
function normalizeIngredientText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function findIngredientInText(
  text: string,
  guideItems: IngredientGuideItem[] = []
): IngredientMatch | null {
  const normalizedText = normalizeIngredientText(text);
  const candidates = guideItems
    .flatMap((item) => item.nome_popular.split('/').map((name) => ({
      id: item.id,
      name: name.trim(),
      normalizedName: normalizeIngredientText(name),
    })))
    .filter((item) => item.normalizedName.length >= 4)
    .sort((a, b) => b.normalizedName.length - a.normalizedName.length);

  const match = candidates.find((item) =>
    normalizedText.includes(item.normalizedName)
  );

  return match ? { id: match.id, name: match.name } : null;
}

// Mapeamento de termos comuns para IDs de técnicas
const TECHNIQUE_TERMS: { term: string; id: TechniqueKey; name: string }[] = [
  { term: 'infusão', id: 'infusao', name: 'Infusão' },
  { term: 'infusao', id: 'infusao', name: 'Infusão' },
  { term: 'decocção', id: 'decoccao', name: 'Decocção' },
  { term: 'decoccao', id: 'decoccao', name: 'Decocção' },
  { term: 'maceração', id: 'maceracao', name: 'Maceração' },
  { term: 'maceracao', id: 'maceracao', name: 'Maceração' },
  { term: 'macerar', id: 'maceracao', name: 'Maceração' },
  { term: 'coar', id: 'coagem', name: 'Coagem' },
  { term: 'coagem', id: 'coagem', name: 'Coagem' },
  { term: 'peneira', id: 'coagem', name: 'Coagem' },
  { term: 'armazenamento', id: 'armazenamento', name: 'Armazenamento' },
  { term: 'armazenar', id: 'armazenamento', name: 'Armazenamento' },
  { term: 'higienização', id: 'higienizacao', name: 'Higienização' },
  { term: 'higienizacao', id: 'higienizacao', name: 'Higienização' },
  { term: 'higienizar', id: 'higienizacao', name: 'Higienização' },
  { term: 'lavar', id: 'higienizacao', name: 'Higienização' },
];

export function findIngredientInText(text: string): IngredientMatch | null {
  const lower = text.toLowerCase();
  for (const item of INGREDIENT_TERMS) {
    if (lower.includes(item.term)) {
      return { id: item.id, name: item.name };
    }
  }
  return null;
}

export function findTechniqueInText(text: string): TechniqueMatch | null {
  const lower = text.toLowerCase();
  for (const item of TECHNIQUE_TERMS) {
    if (lower.includes(item.term)) {
      return { id: item.id, name: item.name };
    }
  }
  return null;
}
