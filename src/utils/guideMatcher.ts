import { INGREDIENT_GUIDE_DATA, TECHNIQUES_DATA } from '../data/extraModulesData';
import { TechniqueKey } from '../types/modules';

export interface IngredientMatch {
  id: string;
  name: string;
}

export interface TechniqueMatch {
  id: TechniqueKey;
  name: string;
}

// Mapeamento de termos comuns para IDs de ingredientes
const INGREDIENT_TERMS: { term: string; id: string; name: string }[] = [
  { term: 'erva-doce', id: 'alecrim', name: 'Erva-doce' }, // wait, id: 'erva-doce'
  { term: 'erva doce', id: 'erva-doce', name: 'Erva-doce' },
  { term: 'anis', id: 'erva-doce', name: 'Erva-doce' },
  { term: 'hortelã', id: 'hortela', name: 'Hortelã' },
  { term: 'hortela', id: 'hortela', name: 'Hortelã' },
  { term: 'menta', id: 'hortela', name: 'Hortelã' },
  { term: 'alecrim', id: 'alecrim', name: 'Alecrim' },
  { term: 'camomila', id: 'camomila', name: 'Camomila' },
  { term: 'canela', id: 'canela', name: 'Canela' },
  { term: 'gengibre', id: 'gengibre', name: 'Gengibre' },
  { term: 'cravo', id: 'cravo-da-india', name: 'Cravo-da-índia' },
  { term: 'boldo', id: 'boldo', name: 'Boldo' },
  { term: 'capim-santo', id: 'capim-santo', name: 'Capim-santo' },
  { term: 'capim santo', id: 'capim-santo', name: 'Capim-santo' },
  { term: 'capim-cidreira', id: 'capim-santo', name: 'Capim-santo' },
  { term: 'capim-limão', id: 'capim-santo', name: 'Capim-santo' },
  { term: 'carqueja', id: 'carqueja', name: 'Carqueja' },
  { term: 'louro', id: 'louro', name: 'Louro' },
  { term: 'manjericão', id: 'manjericao', name: 'Manjericão' },
  { term: 'manjericao', id: 'manjericao', name: 'Manjericão' },
];

// Fix erva-doce id:
INGREDIENT_TERMS[0].id = 'erva-doce';

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
