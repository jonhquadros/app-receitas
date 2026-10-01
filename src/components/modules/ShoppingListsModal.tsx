import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingCart,
  Check,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import { SHOPPING_LISTS_DATA } from '../../data/extraModulesData';
import {
  ShoppingListPlan,
  ShoppingListCategory,
  ShoppingListItem,
} from '../../types/modules';

interface ShoppingListsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_NAMES: Record<ShoppingListCategory, { label: string; icon: string }> = {
  frutas: { label: 'Frutas', icon: '🍎' },
  folhas: { label: 'Folhas Frescas', icon: '🌿' },
  ervas: { label: 'Ervas e Flores', icon: '🌱' },
  raizes: { label: 'Raízes e Rizomas', icon: '🥕' },
  especiarias: { label: 'Especiarias', icon: '🪵' },
  complementares: { label: 'Acessórios e Complementos', icon: '🫙' },
};

const STORAGE_KEY = 'seu_neco_shopping_checked_v1';

export const ShoppingListsModal: React.FC<ShoppingListsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<ShoppingListPlan>('basica');
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Salvar no localStorage sempre que houver alteração
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedMap));
    } catch (err) {
      console.warn('Erro ao salvar lista no storage:', err);
    }
  }, [checkedMap]);

  if (!isOpen) return null;

  const currentList =
    SHOPPING_LISTS_DATA.find((l) => l.id === selectedPlan) || SHOPPING_LISTS_DATA[0];

  const toggleCheck = (itemId: string) => {
    setCheckedMap((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleClearCurrent = () => {
    if (window.confirm('Deseja desmarcar todos os itens desta lista?')) {
      setCheckedMap((prev) => {
        const next = { ...prev };
        currentList.itens.forEach((item) => {
          delete next[item.id];
        });
        return next;
      });
    }
  };

  // Agrupar itens por categoria da lista atual
  const groupedItems = currentList.itens.reduce<Record<ShoppingListCategory, ShoppingListItem[]>>(
    (acc, item) => {
      if (!acc[item.categoria]) {
        acc[item.categoria] = [];
      }
      acc[item.categoria].push(item);
      return acc;
    },
    {} as Record<ShoppingListCategory, ShoppingListItem[]>
  );

  const categoriesPresent = Object.keys(groupedItems) as ShoppingListCategory[];
  const totalItems = currentList.itens.length;
  const boughtItems = currentList.itens.filter((item) => checkedMap[item.id]).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FAF8F5] dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-[20px] sm:text-[22px] font-bold text-stone-900 dark:text-stone-100">
                Listas de Compras
              </h2>
              <p className="text-[13px] text-stone-500 dark:text-stone-400">
                Organize sua feira ou despensa com marcação interativa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Fechar Listas de Compras"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Plan Tabs Selector */}
        <div className="px-4 py-3 bg-stone-100/80 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 overflow-x-auto scrollbar-none flex items-center gap-2">
          {SHOPPING_LISTS_DATA.map((plan) => {
            const isActive = plan.id === selectedPlan;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`px-3.5 py-2 rounded-xl text-[14px] font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs dark:bg-emerald-600'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {plan.titulo}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Header da Lista e Progresso */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-stone-900 dark:text-stone-100">
                {currentList.titulo}
              </h3>
              <span className="text-[13px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                {boughtItems} de {totalItems} comprados
              </span>
            </div>
            <p className="text-[14px] text-stone-600 dark:text-stone-400">
              {currentList.descricao}
            </p>

            {boughtItems > 0 && (
              <button
                onClick={handleClearCurrent}
                className="text-[13px] font-bold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1.5 pt-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Desmarcar itens desta lista</span>
              </button>
            )}
          </div>

          {/* Categorias e Itens da Lista */}
          <div className="space-y-4">
            {categoriesPresent.map((catKey) => {
              const items = groupedItems[catKey];
              const catMeta = CATEGORY_NAMES[catKey] || { label: catKey, icon: '📦' };

              return (
                <div
                  key={catKey}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3"
                >
                  <h4 className="text-[16px] font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-2">
                    <span className="text-[18px]">{catMeta.icon}</span>
                    <span>{catMeta.label}</span>
                  </h4>

                  <div className="space-y-2">
                    {items.map((item) => {
                      const isChecked = !!checkedMap[item.id];
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleCheck(item.id)}
                          className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                            isChecked
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 text-stone-500 dark:text-stone-400'
                              : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200/80 dark:border-stone-700/60 text-stone-900 dark:text-stone-100 hover:border-emerald-400'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              isChecked
                                ? 'bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:text-stone-950'
                                : 'border-stone-400 dark:border-stone-500 bg-white dark:bg-stone-800'
                            }`}
                          >
                            {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>

                          <div className="flex-1 space-y-0.5">
                            <div className="flex flex-wrap items-baseline justify-between gap-1">
                              <span
                                className={`text-[16px] font-bold ${
                                  isChecked ? 'line-through text-stone-500 dark:text-stone-400' : ''
                                }`}
                              >
                                {item.nome}
                              </span>
                              <span className="text-[14px] font-medium text-emerald-800 dark:text-emerald-400">
                                {item.quantidade}
                              </span>
                            </div>
                            {item.observacao && (
                              <p className="text-[13px] text-stone-500 dark:text-stone-400">
                                {item.observacao}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
