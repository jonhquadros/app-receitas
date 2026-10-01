import React from 'react';
import { X, Scale, Info, CheckCircle2 } from 'lucide-react';
import { MEASURES_GUIDE_DATA } from '../../data/extraModulesData';

interface MeasuresGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MeasuresGuideModal: React.FC<MeasuresGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FAF8F5] dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
              <Scale className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-[20px] sm:text-[22px] font-bold text-stone-900 dark:text-stone-100">
                Guia de Medidas Caseiras
              </h2>
              <p className="text-[13px] text-stone-500 dark:text-stone-400">
                Tabela simples e direta para acertar a dose em qualquer xícara
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Fechar Guia de Medidas"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Regra de Ouro do Seu Neco */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-800 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[15px] text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
              <strong>Regra de ouro do Seu Neco:</strong> Na dúvida entre colocar mais ou menos erva, comece sempre com um pouco menos. O chá bom é aquele que traz conforto suave, nunca aquele que amarga a boca.
            </p>
          </div>

          {/* Tabela de Conversão com Fonte Grande */}
          <div className="space-y-3">
            {MEASURES_GUIDE_DATA.map((item, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800/80 shadow-2xs space-y-2"
              >
                {/* Cabeçalho da Medida com Fonte Grande */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-b border-stone-100 dark:border-stone-800 pb-2">
                  <span className="text-[20px] sm:text-[22px] font-extrabold text-stone-900 dark:text-stone-100">
                    {item.medida}
                  </span>
                  <span className="text-[17px] sm:text-[18px] font-bold text-emerald-800 dark:text-emerald-400">
                    = {item.equivalencia}
                  </span>
                </div>

                {/* Dica Prática de Cozinha */}
                <p className="text-[15px] sm:text-[16px] text-stone-700 dark:text-stone-300 leading-relaxed">
                  {item.dica_pratica}
                </p>
              </div>
            ))}
          </div>

          {/* Resumo Rápido em Destaque */}
          <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
            <h3 className="text-[16px] font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              <span>Resumo Rápido para a Geladeira</span>
            </h3>
            <ul className="text-[15px] text-emerald-950 dark:text-emerald-200 space-y-1 pl-1">
              <li>• <strong>1 colher de chá</strong> = 5 ml (sementes pequenas)</li>
              <li>• <strong>1 colher de sopa</strong> = 15 ml (folhas secas picadas)</li>
              <li>• <strong>1 xícara de chá</strong> = 200 ml de água (dose padrão)</li>
              <li>• <strong>1 caneca cheia</strong> = 250 ml (dose da Receita 004)</li>
              <li>• <strong>1 litro de água</strong> = 4 canecas de 250 ml</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
