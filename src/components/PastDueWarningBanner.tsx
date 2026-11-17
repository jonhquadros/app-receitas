import React, { useState } from 'react';
import { AlertTriangle, MessageCircle, RefreshCw } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { RenewalPixModal } from './RenewalPixModal';

const supportUrl = `https://wa.me/5591985719332?text=${encodeURIComponent(
  'Olá Seu Neco! A renovação da minha assinatura Pix não foi confirmada e gostaria de regularizar o meu acesso.'
)}`;

export const PastDueWarningBanner: React.FC = () => {
  const { isPastDue } = useSubscription();
  const [renewalModalOpen, setRenewalModalOpen] = useState(false);

  if (!isPastDue) return null;

  return (
    <>
      <div className="bg-amber-600 text-white px-4 py-3 shadow-sm border-b border-amber-700 animate-in fade-in duration-200">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <AlertTriangle className="w-5 h-5 text-amber-200 shrink-0" />
            <p className="text-[14px] font-bold leading-tight">
              Aviso de pagamento: a renovação da sua assinatura Pix não foi confirmada. Regularize para evitar a suspensão do acesso.
            </p>
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={() => setRenewalModalOpen(true)}
              className="whitespace-nowrap min-h-[48px] px-4 rounded-xl bg-white hover:bg-amber-50 text-amber-950 font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Renovar assinatura</span>
            </button>

            <a
              href={supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap min-h-[48px] px-4 rounded-xl border border-white/70 hover:bg-amber-700 text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Falar com o suporte</span>
            </a>
          </div>
        </div>
      </div>

      <RenewalPixModal isOpen={renewalModalOpen} onClose={() => setRenewalModalOpen(false)} />
    </>
  );
};
