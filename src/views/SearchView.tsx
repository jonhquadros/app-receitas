import React, { useState, useEffect } from 'react';
import { Search, X, Clock, Filter, Sparkles, Check } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { RecipeCard } from '../components/RecipeCard';

interface SearchViewProps {
  recipes: Recipe[];
  initialCategory?: string;
  initialQuery?: string;
  onSelectRecipe: (recipe: Recipe) => void;
}

export type TimeFilter = 'all' | '10' | '30';

// Função para remover acentos e normalizar texto para busca tolerante
export function normalizeSearchText(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function cleanForFuzzy(str: string): string {
  return normalizeSearchText(str).replace(/[^a-z0-9]/g, '');
}

export const SearchView: React.FC<SearchViewProps> = ({
  recipes,
  initialCategory = '',
  initialQuery = '',
  onSelectRecipe,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTime, setSelectedTime] = useState<TimeFilter>('all');

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialQuery) setSearchQuery(initialQuery);
  }, [initialQuery]);

  const categories = [
    'Todas',
    'Chás',
    'Sucos',
    'Infusões',
    'Bebidas',
    'Preparações tradicionais',
  ];

  const timeOptions: { id: TimeFilter; label: string; desc: string }[] = [
    { id: 'all', label: 'Todos os tempos', desc: 'Sem limite' },
    { id: '10', label: 'Até 10 min', desc: 'Rápidas' },
    { id: '30', label: 'Até 30 min', desc: 'Completas' },
  ];

  const normalizedQuery = normalizeSearchText(searchQuery);
  const hasMinQuery = normalizedQuery.length >= 2;

  const filteredRecipes = recipes.filter((recipe) => {
    // 1. Filtro de Categoria
    const categoryMatch =
      !selectedCategory ||
      selectedCategory === 'Todas' ||
      recipe.category === selectedCategory ||
      recipe.categoryDisplay.toLowerCase().includes(selectedCategory.toLowerCase());

    // 2. Filtro de Tempo (até 10 min / até 30 min)
    let timeMatch = true;
    if (selectedTime === '10') {
      timeMatch = recipe.totalMinutes <= 10;
    } else if (selectedTime === '30') {
      timeMatch = recipe.totalMinutes <= 30;
    }

    if (!categoryMatch || !timeMatch) return false;

    // 3. Busca por texto a partir de 2 letras tolerando acentos
    if (!hasMinQuery) {
      return true; // Exibe as receitas da categoria/tempo se ainda não digitou 2 letras
    }

    const normTitle = normalizeSearchText(recipe.title);
    const normCode = normalizeSearchText(recipe.code);
    const normCategory = normalizeSearchText(recipe.categoryDisplay);
    const normUse = normalizeSearchText(recipe.traditionalUse);
    const normIngredients = recipe.ingredients.some((ing) =>
      normalizeSearchText(ing).includes(normalizedQuery)
    );
    const normTips = recipe.seuNecoTips.some((tip) =>
      normalizeSearchText(tip).includes(normalizedQuery)
    );
    const normSubstitutions = normalizeSearchText(recipe.substitutions || '');

    const fuzzyQuery = cleanForFuzzy(searchQuery);
    const fuzzyMatch =
      cleanForFuzzy(recipe.title).includes(fuzzyQuery) ||
      cleanForFuzzy(recipe.categoryDisplay).includes(fuzzyQuery) ||
      cleanForFuzzy(recipe.traditionalUse).includes(fuzzyQuery) ||
      recipe.ingredients.some((ing) => cleanForFuzzy(ing).includes(fuzzyQuery));

    return (
      normTitle.includes(normalizedQuery) ||
      normCode.includes(normalizedQuery) ||
      normCategory.includes(normalizedQuery) ||
      normUse.includes(normalizedQuery) ||
      normIngredients ||
      normTips ||
      normSubstitutions.includes(normalizedQuery) ||
      fuzzyMatch
    );
  });

  return (
    <div className="space-y-6 pb-32 max-w-2xl mx-auto px-4 pt-4 sm:pt-6">
      {/* Title */}
      <div>
        <h1 className="text-[24px] sm:text-[28px] font-bold text-stone-900 dark:text-stone-100">
          Buscar Receitas
        </h1>
        <p className="text-[16px] text-stone-600 dark:text-stone-400 mt-1">
          Encontre chás, sucos, infusões e preparações rapidamente
        </p>
      </div>

      {/* Large Search Field with Exact Placeholder */}
      <div className="space-y-1.5">
        <label
          htmlFor="search-input"
          className="block text-[15px] font-bold text-stone-700 dark:text-stone-300"
        >
          O que você procura?
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
          </div>
          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Digite: gengibre, digestão, chá de..."
            className="w-full min-h-[62px] pl-12 pr-12 text-[18px] rounded-2xl bg-white dark:bg-[#1E2220] border-2 border-emerald-600/40 dark:border-emerald-600/50 focus:border-emerald-600 dark:focus:border-emerald-400 text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400 outline-none shadow-xs transition-colors"
            autoFocus={!initialCategory}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center min-w-[52px] min-h-[52px] justify-center text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
              aria-label="Limpar campo de busca"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>
          )}
        </div>

        {searchQuery.length > 0 && searchQuery.length < 2 && (
          <p className="text-[14px] text-amber-700 dark:text-amber-400 font-medium pl-1">
            Digite mais 1 letra para filtrar por texto...
          </p>
        )}
      </div>

      {/* Filtros Simples em Botões Grandes: Categoria & Tempo */}
      <div className="space-y-4 p-5 rounded-3xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 shadow-xs">
        {/* Filtro 1: Categoria */}
        <div className="space-y-2">
          <span className="text-[15px] font-bold text-stone-800 dark:text-stone-200">
            Filtrar por Categoria
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => {
              const isSelected =
                (!selectedCategory && cat === 'Todas') || selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === 'Todas' ? '' : cat)}
                  className={`px-3 py-2.5 rounded-xl font-bold text-[15px] min-h-[52px] active:scale-95 transition-all text-center flex items-center justify-center border-2 ${
                    isSelected
                      ? 'bg-emerald-700 text-white dark:bg-emerald-600 border-emerald-700 dark:border-emerald-600 shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-emerald-400'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtro 2: Tempo de preparo (até 10 min / até 30 min) */}
        <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span className="text-[15px] font-bold text-stone-800 dark:text-stone-200">
              Tempo de Preparo
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {timeOptions.map((opt) => {
              const isSelected = selectedTime === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedTime(opt.id)}
                  className={`p-2.5 rounded-xl font-bold text-[15px] min-h-[52px] active:scale-95 transition-all text-center flex flex-col items-center justify-center border-2 ${
                    isSelected
                      ? 'bg-emerald-700 text-white dark:bg-emerald-600 border-emerald-700 dark:border-emerald-600 shadow-xs'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-emerald-400'
                  }`}
                >
                  <span className="leading-tight">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Clear Filters Button if any active */}
        {(selectedCategory || selectedTime !== 'all' || searchQuery) && (
          <div className="pt-2 text-right">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedTime('all');
              }}
              className="text-[15px] font-bold text-emerald-800 dark:text-emerald-400 hover:underline min-h-[44px] px-2"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>

      {/* Results Header and List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-[16px] font-bold text-stone-700 dark:text-stone-300 px-1">
          <span>
            {selectedCategory ? `${selectedCategory}: ` : ''}
            {filteredRecipes.length}{' '}
            {filteredRecipes.length === 1 ? 'receita encontrada' : 'receitas encontradas'}
          </span>
          {selectedTime !== 'all' && (
            <span className="text-[14px] text-emerald-800 dark:text-emerald-400">
              {selectedTime === '10' ? 'Até 10 min' : 'Até 30 min'}
            </span>
          )}
        </div>

        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-3.5 scroll-smooth">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onSelect={onSelectRecipe} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#1E2220] border-2 border-stone-200 dark:border-stone-800 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto text-[32px]">
              🔍
            </div>
            <h3 className="text-[20px] font-bold text-stone-900 dark:text-stone-100">
              Não encontramos. Tente outra palavra, como o nome de um ingrediente.
            </h3>
            <p className="text-[16px] text-stone-600 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
              Dica: Experimente buscar por{' '}
              <strong className="text-emerald-800 dark:text-emerald-400">gengibre</strong>,{' '}
              <strong className="text-emerald-800 dark:text-emerald-400">erva-doce</strong>,{' '}
              <strong className="text-emerald-800 dark:text-emerald-400">hortelã</strong> ou{' '}
              <strong className="text-emerald-800 dark:text-emerald-400">digestão</strong>.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedTime('all');
              }}
              className="px-6 py-3 rounded-xl bg-emerald-700 text-white font-bold min-h-[52px] active:scale-95 transition-transform"
            >
              Ver todas as receitas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
