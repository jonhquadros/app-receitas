import React from 'react';
import { AlertTriangle, MessageCircle } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

const supportUrl = `https://wa.me/5591985719332?text=${encodeURIComponent(
  'Olá Seu Neco! A renovação da minha assinatura Pix não foi confirmada e gostaria de regularizar o meu acesso.'
)}`;

export const PastDueWarningBanner: React.FC = () => {
  const { isPastDue } = useSubscription();

  if (!isPastDue) return null;

  return (
    <div className="bg-amber-600 text-white px-4 py-3 shadow-sm border-b border-amber-700 animate-in fade-in duration-200">
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <AlertTriangle className="w-5 h-5 text-amber-200 shrink-0" />
          <p className="text-[14px] font-bold leading-tight">
            Aviso de pagamento: a renovação da sua assinatura Pix não foi confirmada. Regularize para evitar a suspensão do acesso.
          </p>
        </div>

        <a
          href={supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-950 font-bold text-[14px] flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Falar com o suporte</span>
        </a>
      </div>
    </div>
  );
};
