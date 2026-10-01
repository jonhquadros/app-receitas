export interface Recipe {
  id: string;
  code: string;
  title: string;
  category: 'Chás' | 'Sucos' | 'Infusões' | 'Bebidas' | 'Preparações tradicionais';
  categoryDisplay: string;
  traditionalUse: string;
  ingredients: string[];
  utensils: string[];
  prepTime: string;
  totalMinutes: number;
  totalTimeDisplay: string;
  yield: string;
  steps: string[];
  howToUse: string;
  bestMoment: string;
  storage: string;
  substitutions: string;
  seuNecoTips: string[];
  attention: string;
  isRecipeOfDay?: boolean;
  isPreview?: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type TextScale = 'normal' | 'grande' | 'muito-grande';
