import React from 'react';
import { Search, History, Coffee, GlassWater, Leaf, Droplets, HeartHandshake, ChevronRight, Clock } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { RecipeCard } from '../components/RecipeCard';
import { useRecentRecipes } from '../context/RecentRecipesContext';

interface HomeViewProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onSelectCategory: (categoryName: string) => void;
  onOpenSearch: (initialQuery?: string) => void;
  isLoading?: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  recipes,
  onSelectRecipe,
  onSelectCategory,
  onOpenSearch,
  isLoading = false,
}) => {
  const { recentRecipeIds } = useRecentRecipes();
  const recipeOfDay = recipes.find((r) => r.isRecipeOfDay) || recipes[0];

  // Resolve the recent recipes objects (max 5)
  const recentRecipes: Recipe[] = recentRecipeIds
    .map((id) =>
      recipes.find(
        (r) =>
          r.id === id ||
          (id === '004' && (r.code === 'RECEITA 004' || r.id.endsWith('0004'))) ||
          (id.endsWith('0004') && (r.code === 'RECEITA 004' || r.id === '004'))
      )
    )
    .filter((r): r is Recipe => r !== undefined)
    .slice(0, 5);

  const categories = [
    {
      name: 'Chás',
      description: 'Infusões quentes e confortantes',
      icon: Coffee,
      bg: 'bg-emerald-100 dark:bg-emerald-950/60',
      text: 'text-emerald-900 dark:text-emerald-300',
    },
    {
      name: 'Sucos',
      description: 'Sucos naturais e detox cheios de vida',
      icon: GlassWater,
      bg: 'bg-emerald-100 dark:bg-emerald-950/60',
      text: 'text-emerald-900 dark:text-emerald-300',
    },
    {
      name: 'Infusões',
      description: 'Extratos suaves de ervas e sementes',
      icon: Leaf,
      bg: 'bg-emerald-100 dark:bg-emerald-950/60',
      text: 'text-emerald-900 dark:text-emerald-300',
    },
    {
      name: 'Bebidas',
      description: 'Preparações geladas e refrescantes',
      icon: Droplets,
      bg: 'bg-emerald-100 dark:bg-emerald-950/60',
      text: 'text-emerald-900 dark:text-emerald-300',
    },
    {
      name: 'Preparações tradicionais',
      description: 'Xaropes, xaropadas e receitas de família',
      icon: HeartHandshake,
      bg: 'bg-emerald-100 dark:bg-emerald-950/60',
      text: 'text-emerald-900 dark:text-emerald-300',
    },
  ];

  return (
    <div className="space-y-6 pb-32 max-w-2xl mx-auto px-4 pt-4 sm:pt-6">
      {/* Welcome & Seu Neco Greeting Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 shadow-xs flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-[28px] shrink-0 shadow-xs">
          👴
        </div>
        <div>
          <h1 className="text-[24px] sm:text-[26px] font-bold text-stone-900 dark:text-stone-100 leading-tight">
            Olá! O que você quer preparar hoje?
          </h1>
          <p className="text-[15px] text-stone-600 dark:text-stone-400 mt-0.5">
            Bem-vindo ao acervo de receitas naturais do Seu Neco.
          </p>
        </div>
      </div>

      {/* Big Top Search Button / Input Trigger */}
      <div
        onClick={() => onOpenSearch()}
        className="flex items-center gap-3 p-4 min-h-[62px] rounded-2xl bg-white dark:bg-[#1E2220] border-2 border-emerald-600/40 dark:border-emerald-600/50 hover:border-emerald-600 text-stone-600 dark:text-stone-400 cursor-pointer shadow-xs active:scale-[0.99] transition-all"
        role="button"
        tabIndex={0}
        aria-label="Buscar por nome ou ingrediente"
      >
        <Search className="w-6 h-6 text-emerald-700 dark:text-emerald-400 shrink-0" />
        <span className="text-[18px] text-stone-500 dark:text-stone-400 font-medium truncate">
          Digite: gengibre, digestão, chá de...
        </span>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-10 text-emerald-700 dark:text-emerald-400" aria-live="polite">
          <div className="w-5 h-5 rounded-full border-2 border-emerald-200 border-t-emerald-700 dark:border-emerald-900 dark:border-t-emerald-400 animate-spin" />
          <span className="text-[15px] font-semibold">Carregando suas receitas...</span>
        </div>
      )}

      {/* SEÇÃO 5: Receitas vistas recentemente (últimas 5) */}
      {recentRecipes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[20px] font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <span>Vistas recentemente</span>
            </h2>
            <span className="text-[13px] font-bold text-stone-500 dark:text-stone-400">
              Últimas {recentRecipes.length}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {recentRecipes.map((recipe) => (
              <div
                key={`recent-${recipe.id}`}
                onClick={() => onSelectRecipe(recipe)}
                className="p-4 rounded-2xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 hover:border-emerald-500 dark:hover:border-emerald-600 transition-all cursor-pointer active:scale-[0.99] flex items-center justify-between min-h-[64px] shadow-xs"
              >
                <div className="min-w-0 pr-3">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-emerald-800 dark:text-emerald-400">
                    <span>{recipe.code}</span>
                    <span>•</span>
                    <span className="truncate">{recipe.categoryDisplay}</span>
                  </div>
                  <h3 className="text-[17px] font-bold text-stone-900 dark:text-stone-100 truncate leading-snug">
                    {recipe.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-stone-500 dark:text-stone-400">
                  <span className="text-[13px] font-medium hidden sm:inline">
                    {recipe.totalTimeDisplay}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Recipe Of The Day */}
      {recipeOfDay && (
        <div className="space-y-2">
          <h2 className="text-[20px] font-bold text-stone-900 dark:text-stone-100 px-1">
            Receita do dia
          </h2>
          <RecipeCard recipe={recipeOfDay} onSelect={onSelectRecipe} featured />
        </div>
      )}

      {/* Category Cards Section */}
      <div className="space-y-3">
        <h2 className="text-[20px] font-bold text-stone-900 dark:text-stone-100 px-1">
          Explore por Categorias
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = recipes.filter(
              (r) => r.category === cat.name || r.categoryDisplay.includes(cat.name)
            ).length;

            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className={`p-5 rounded-2xl bg-white dark:bg-[#1E2220] border-2 border-stone-200 dark:border-stone-800 hover:border-emerald-500 dark:hover:border-emerald-600 text-left transition-all active:scale-[0.98] flex items-center gap-4 min-h-[84px] shadow-xs group`}
              >
                <div
                  className={`p-3 rounded-2xl ${cat.bg} ${cat.text} shrink-0 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-7 h-7 stroke-[2.2]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[19px] font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-emerald-800 dark:group-hover:text-emerald-400">
                      {cat.name}
                    </h3>
                    <span className="text-[13px] font-bold text-stone-600 dark:text-stone-400">
                      {count} {count === 1 ? 'receita' : 'receitas'}
                    </span>
                  </div>
                  <p className="text-[14px] text-stone-600 dark:text-stone-400 truncate mt-0.5">
                    {cat.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
