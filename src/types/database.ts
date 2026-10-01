export interface DbRecipe {
  id: string;
  numero: number;
  titulo: string;
  categoria: string;
  uso_tradicional: string;
  tempo_preparo_min: number;
  tempo_cozimento_infusao_min: number;
  tempo_total_min: number;
  rendimento: string;
  como_utilizar: string;
  melhor_momento: string | null;
  armazenamento: string;
  substituicoes: string | null;
  atencao: string;
  is_preview: boolean;
  created_at?: string;
}

export interface DbRecipeIngredient {
  id?: string;
  recipe_id: string;
  ordem: number;
  texto: string;
}

export interface DbRecipeUtensil {
  id?: string;
  recipe_id: string;
  ordem: number;
  texto: string;
}

export interface DbRecipeStep {
  id?: string;
  recipe_id: string;
  ordem: number;
  texto: string;
}

export interface DbRecipeTip {
  id?: string;
  recipe_id: string;
  ordem: number;
  texto: string;
}

export interface DbIngredientGuide {
  id: string;
  nome_popular: string;
  nome_cientifico: string | null;
  como_escolher: string | null;
  como_lavar: string | null;
  como_preparar: string | null;
  como_armazenar: string | null;
  como_utilizar: string | null;
  cuidados: string | null;
  interacoes: string | null;
  quem_deve_ter_atencao: string | null;
}

export interface DbTechnique {
  id: string;
  nome: string;
  descricao: string;
  quando_usar: string;
}

export interface DbMeasuresGuide {
  id: string;
  medida: string;
  equivalencia: string;
}

export interface DbShoppingList {
  id: string;
  tipo: 'basica' | 'economica' | '7_dias' | '30_dias';
  grupo: 'frutas' | 'folhas' | 'ervas' | 'raizes' | 'especiarias' | 'complementares';
  itens: string[];
}

export interface DbCalendarDay {
  id: string;
  dia: number;
  receitas: number[];
  observacao: string | null;
}

export interface DbProfile {
  id: string;
  nome: string | null;
  tema: 'claro' | 'escuro' | 'automatico';
  role: 'usuario' | 'admin';
  created_at?: string;
}

export interface DbFavorite {
  id?: string;
  user_id: string;
  recipe_id: string;
  created_at?: string;
}

export interface DbTag {
  id: string;
  nome: string;
}

export interface DbRecipeTag {
  id?: string;
  recipe_id: string;
  tag_id: string;
}

export interface DbSubscription {
  id: string;
  user_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  created_at?: string;
}

// Complete recipe with joined child tables
export interface DbRecipeComplete extends DbRecipe {
  ingredients: DbRecipeIngredient[];
  utensils: DbRecipeUtensil[];
  steps: DbRecipeStep[];
  tips: DbRecipeTip[];
}
