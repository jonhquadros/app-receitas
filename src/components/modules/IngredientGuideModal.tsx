import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  BookOpen,
  Info,
  AlertTriangle,
  Leaf,
  ShieldAlert,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { INGREDIENT_GUIDE_DATA } from '../../data/extraModulesData';
import { IngredientGuideItem } from '../../types/modules';

interface IngredientGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIngredientId?: string | null;
}

export const IngredientGuideModal: React.FC<IngredientGuideModalProps> = ({
  isOpen,
  onClose,
  initialIngredientId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientGuideItem | null>(() => {
    if (initialIngredientId) {
      return (
        INGREDIENT_GUIDE_DATA.find(
          (i) =>
            i.id === initialIngredientId ||
            i.nome_popular.toLowerCase().includes(initialIngredientId.toLowerCase())
        ) || null
      );
    }
    return null;
  });

  // Atualizar seleção se mudar o initialIngredientId
  React.useEffect(() => {
    if (initialIngredientId) {
      const found = INGREDIENT_GUIDE_DATA.find(
        (i) =>
          i.id === initialIngredientId ||
          i.nome_popular.toLowerCase().includes(initialIngredientId.toLowerCase())
      );
      if (found) {
        setSelectedIngredient(found);
      }
    }
  }, [initialIngredientId]);

  // Lista ordenada de A a Z e filtrada pela busca
  const filteredList = useMemo(() => {
    const sorted = [...INGREDIENT_GUIDE_DATA].sort((a, b) =>
      a.nome_popular.localeCompare(b.nome_popular, 'pt-BR')
    );

    if (!searchQuery.trim()) return sorted;

    const q = searchQuery.toLowerCase().trim();
    return sorted.filter(
      (item) =>
        item.nome_popular.toLowerCase().includes(q) ||
        item.nome_cientifico.toLowerCase().includes(q) ||
        item.como_utilizar.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FAF8F5] dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            {selectedIngredient ? (
              <button
                onClick={() => setSelectedIngredient(null)}
                className="p-2 -ml-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                aria-label="Voltar para a lista A-Z"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            ) : (
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <BookOpen className="w-5 h-5 stroke-[2.5]" />
              </div>
            )}
            <div>
              <h2 className="text-[19px] sm:text-[21px] font-bold text-stone-900 dark:text-stone-100">
                {selectedIngredient ? selectedIngredient.nome_popular : 'Guia de Ingredientes A–Z'}
              </h2>
              <p className="text-[13px] text-stone-500 dark:text-stone-400">
                {selectedIngredient
                  ? selectedIngredient.nome_cientifico
                  : `${INGREDIENT_GUIDE_DATA.length} ingredientes com sabedoria e cuidados`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Fechar Guia"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {selectedIngredient ? (
            /* DETALHES COMPLETOS DO INGREDIENTE SELECIONADO (TODOS OS CAMPOS) */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Nome Científico e Categoria */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
                <p className="text-[13px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Nome Científico
                </p>
                <p className="text-[17px] font-bold text-stone-900 dark:text-stone-100 italic">
                  {selectedIngredient.nome_cientifico}
                </p>
              </div>

              {/* 1. Como Escolher */}
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1">
                <h3 className="text-[15px] font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                  <Leaf className="w-4 h-4 stroke-[2.5]" />
                  <span>Como Escolher</span>
                </h3>
                <p className="text-[15px] text-stone-800 dark:text-stone-200 leading-relaxed">
                  {selectedIngredient.como_escolher}
                </p>
              </div>

              {/* 2. Como Lavar / Higienizar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1">
                <h3 className="text-[15px] font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  <span>Como Lavar e Higienizar</span>
                </h3>
                <p className="text-[15px] text-stone-800 dark:text-stone-200 leading-relaxed">
                  {selectedIngredient.como_lavar}
                </p>
              </div>

              {/* 3. Como Preparar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1">
                <h3 className="text-[15px] font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 stroke-[2.5]" />
                  <span>Como Preparar</span>
                </h3>
                <p className="text-[15px] text-stone-800 dark:text-stone-200 leading-relaxed">
                  {selectedIngredient.como_preparar}
                </p>
              </div>

              {/* 4. Como Armazenar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1">
                <h3 className="text-[15px] font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                  <Info className="w-4 h-4 stroke-[2.5]" />
                  <span>Como Armazenar</span>
                </h3>
                <p className="text-[15px] text-stone-800 dark:text-stone-200 leading-relaxed">
                  {selectedIngredient.como_armazenar}
                </p>
              </div>

              {/* 5. Como Utilizar Tradicionalmente */}
              <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1">
                <h3 className="text-[15px] font-bold text-emerald-800 dark:text-emerald-400">
                  Como Utilizar na Rotina
                </h3>
                <p className="text-[15px] text-stone-800 dark:text-stone-200 leading-relaxed">
                  {selectedIngredient.como_utilizar}
                </p>
              </div>

              {/* 6. Cuidados Gerais */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 space-y-1">
                <h3 className="text-[15px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                  <span>Cuidados</span>
                </h3>
                <p className="text-[15px] text-amber-950 dark:text-amber-200 leading-relaxed">
                  {selectedIngredient.cuidados}
                </p>
              </div>

              {/* 7. Interações Medicamentosas */}
              <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-1">
                <h3 className="text-[15px] font-bold text-stone-900 dark:text-stone-100">
                  Possíveis Interações
                </h3>
                <p className="text-[15px] text-stone-700 dark:text-stone-300 leading-relaxed">
                  {selectedIngredient.interacoes}
                </p>
              </div>

              {/* 8. Quem Deve Ter Atenção Especial */}
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 space-y-1">
                <h3 className="text-[15px] font-bold text-rose-900 dark:text-rose-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
                  <span>Quem Deve Ter Atenção Redobrada</span>
                </h3>
                <p className="text-[15px] text-rose-950 dark:text-rose-200 leading-relaxed">
                  {selectedIngredient.quem_deve_ter_atencao}
                </p>
              </div>

              <button
                onClick={() => setSelectedIngredient(null)}
                className="w-full min-h-[50px] rounded-2xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-[15px] hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors mt-2"
              >
                Voltar para a Lista de Ingredientes
              </button>
            </div>
          ) : (
            /* LISTA A–Z COM BUSCA */
            <div className="space-y-3">
              {/* Campo de Busca Rápida */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar erva, folha, semente ou raiz..."
                  className="w-full min-h-[50px] pl-11 pr-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 text-[15px] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-sm font-bold"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Lista dos Ingredientes */}
              <div className="space-y-2 pt-1">
                {filteredList.length === 0 ? (
                  <div className="p-8 text-center text-stone-500 dark:text-stone-400">
                    Nenhum ingrediente encontrado com esse nome.
                  </div>
                ) : (
                  filteredList.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedIngredient(item)}
                      className="w-full text-left p-4 rounded-2xl bg-white dark:bg-stone-900 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 border border-stone-200 dark:border-stone-800/80 shadow-2xs flex items-center justify-between gap-3 active:scale-[0.99] transition-all"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-[17px] font-bold text-stone-900 dark:text-stone-100">
                          {item.nome_popular}
                        </h4>
                        <p className="text-[13px] text-stone-500 dark:text-stone-400 italic">
                          {item.nome_cientifico}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-[14px]">
                        <span>Ver detalhes</span>
                        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
