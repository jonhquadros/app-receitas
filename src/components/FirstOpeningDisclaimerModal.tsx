import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertCircle, HeartHandshake } from 'lucide-react';

const STORAGE_KEY = 'seu_neco_disclaimer_accepted_v1';

export const FirstOpeningDisclaimerModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(STORAGE_KEY);
      if (!accepted) {
        setIsOpen(true);
      }
    } catch {
      // Se não houver localStorage acessível, exibe por segurança
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {
      console.warn('Erro ao salvar aceite do aviso legal:', e);
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
    >
      <div className="w-full max-w-lg rounded-3xl bg-[#FAF8F5] dark:bg-[#1E2220] border-2 border-stone-200 dark:border-stone-700 shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
        {/* Ícone de Destaque */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center shadow-xs">
          <HeartHandshake className="w-9 h-9 stroke-[2.2]" />
        </div>

        {/* Título */}
        <div className="space-y-1">
          <h2
            id="disclaimer-title"
            className="text-[22px] sm:text-[24px] font-extrabold text-stone-900 dark:text-stone-100 tracking-tight"
          >
            Aviso de Responsabilidade
          </h2>
          <p className="text-[14px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
            Sabedoria Tradicional & Cuidado Consciente
          </p>
        </div>

        {/* Texto Exato Requisitado */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-2xs">
          <p className="text-[16px] sm:text-[17px] text-stone-800 dark:text-stone-200 leading-relaxed font-medium text-left sm:text-justify">
            As receitas são preparações tradicionais e têm caráter informativo. Não substituem orientação médica, não tratam nem curam doenças. Gestantes, lactantes, crianças, idosos com doenças crônicas e quem usa medicamentos devem consultar um profissional de saúde antes de consumir.
          </p>
        </div>

        {/* Botão Único Entendi */}
        <button
          onClick={handleAccept}
          className="w-full min-h-[56px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-[18px] sm:text-[19px] flex items-center justify-center shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Entendi</span>
        </button>
      </div>
    </div>
  );
};
