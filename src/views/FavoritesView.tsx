import React from 'react';
import { Heart, Search, Loader2 } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { useFavorites } from '../context/FavoritesContext';
import { RecipeCard } from '../components/RecipeCard';

interface FavoritesViewProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onOpenSearch: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  recipes,
  onSelectRecipe,
  onOpenSearch,
}) => {
  const { isFavorite, isLoading, favorites } = useFavorites();

  const favoritedRecipes = recipes.filter((recipe) => isFavorite(recipe.id));

  return (
    <div className="space-y-6 pb-32 max-w-2xl mx-auto px-4 pt-4 sm:pt-6">
      {/* Title */}
      <div>
        <h1 className="text-[24px] sm:text-[28px] font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
          <Heart className="w-7 h-7 fill-red-500 text-red-500" />
          <span>Favoritos</span>
        </h1>
        <p className="text-[16px] text-stone-600 dark:text-stone-400 mt-1">
          Suas receitas preferidas salvas para preparar quando quiser
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-[15px] text-emerald-700 dark:text-emerald-400 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Sincronizando seus favoritos...</span>
        </div>
      )}

      {favoritedRecipes.length > 0 ? (
        <div className="space-y-3.5">
          <div className="text-[15px] font-bold text-stone-600 dark:text-stone-400 px-1">
            {favoritedRecipes.length}{' '}
            {favoritedRecipes.length === 1 ? 'receita salva' : 'receitas salvas'} (toque no
            coração para salvar ou remover)
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {favoritedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onSelect={onSelectRecipe} />
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#1E2220] border-2 border-stone-200 dark:border-stone-800 space-y-4 my-4">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/50 text-red-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 stroke-[2]" />
          </div>

          <h2 className="text-[20px] font-bold text-stone-900 dark:text-stone-100">
            Você ainda não salvou nenhuma receita
          </h2>

          <p className="text-[16px] text-stone-600 dark:text-stone-400 leading-relaxed max-w-md mx-auto">
            Ao navegar pelas receitas, toque no botão{' '}
            <strong className="text-stone-900 dark:text-stone-100">"Salvar" (coração)</strong> para
            guardar suas preparações prediletas nesta lista.
          </p>

          <button
            onClick={onOpenSearch}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[17px] shadow-xs active:scale-95 transition-all min-h-[52px]"
          >
            <Search className="w-5 h-5 stroke-[2.5]" />
            <span>Explorar Receitas</span>
          </button>
        </div>
      )}
    </div>
  );
};
