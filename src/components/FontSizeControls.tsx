import React from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { useFontSize } from '../context/FontSizeContext';

interface FontSizeControlsProps {
  compact?: boolean;
}

export const FontSizeControls: React.FC<FontSizeControlsProps> = ({ compact = false }) => {
  const { fontScale, increaseFontSize, decreaseFontSize, resetFontSize, fontScaleLabel } =
    useFontSize();

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800/90 p-1 rounded-2xl border border-stone-200 dark:border-stone-700 min-h-[52px]">
        <button
          onClick={decreaseFontSize}
          disabled={fontScale === 0}
          className="min-h-[46px] min-w-[46px] px-3 flex items-center justify-center rounded-xl bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs font-bold active:scale-95 transition-transform"
          title="Diminuir tamanho do texto (A-)"
          aria-label="Diminuir tamanho do texto (A-)"
        >
          <div className="flex items-center gap-1 text-[17px] font-extrabold">
            <span>A</span>
            <Minus className="w-4 h-4 stroke-[3]" />
          </div>
        </button>

        <span className="px-1 text-[13px] font-bold text-stone-700 dark:text-stone-300 min-w-[55px] text-center select-none">
          {fontScaleLabel}
        </span>

        <button
          onClick={increaseFontSize}
          disabled={fontScale === 2}
          className="min-h-[46px] min-w-[46px] px-3 flex items-center justify-center rounded-xl bg-emerald-700 dark:bg-emerald-600 text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-xs font-bold active:scale-95 transition-transform"
          title="Aumentar tamanho do texto (A+)"
          aria-label="Aumentar tamanho do texto (A+)"
        >
          <div className="flex items-center gap-1 text-[17px] font-extrabold">
            <span>A</span>
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 space-y-3 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[18px] font-bold text-stone-900 dark:text-stone-100">
            Tamanho das letras nas receitas
          </h4>
          <p className="text-[14px] text-stone-600 dark:text-stone-400">
            Ajuste para ler com facilidade e conforto
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-[14px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
          {fontScaleLabel}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        <button
          onClick={decreaseFontSize}
          disabled={fontScale === 0}
          className="flex items-center justify-center gap-2 min-h-[52px] rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-bold disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all border border-stone-200 dark:border-stone-700"
          aria-label="Diminuir texto A-"
        >
          <Minus className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[18px]">A−</span>
        </button>

        <button
          onClick={resetFontSize}
          className="flex items-center justify-center gap-1.5 min-h-[52px] rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium active:scale-95 transition-all border border-stone-200 dark:border-stone-700"
          title="Voltar ao tamanho padrão"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-[15px]">Padrão</span>
        </button>

        <button
          onClick={increaseFontSize}
          disabled={fontScale === 2}
          className="flex items-center justify-center gap-2 min-h-[52px] rounded-xl bg-emerald-700 dark:bg-emerald-600 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all shadow-xs"
          aria-label="Aumentar texto A+"
        >
          <span className="text-[20px]">A+</span>
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
