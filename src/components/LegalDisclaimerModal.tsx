import React from 'react';
import { X, ShieldAlert, HeartHandshake, CheckCircle2 } from 'lucide-react';

interface LegalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTermsPrivacy?: () => void;
}

export const LegalDisclaimerModal: React.FC<LegalDisclaimerModalProps> = ({
  isOpen,
  onClose,
  onOpenTermsPrivacy,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-3xl bg-[#FAF8F5] dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2.5 text-stone-900 dark:text-stone-100">
            <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <h3 className="text-[19px] font-bold">Aviso Legal e Médico</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Fechar Aviso Legal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[15px] text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
          As receitas do Seu Neco são preparações tradicionais e têm caráter estritamente informativo e cultural. Não substituem orientação médica, não tratam nem curam doenças.
        </div>

        <div className="space-y-2 text-[14px] text-stone-700 dark:text-stone-300 leading-relaxed">
          <p>
            • <strong>Grupos de atenção:</strong> Gestantes, lactantes, crianças, idosos com doenças crônicas e pessoas em uso contínuo de medicamentos devem sempre consultar um médico ou profissional de saúde antes de consumir qualquer chá ou erva.
          </p>
          <p>
            • <strong>Sintomas persistentes:</strong> Havendo qualquer desconforto ou persistência de sintomas, procure assistência médica especializada imediatamente.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          {onOpenTermsPrivacy && (
            <button
              onClick={() => {
                onClose();
                onOpenTermsPrivacy();
              }}
              className="flex-1 min-h-[48px] rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-[14px] transition-colors"
            >
              Ver Termos e Privacidade
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 min-h-[48px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[14px] transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
