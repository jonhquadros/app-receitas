import React, { useState } from 'react';
import {
  X,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react';
import { CALENDAR_30_DAYS_DATA } from '../../data/extraModulesData';
import { CalendarDayItem } from '../../types/modules';

interface Calendar30DaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipeNumber?: (recipeNumber: number) => void;
}

export const Calendar30DaysModal: React.FC<Calendar30DaysModalProps> = ({
  isOpen,
  onClose,
  onSelectRecipeNumber,
}) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  if (!isOpen) return null;

  const currentDay =
    CALENDAR_30_DAYS_DATA.find((d) => d.dia === selectedDayNumber) ||
    CALENDAR_30_DAYS_DATA[0];

  const getPeriodIcon = (periodo: string) => {
    switch (periodo) {
      case 'Manhã':
        return <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'Tarde':
        return <Sunset className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      case 'Noite':
        return <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Clock className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FAF8F5] dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Calendar className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-[20px] sm:text-[22px] font-bold text-stone-900 dark:text-stone-100">
                Calendário de 30 Dias
              </h2>
              <p className="text-[13px] text-stone-500 dark:text-stone-400">
                Organização diária com chás tradicionais do Seu Neco
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Fechar Calendário"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TEXTO FIXO OBRIGATÓRIO EM DESTAQUE */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/80 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-800 dark:text-amber-400 shrink-0" />
            <p className="text-[15px] sm:text-[16px] font-bold text-amber-950 dark:text-amber-200 leading-snug">
              Sugestão de organização, não é tratamento.
            </p>
          </div>

          {/* Grade Simples de 30 Dias */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-stone-900 dark:text-stone-100">
                Selecione o Dia (1 a 30)
              </h3>
              <span className="text-[13px] font-bold text-emerald-800 dark:text-emerald-400">
                Dia {selectedDayNumber} selecionado
              </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
                const isSelected = d === selectedDayNumber;
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDayNumber(d)}
                    className={`h-11 sm:h-12 rounded-xl text-[16px] font-bold flex items-center justify-center transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-500 dark:bg-emerald-600'
                        : 'bg-stone-100 dark:bg-stone-800/60 text-stone-800 dark:text-stone-200 hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card de Detalhes do Dia Selecionado */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-4">
            <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                  Dia {currentDay.dia} de 30
                </span>
                <span className="text-[12px] font-medium text-stone-500 dark:text-stone-400">
                  {currentDay.receitas.length} {currentDay.receitas.length === 1 ? 'sugestão' : 'sugestões'}
                </span>
              </div>
              <h3 className="text-[20px] font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">
                {currentDay.foco}
              </h3>
            </div>

            {/* Receitas Sugeridas para o Dia */}
            <div className="space-y-3">
              <h4 className="text-[14px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Receitas Sugeridas
              </h4>

              {currentDay.receitas.map((rec, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (onSelectRecipeNumber) {
                      onSelectRecipeNumber(rec.numero);
                      onClose();
                    }
                  }}
                  className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/60 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-all cursor-pointer space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                      {getPeriodIcon(rec.periodo)}
                      <span>{rec.periodo}</span>
                    </span>
                    <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                      Receita #{String(rec.numero).padStart(3, '0')}
                    </span>
                  </div>

                  <h5 className="text-[16px] font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                    {rec.titulo}
                  </h5>

                  <p className="text-[14px] text-stone-600 dark:text-stone-400">
                    {rec.finalidade}
                  </p>

                  <div className="pt-1 flex items-center gap-1 text-[13px] font-bold text-emerald-700 dark:text-emerald-400">
                    <span>Ver receita completa</span>
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
              ))}
            </div>

            {/* Observação do Dia */}
            {currentDay.observacao && (
              <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-800/40 text-[14px] text-stone-700 dark:text-stone-300">
                <strong>Observação:</strong> {currentDay.observacao}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
