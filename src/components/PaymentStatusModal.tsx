import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Sparkles, ArrowRight } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface PaymentStatusModalProps {
  onGoToRecipes: () => void;
  onRetryPayment: () => void;
}

export const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  onGoToRecipes,
  onRetryPayment,
}) => {
  const [modalType, setModalType] = useState<'success' | 'canceled' | null>(null);
  const { checkSubscriptionStatus } = useSubscription();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true' || params.get('session_id')) {
      const sessionId = params.get('session_id');

      const verifyCheckout = async () => {
        try {
          if (sessionId && isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase.functions.invoke('verify-checkout-session', {
              body: { sessionId },
            });

            if (error) {
              console.warn('Não foi possível verificar o Checkout Session:', error);
            }

            if (data?.success === true) {
              const sub = await checkSubscriptionStatus();
              if (sub && ['active', 'trialing'].includes(sub.status) && sub.currentPeriodEnd) {
                setModalType('success');
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
              }
            }
          }

          const sub = await checkSubscriptionStatus();
          if (sub && ['active', 'trialing'].includes(sub.status) && sub.currentPeriodEnd) {
            setModalType('success');
          } else {
            setModalType('canceled');
          }
        } catch (err) {
          console.warn('Erro ao confirmar o pagamento:', err);
          setModalType('canceled');
        }

        // Limpa os parâmetros da URL sem recarregar a página
        window.history.replaceState({}, document.title, window.location.pathname);
      };

      verifyCheckout();
    } else if (params.get('canceled') === 'true') {
      setModalType('canceled');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [checkSubscriptionStatus]);

  if (!modalType) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-3xl bg-[#FAF8F5] dark:bg-[#1E2220] border-2 border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-200">
        {modalType === 'success' ? (
          <>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-[22px] font-black text-stone-900 dark:text-stone-100">
                Pagamento confirmado!
              </h3>
              <p className="text-[16px] font-bold text-emerald-800 dark:text-emerald-400">
                Seu acesso foi liberado.
              </p>
            </div>

            <p className="text-[14px] text-stone-600 dark:text-stone-400 leading-relaxed">
              Bem-vindo(a) ao acervo completo do Seu Neco. Todas as 350 receitas, guias e calendários já estão disponíveis para você.
            </p>

            <button
              onClick={() => {
                setModalType(null);
                onGoToRecipes();
              }}
              className="w-full min-h-[52px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 text-white font-extrabold text-[16px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Ver receitas</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <AlertCircle className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-[22px] font-black text-stone-900 dark:text-stone-100">
                Processo não concluído
              </h3>
              <p className="text-[15px] font-medium text-stone-600 dark:text-stone-400">
                O pagamento foi cancelado ou não foi finalizado no Stripe.
              </p>
            </div>

            <p className="text-[14px] text-stone-600 dark:text-stone-400 leading-relaxed">
              Nenhuma cobrança foi realizada no seu cartão. Você pode tentar novamente a qualquer momento com o plano que preferir.
            </p>

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={() => {
                  setModalType(null);
                  onRetryPayment();
                }}
                className="w-full min-h-[50px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <span>Tentar novamente</span>
              </button>

              <button
                onClick={() => setModalType(null)}
                className="w-full min-h-[46px] rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-[14px] transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
