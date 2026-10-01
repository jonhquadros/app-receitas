import React from 'react';
import { Heart, Clock, ChevronRight } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { useFavorites } from '../context/FavoritesContext';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  featured?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelect,
  featured = false,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(recipe.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(recipe.id);
  };

  if (featured) {
    return (
      <div
        onClick={() => onSelect(recipe)}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 to-emerald-950 dark:from-emerald-900 dark:to-stone-950 text-white p-6 shadow-md border border-emerald-700/50 cursor-pointer active:scale-[0.99] transition-transform group"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[14px] font-bold bg-emerald-700/80 text-emerald-100 backdrop-blur-xs border border-emerald-500/40">
            ⭐ Receita do Dia
          </span>
          <button
            onClick={handleFavoriteClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-white transition-colors min-h-[52px] active:scale-95 border border-emerald-600/40 text-[14px] font-bold shadow-xs"
            aria-label={favorited ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
          >
            <Heart
              className={`w-5 h-5 ${
                favorited ? 'fill-red-400 text-red-400' : 'text-white stroke-[2.2]'
              }`}
            />
            <span>{favorited ? 'Salvo' : 'Salvar'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 mb-1.5 text-[14px] font-bold text-emerald-300">
          <span>{recipe.code}</span>
          <span>•</span>
          <span>{recipe.categoryDisplay}</span>
        </div>

        <h3 className="text-[22px] sm:text-[25px] font-bold text-white leading-tight mb-3 group-hover:text-emerald-200 transition-colors">
          {recipe.title}
        </h3>

        <p className="text-[16px] text-emerald-100/90 line-clamp-2 leading-snug mb-4">
          {recipe.traditionalUse}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-emerald-700/60 text-[15px] font-medium text-emerald-100">
          <div className="flex items-center gap-1.5">
            <Clock className="w-5 h-5 text-emerald-300" />
            <span className="font-bold">Tempo total: {recipe.totalTimeDisplay}</span>
          </div>

          <div className="inline-flex items-center gap-1 font-bold text-emerald-200 group-hover:translate-x-1 transition-transform">
            <span>Ver receita completa</span>
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(recipe)}
      className="p-5 rounded-2xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800/80 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-600 transition-all cursor-pointer active:scale-[0.99] group flex flex-col justify-between min-h-[175px]"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-[13px] font-bold text-stone-700 dark:text-stone-300">
              {recipe.code}
            </span>
            <span className="text-[14px] font-semibold text-emerald-800 dark:text-emerald-400">
              {recipe.categoryDisplay}
            </span>
          </div>

          <button
            onClick={handleFavoriteClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors min-h-[52px] active:scale-95 text-[14px] font-bold shrink-0 ${
              favorited
                ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-red-500 border border-stone-200 dark:border-stone-700'
            }`}
            aria-label={favorited ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
          >
            <Heart
              className={`w-5 h-5 ${
                favorited ? 'fill-red-500 text-red-500' : 'stroke-[2.2]'
              }`}
            />
            <span>{favorited ? 'Salvo' : 'Salvar'}</span>
          </button>
        </div>

        <h3 className="text-[19px] sm:text-[21px] font-bold text-stone-900 dark:text-stone-100 leading-snug mb-2 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
          {recipe.title}
        </h3>

        <p className="text-[15px] text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed mb-3">
          {recipe.traditionalUse}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800/80 text-[14px] font-medium text-stone-600 dark:text-stone-400">
        <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
          <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span className="font-semibold">Tempo total: {recipe.totalTimeDisplay}</span>
        </div>

        <div className="flex items-center gap-1 text-emerald-800 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
          <span>Abrir receita</span>
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
};
