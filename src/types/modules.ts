export interface IngredientGuideItem {
  id: string;
  nome_popular: string;
  nome_cientifico: string;
  como_escolher: string;
  como_lavar: string;
  como_preparar: string;
  como_armazenar: string;
  como_utilizar: string;
  cuidados: string;
  interacoes: string;
  quem_deve_ter_atencao: string;
  categoria?: 'ervas' | 'folhas' | 'frutas' | 'raizes' | 'especiarias' | 'complementares';
}

export interface MeasureItem {
  medida: string;
  equivalencia: string;
  mililitros?: number;
  dica_pratica: string;
}

export type TechniqueKey =
  | 'infusao'
  | 'decoccao'
  | 'maceracao'
  | 'coagem'
  | 'armazenamento'
  | 'higienizacao';

export interface TechniqueItem {
  id: TechniqueKey;
  nome: string;
  subtitulo: string;
  descricao: string;
  quando_usar: string;
  passo_a_passo: string[];
  dica_seu_neco: string;
  cuidados: string;
}

export type ShoppingListCategory =
  | 'frutas'
  | 'folhas'
  | 'ervas'
  | 'raizes'
  | 'especiarias'
  | 'complementares';

export interface ShoppingListItem {
  id: string;
  nome: string;
  quantidade: string;
  categoria: ShoppingListCategory;
  observacao?: string;
}

export type ShoppingListPlan = 'basica' | 'economica' | '7_dias' | '30_dias';

export interface ShoppingListGroup {
  id: ShoppingListPlan;
  titulo: string;
  descricao: string;
  itens: ShoppingListItem[];
}

export interface CalendarDayItem {
  dia: number;
  foco: string;
  receitas: {
    periodo: 'Manhã' | 'Tarde' | 'Noite';
    numero: number;
    titulo: string;
    finalidade: string;
  }[];
  observacao: string;
}
