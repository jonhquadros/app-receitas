import React, { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Clock,
  Users,
  Utensils,
  Check,
  AlertTriangle,
  Play,
  Share2,
  Sparkles,
  Info,
  BookOpen,
  Flame,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Recipe } from '../types/recipe';
import { useFavorites } from '../context/FavoritesContext';
import { useFontSize } from '../context/FontSizeContext';
import { FontSizeControls } from './FontSizeControls';
import { StepByStepModal } from './StepByStepModal';
import { IngredientGuideModal } from './modules/IngredientGuideModal';
import { TechniquesModal } from './modules/TechniquesModal';
import { LegalDisclaimerModal } from './LegalDisclaimerModal';
import { TermsPrivacyModal } from './TermsPrivacyModal';
import { findIngredientInText, findTechniqueInText } from '../utils/guideMatcher';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getTextSizeClass } = useFontSize();
  const [showStepByStep, setShowStepByStep] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});

  // Estados dos Modais de Guias
  const [selectedGuideIngredientId, setSelectedGuideIngredientId] = useState<string | null>(null);
  const [isIngredientGuideOpen, setIsIngredientGuideOpen] = useState(false);
  const [selectedGuideTechniqueId, setSelectedGuideTechniqueId] = useState<string | null>(null);
  const [isTechniqueGuideOpen, setIsTechniqueGuideOpen] = useState(false);

  // Estados de Aviso Legal e Privacidade
  const [isLegalDisclaimerOpen, setIsLegalDisclaimerOpen] = useState(false);
  const [isTermsPrivacyOpen, setIsTermsPrivacyOpen] = useState(false);

  const favorited = isFavorite(recipe.id);

  const toggleIngredientCheck = (index: number) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const bodyClass = getTextSizeClass('body');
  const titleClass = getTextSizeClass('title');
  const subtitleClass = getTextSizeClass('subtitle');
  const stepClass = getTextSizeClass('step');

  return (
    <div className="pb-32 max-w-2xl mx-auto px-4 pt-4 sm:pt-6 space-y-6">
      {/* Top Header Controls Bar */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 font-bold min-h-[52px] active:scale-95 transition-all"
          aria-label="Voltar para a lista de receitas"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[16px]">Voltar</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Compact Font Controls */}
          <FontSizeControls compact />

          {/* Favorite Button */}
          <button
            onClick={() => toggleFavorite(recipe.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl min-h-[52px] font-bold transition-all active:scale-95 ${
              favorited
                ? 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border border-red-300 dark:border-red-800'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
            aria-label={favorited ? 'Remover receita dos favoritos' : 'Salvar receita nos favoritos'}
          >
            <Heart
              className={`w-5 h-5 ${
                favorited ? 'fill-red-500 text-red-500' : 'stroke-[2.2]'
              }`}
            />
            <span className="text-[15px]">{favorited ? 'Salvo' : 'Salvar'}</span>
          </button>
        </div>
      </div>

      {/* Main Recipe Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800/80 shadow-xs space-y-4">
        {/* Code & Category Tag */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[14px] font-bold text-stone-500 dark:text-stone-400 tracking-wider">
            {recipe.code}
          </span>
          <span className="px-3.5 py-1 rounded-full text-[14px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-800/50">
            {recipe.categoryDisplay}
          </span>
        </div>

        {/* Title */}
        <h1 className={`${titleClass} text-stone-900 dark:text-stone-100 leading-tight`}>
          {recipe.title}
        </h1>

        {/* Step-by-Step Mode Prominent Trigger CTA */}
        <button
          onClick={() => setShowStepByStep(true)}
          className="w-full min-h-[58px] py-3.5 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-[18px] sm:text-[19px] flex items-center justify-center gap-3 shadow-md active:scale-[0.98] transition-all"
        >
          <Play className="w-6 h-6 fill-white stroke-none" />
          <span>Modo passo a passo (guiado)</span>
        </button>
      </div>

      {/* ORDERED SECTION 1: Categoria */}
      <section className="p-5 rounded-2xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800/80 shadow-xs">
        <h2 className={`${subtitleClass} text-emerald-800 dark:text-emerald-400 mb-1`}>
          Categoria
        </h2>
        <p className={`${bodyClass} text-stone-800 dark:text-stone-200 font-medium`}>
          {recipe.categoryDisplay}
        </p>
      </section>

      {/* ORDERED SECTION 2: Para que é tradicionalmente utilizada */}
      <section className="p-5 rounded-2xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800/80 shadow-xs">
        <h2 className={`${subtitleClass} text-emerald-800 dark:text-emerald-400 mb-2`}>
          Para que é tradicionalmente utilizada
        </h2>
        <p className={`${bodyClass} text-stone-800 dark:text-stone-200 leading-relaxed`}>
          {recipe.traditionalUse}
        </p>
      </section>

      {/* ORDERED SECTION 3: Ingredientes (with interactive checkboxes) */}
      <section className="p-5 rounded-2xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className={`${subtitleClass} text-emerald-800 dark:text-emerald-400`}>
            Ingredientes
          </h2>
          <span className="text-[14px] text-stone-500 dark:text-stone-400">
            Toque para marcar o que tem
          </span>
        </div>

        <ul className="space-y-2.5 pt-1">
          {recipe.ingredients.map((item, idx) => {
            const isChecked = !!checkedIngredients[idx];
            const ingredientMatch = findIngredientInText(item);
            return (
              <li
                key={idx}
                onClick={() => toggleIngredientCheck(idx)}
                className={`flex items-start gap-3.5 p-3.5 rounded-2xl border-2 transition-all cursor-pointer min-h-[56px] ${
                  isChecked
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-stone-600 dark:text-stone-400 line-through'
                    : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100'
                }`}
              >
                <div
                  className={`mt-0.5 w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500 dark:text-stone-950'
                      : 'border-stone-400 dark:border-stone-500 bg-white dark:bg-stone-800'
                  }`}
                >
                  {isChecked && <Check className="w-5 h-5 stroke-[3]" />}
                </div>
                <div className="flex-1">
                  <span className={`${bodyClass} font-medium leading-snug pt-0.5 block`}>{item}</span>
                  {ingredientMatch && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGuideIngredientId(ingredientMatch.id);
                        setIsIngredientGuideOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-lg text-[13px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/80 border border-emerald-300/60 dark:border-emerald-800 transition-colors"
                      title={`Abrir Guia de Ingredientes para ${ingredientMatch.name}`}
                    >
                      <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Ver {ingredientMatch.name} no Guia</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ORDERED SECTION 4: Utensílios */}
      <section className="p-5 rounded-2xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800/80 shadow-xs">
        <h2 className={`${subtitleClass} text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-2`}>
          <Utensils className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <span>Utensílios</span>
        </h2>
        <ul className="list-disc list-inside space-y-1.5 pl-1">
          {recipe.utensils.map((utensil, idx) => (
            <li key={idx} className={`${bodyClass} text-stone-800 dark:text-stone-200`}>
              {utensil}
            </li>
          ))}
        </ul>
      </section>

      {/* ORDERED SECTION 5 & 6: Tempo de preparo & Rendimento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* SECTION 5: Tempo de preparo */}
        <section className="p-5 rounded-2xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800/80 shadow-xs">
          <h2 className={`${subtitleClass} text-emerald-800 dark:text-emerald-400 mb-1 flex items-center gap-2`}>
            <Clock className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>Tempo de preparo</span>
          </h2>
          <p className={`${bodyClass} text-stone-800 dark:text-stone-200 font-medium`}>
            {recipe.prepTime}
          </p>
        </section>

        {/* SECTION 6: Rendimento */}
        <section className="p-5 rounded-2xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800/80 shadow-xs">
          <h2 className={`${subtitleClass} text-emerald-800 dark:text-emerald-400 mb-1 flex items-center gap-2`}>
            <Users className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>Rendimento</span>
          </h2>
          <p className={`${bodyClass} text-stone-800 dark:text-stone-200 font-medium`}>
            {recipe.yield}
          </p>
        </section>
      </div>

      {/* ORDERED SECTION 7: Modo de preparo */}
      <section className="p-6 rounded-3xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800 gap-2">
          <h2 className={`${subtitleClass} text-emerald-800 dark:text-emerald-400`}>
            Modo de preparo
          </h2>
          <button
            onClick={() => setShowStepByStep(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[15px] font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 flex items-center gap-1.5 min-h-[52px] active:scale-95 transition-all border border-emerald-200 dark:border-emerald-800"
          >
            <span>Ver em tela cheia</span>
            <Play className="w-4 h-4 fill-current" />
          </button>
        </div>

        <ol className="space-y-4 pt-1">
          {recipe.steps.map((step, idx) => {
            const techniqueMatch = findTechniqueInText(step);
            return (
              <li
                key={idx}
                className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-700/60 space-y-2"
              >
                <p className={`${stepClass} text-stone-900 dark:text-stone-100 leading-relaxed`}>
                  {step}
                </p>
                {techniqueMatch && (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGuideTechniqueId(techniqueMatch.id);
                        setIsTechniqueGuideOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-bold text-teal-800 dark:text-teal-300 bg-teal-100/80 hover:bg-teal-200 dark:bg-teal-950/80 dark:hover:bg-teal-900/80 border border-teal-300/60 dark:border-teal-800 transition-colors"
                      title={`Ver técnica ${techniqueMatch.name} no Guia`}
                    >
                      <Flame className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Ver Técnica: {techniqueMatch.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {/* Secondary Step Button */}
        <button
          onClick={() => setShowStepByStep(true)}
          className="w-full min-h-[52px] mt-2 py-3 px-4 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 font-bold text-[17px] flex items-center justify-center gap-2 transition-colors border border-emerald-300/60 dark:border-emerald-800/60"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Iniciar Modo Passo a Passo</span>
        </button>
      </section>

      {/* ORDERED SECTION 8: Como utilizar */}
      <section className="p-5 rounded-2xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800/80 shadow-xs">
        <h2 className={`${subtitleClass} text-emerald-800 dark:text-emerald-400 mb-2`}>
          Como utilizar
        </h2>
        <p className={`${bodyClass} text-stone-800 dark:text-stone-200 leading-relaxed`}>
          {recipe.howToUse}
        </p>
      </section>

      {/* ORDERED SECTION 9: Melhor momento */}
      <section className="p-5 rounded-2xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800/80 shadow-xs">
        <h2 className={`${subtitleClass} text-emerald-800 dark:text-emerald-400 mb-2`}>
          Melhor momento
        </h2>
        <p className={`${bodyClass} text-stone-800 dark:text-stone-200 leading-relaxed`}>
          {recipe.bestMoment}
        </p>
      </section>

      {/* ORDERED SECTION 10: Armazenamento */}
      <section className="p-5 rounded-2xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800/80 shadow-xs">
        <h2 className={`${subtitleClass} text-emerald-800 dark:text-emerald-400 mb-2`}>
          Armazenamento
        </h2>
        <p className={`${bodyClass} text-stone-800 dark:text-stone-200 leading-relaxed`}>
          {recipe.storage}
        </p>
      </section>

      {/* ORDERED SECTION 11: Substituições */}
      <section className="p-5 rounded-2xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800/80 shadow-xs">
        <h2 className={`${subtitleClass} text-emerald-800 dark:text-emerald-400 mb-2`}>
          Substituições
        </h2>
        <p className={`${bodyClass} text-stone-800 dark:text-stone-200 leading-relaxed`}>
          {recipe.substitutions}
        </p>
      </section>

      {/* ORDERED SECTION 12: Dicas do Seu Neco */}
      <section className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800/60 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[24px] font-bold shrink-0 shadow-xs">
            👴
          </div>
          <div>
            <h2 className={`${subtitleClass} text-emerald-950 dark:text-emerald-200`}>
              Dicas do Seu Neco
            </h2>
            <span className="text-[14px] text-emerald-800 dark:text-emerald-400 font-medium">
              Segredos da sabedoria tradicional
            </span>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          {recipe.seuNecoTips.map((tip, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/90 dark:bg-[#1E2220]/90 border border-emerald-200 dark:border-emerald-800"
            >
              <p className={`${bodyClass} text-stone-900 dark:text-stone-100 leading-relaxed`}>
                {tip}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ORDERED SECTION 13: Atenção (High Visibility Box: Soft Yellow in Light, Dark Amber in Dark) */}
      <section
        className="p-6 rounded-3xl border-2 shadow-sm space-y-2.5 bg-[#FEF3C7] border-[#F59E0B] text-[#78350F] dark:bg-[#3A2300] dark:border-[#B45309] dark:text-[#FDE68A]"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-7 h-7 stroke-[2.5] text-[#D97706] dark:text-[#FBBF24] shrink-0" />
          <h2 className="text-[20px] font-extrabold uppercase tracking-wide">
            Atenção
          </h2>
        </div>

        <p className={`${bodyClass} font-semibold leading-relaxed pt-1`}>
          {recipe.attention}
        </p>
      </section>

      {/* Rodapé discreto "Aviso legal" */}
      <footer className="pt-6 pb-2 border-t border-stone-200/80 dark:border-stone-800 text-center">
        <button
          onClick={() => setIsLegalDisclaimerOpen(true)}
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors underline decoration-stone-300 dark:decoration-stone-700 underline-offset-4 cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-500" />
          <span>Aviso legal</span>
        </button>
      </footer>

      {/* Step-By-Step Modal */}
      {showStepByStep && (
        <StepByStepModal
          recipeTitle={recipe.title}
          steps={recipe.steps}
          onClose={() => setShowStepByStep(false)}
        />
      )}

      {/* Guia de Ingredientes Modal */}
      <IngredientGuideModal
        isOpen={isIngredientGuideOpen}
        onClose={() => setIsIngredientGuideOpen(false)}
        initialIngredientId={selectedGuideIngredientId}
      />

      {/* Guia de Técnicas Modal */}
      <TechniquesModal
        isOpen={isTechniqueGuideOpen}
        onClose={() => setIsTechniqueGuideOpen(false)}
        initialTechniqueId={selectedGuideTechniqueId}
      />

      {/* Aviso Legal Modal */}
      <LegalDisclaimerModal
        isOpen={isLegalDisclaimerOpen}
        onClose={() => setIsLegalDisclaimerOpen(false)}
        onOpenTermsPrivacy={() => setIsTermsPrivacyOpen(true)}
      />

      {/* Termos e Privacidade Modal */}
      <TermsPrivacyModal
        isOpen={isTermsPrivacyOpen}
        onClose={() => setIsTermsPrivacyOpen(false)}
      />
    </div>
  );
};
