import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, CheckCircle, Sparkles } from 'lucide-react';

interface StepByStepModalProps {
  recipeTitle: string;
  steps: string[];
  onClose: () => void;
}

export const StepByStepModal: React.FC<StepByStepModalProps> = ({
  recipeTitle,
  steps,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = steps.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (!isLast) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const cleanStepText = (rawStep: string) => {
    // Strip leading number like "1. " if already present, since we render step badge
    return rawStep.replace(/^\d+\.\s*/, '');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 text-white overflow-hidden animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-800">
        <div className="max-w-[80%]">
          <div className="text-[14px] font-semibold text-emerald-400 uppercase tracking-wider">
            Modo Passo a Passo
          </div>
          <h2 className="text-[18px] sm:text-[20px] font-bold text-stone-100 truncate">
            {recipeTitle}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-3 rounded-full bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 min-h-[52px] min-w-[52px] flex items-center justify-center transition-colors active:scale-95"
          aria-label="Sair do modo passo a passo"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Center Step Content */}
      <div className="flex-1 flex flex-col justify-center my-auto max-w-xl mx-auto w-full py-6">
        {/* Step Indicator Badge */}
        <div className="flex items-center justify-between mb-6">
          <span className="inline-flex items-center px-4 py-2 rounded-2xl text-[16px] font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-600/50">
            Passo {currentStep + 1} de {totalSteps}
          </span>

          <div className="flex gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-8 bg-emerald-400'
                    : idx < currentStep
                    ? 'w-2.5 bg-emerald-700'
                    : 'w-2.5 bg-stone-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Text Container */}
        <div className="p-6 sm:p-8 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-2xl space-y-4 min-h-[220px] flex flex-col justify-center">
          <div className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-emerald-300 leading-snug">
            {currentStep + 1}. {cleanStepText(steps[currentStep])}
          </div>
        </div>

        {/* Seu Neco Encouragement */}
        <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60">
          <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white text-[18px] font-bold shrink-0">
            👴
          </div>
          <p className="text-[15px] sm:text-[16px] text-emerald-200">
            {isLast
              ? 'Prontinho! Sua preparação está concluída. Aproveite!'
              : 'Faça com calma e carinho. Quando terminar este passo, toque em "Próximo".'}
          </p>
        </div>
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="pt-4 border-t border-stone-800 max-w-xl mx-auto w-full grid grid-cols-2 gap-4">
        <button
          onClick={handlePrev}
          disabled={isFirst}
          className="flex items-center justify-center gap-2 h-16 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-[18px] sm:text-[20px] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-98 border border-stone-700"
          aria-label="Passo anterior"
        >
          <ChevronLeft className="w-6 h-6 stroke-[3]" />
          <span>Voltar</span>
        </button>

        {isLast ? (
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[18px] sm:text-[20px] shadow-lg active:scale-98 transition-all"
            aria-label="Concluir receita"
          >
            <CheckCircle className="w-6 h-6 stroke-[2.5]" />
            <span>Concluir</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center justify-center gap-2 h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[18px] sm:text-[20px] shadow-lg active:scale-98 transition-all"
            aria-label="Próximo passo"
          >
            <span>Próximo</span>
            <ChevronRight className="w-6 h-6 stroke-[3]" />
          </button>
        )}
      </div>
    </div>
  );
};
