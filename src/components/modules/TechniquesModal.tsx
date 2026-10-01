import React, { useState } from 'react';
import {
  X,
  Flame,
  Droplet,
  Filter,
  Package,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';
import { TECHNIQUES_DATA } from '../../data/extraModulesData';
import { TechniqueItem, TechniqueKey } from '../../types/modules';

interface TechniquesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTechniqueId?: string | null;
}

export const TechniquesModal: React.FC<TechniquesModalProps> = ({
  isOpen,
  onClose,
  initialTechniqueId,
}) => {
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<TechniqueKey>(() => {
    if (initialTechniqueId && TECHNIQUES_DATA.some((t) => t.id === initialTechniqueId)) {
      return initialTechniqueId as TechniqueKey;
    }
    return 'infusao';
  });

  React.useEffect(() => {
    if (initialTechniqueId && TECHNIQUES_DATA.some((t) => t.id === initialTechniqueId)) {
      setSelectedTechniqueId(initialTechniqueId as TechniqueKey);
    }
  }, [initialTechniqueId]);

  if (!isOpen) return null;

  const currentTechnique =
    TECHNIQUES_DATA.find((t) => t.id === selectedTechniqueId) || TECHNIQUES_DATA[0];

  const getTechniqueIcon = (id: TechniqueKey) => {
    switch (id) {
      case 'infusao':
        return <Droplet className="w-5 h-5" />;
      case 'decoccao':
        return <Flame className="w-5 h-5" />;
      case 'maceracao':
        return <Sparkles className="w-5 h-5" />;
      case 'coagem':
        return <Filter className="w-5 h-5" />;
      case 'armazenamento':
        return <Package className="w-5 h-5" />;
      case 'higienizacao':
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <Droplet className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FAF8F5] dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
              <Flame className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-[20px] sm:text-[22px] font-bold text-stone-900 dark:text-stone-100">
                Técnicas Tradicionais
              </h2>
              <p className="text-[13px] text-stone-500 dark:text-stone-400">
                Os 6 métodos caseiros para extrair o melhor de cada planta
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Fechar Guia de Técnicas"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Segmented Selector for the 6 Techniques */}
        <div className="px-4 py-3 bg-stone-100/80 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 overflow-x-auto scrollbar-none flex items-center gap-2">
          {TECHNIQUES_DATA.map((t) => {
            const isActive = t.id === selectedTechniqueId;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTechniqueId(t.id)}
                className={`px-3.5 py-2 rounded-xl text-[14px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs dark:bg-emerald-600'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {getTechniqueIcon(t.id)}
                <span>{t.nome}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Título e Subtítulo da Técnica Atual */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
            <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-400">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950">
                {getTechniqueIcon(currentTechnique.id)}
              </div>
              <h3 className="text-[20px] font-bold text-stone-900 dark:text-stone-100">
                {currentTechnique.nome}
              </h3>
            </div>
            <p className="text-[15px] font-semibold text-emerald-800 dark:text-emerald-400">
              {currentTechnique.subtitulo}
            </p>
            <p className="text-[15px] text-stone-700 dark:text-stone-300 leading-relaxed pt-1">
              {currentTechnique.descricao}
            </p>
          </div>

          {/* Quando Usar */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1">
            <h4 className="text-[14px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Quando Usar Esta Técnica
            </h4>
            <p className="text-[15px] text-stone-900 dark:text-stone-100 font-medium">
              {currentTechnique.quando_usar}
            </p>
          </div>

          {/* Passo a Passo Prático */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
            <h4 className="text-[16px] font-bold text-stone-900 dark:text-stone-100">
              Passo a Passo Correto
            </h4>
            <div className="space-y-2.5">
              {currentTechnique.passo_a_passo.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/60 text-[15px] text-stone-800 dark:text-stone-200 leading-relaxed"
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* Dica de Sabedoria do Seu Neco */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
              <Lightbulb className="w-5 h-5 stroke-[2.5]" />
              <h4 className="text-[15px] font-bold">Dica do Seu Neco</h4>
            </div>
            <p className="text-[15px] text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
              "{currentTechnique.dica_seu_neco}"
            </p>
          </div>

          {/* Cuidados */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 space-y-1">
            <div className="flex items-center gap-2 text-rose-900 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
              <h4 className="text-[14px] font-bold uppercase tracking-wider">Atenção</h4>
            </div>
            <p className="text-[14px] text-rose-950 dark:text-rose-200 leading-relaxed">
              {currentTechnique.cuidados}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
