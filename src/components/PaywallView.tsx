import React, { useState } from 'react';
import {
  Lock,
  Sparkles,
  CheckCircle2,
  Calendar,
  BookOpen,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
  Eye,
  ChevronRight,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Recipe } from '../types/recipe';
import { useAuth } from '../context/AuthContext';
import { useSubscription, STRIPE_PRICES } from '../context/SubscriptionContext';
import { AuthModal } from './AuthModal';

interface PaywallViewProps {
  previewRecipes: Recipe[];
  onSelectPreviewRecipe: (recipe: Recipe) => void;
  onOpenAccount: () => void;
}

export const PaywallView: React.FC<PaywallViewProps> = ({
  previewRecipes,
  onSelectPreviewRecipe,
  onOpenAccount,
}) => {
  const { user } = useAuth();
  const {
    startCheckout,
    checkSubscriptionStatus,
    isCheckingOut,
    checkoutError,
    setCheckoutError,
  } = useSubscription();

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<{ text: string; isSuccess?: boolean } | null>(
    null
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPlanForAuth, setSelectedPlanForAuth] = useState<'mensal' | 'anual'>('anual');

  const handleSubscribe = async (plan: 'mensal' | 'anual') => {
    if (!user) {
      setSelectedPlanForAuth(plan);
      setIsAuthModalOpen(true);
      return;
    }
    await startCheckout(plan);
  };

  // Botão 9: "Já paguei e não liberou"
  const handleCheckAlreadyPaid = async () => {
    setIsVerifying(true);
    setVerifyMessage(null);

    try {
      const updatedSub = await checkSubscriptionStatus();

      if (updatedSub && updatedSub.status === 'active') {
        setVerifyMessage({
          text: 'Pagamento confirmado! Seu acesso foi liberado com sucesso.',
          isSuccess: true,
        });
      } else {
        setVerifyMessage({
          text: 'Ainda não identificamos a confirmação do pagamento no sistema. Você pode conversar diretamente com o suporte.',
          isSuccess: false,
        });
      }
    } catch {
      setVerifyMessage({
        text: 'Erro ao consultar status. Entre em contato com o suporte pelo WhatsApp.',
        isSuccess: false,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const supportWhatsappUrl = `https://wa.me/5591985719332?text=${encodeURIComponent(
    `Olá Seu Neco! Já realizei o pagamento da assinatura com o e-mail ${
      user?.email || '[meu e-mail]'
    } e gostaria de liberar o meu acesso.`
  )}`;

  return (
    <div className="pb-32 max-w-2xl mx-auto px-4 pt-4 sm:pt-6 space-y-6">
      {/* Top Banner de Paywall */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-b from-emerald-900 via-emerald-950 to-stone-900 text-white shadow-xl text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-white/15 text-emerald-300 flex items-center justify-center backdrop-blur-xs">
          <Lock className="w-8 h-8 stroke-[2.2]" />
        </div>

        <div className="space-y-1">
          <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-tight">
            Acesso Completo do Seu Neco
          </h1>
          <p className="text-[16px] text-emerald-200 font-medium">
            Assinatura simples para cuidar da sua saúde com a sabedoria da terra
          </p>
        </div>

        {/* 3 Linhas Explicando o que a Pessoa Recebe */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-xs text-left space-y-3 border border-white/15">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[15px] sm:text-[16px] text-emerald-100 font-medium leading-snug">
              <strong>350 receitas tradicionais completas</strong> de chás, infusões, sucos e xaropes com modo de preparo passo a passo.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[15px] sm:text-[16px] text-emerald-100 font-medium leading-snug">
              <strong>Busca inteligente e fácil</strong> por categoria, momento do dia, ingredientes da sua horta e utensílios.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[15px] sm:text-[16px] text-emerald-100 font-medium leading-snug">
              <strong>Guias exclusivos A–Z</strong>, tabela de medidas em fonte grande, listas de feira com marcação e calendário de 30 dias.
            </p>
          </div>
        </div>

        {!user && (
          <p className="text-[14px] text-emerald-200">
            Já tem uma conta cadastrada?{' '}
            <button
              onClick={() => {
                setIsAuthModalOpen(true);
              }}
              className="font-bold underline text-white hover:text-emerald-100"
            >
              Fazer login
            </button>
          </p>
        )}
      </div>

      {/* Erro de Checkout se houver */}
      {checkoutError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-[14px] flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-bold">Aviso sobre o pagamento:</p>
            <p>{checkoutError}</p>
          </div>
          <button
            onClick={() => setCheckoutError(null)}
            className="text-rose-500 font-bold hover:text-rose-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* DOIS CARTÕES GRANDES: MENSAL E ANUAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CARTÃO 1: PLANO MENSAL */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1E2220] border-2 border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Assinatura Flexível
              </span>
              <span className="text-[12px] font-bold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                Mês a mês
              </span>
            </div>

            <div>
              <h2 className="text-[22px] font-extrabold text-stone-900 dark:text-stone-100">
                Plano Mensal
              </h2>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[32px] font-black text-stone-900 dark:text-stone-100">
                  R$ 19,90
                </span>
                <span className="text-[15px] font-bold text-stone-500 dark:text-stone-400">
                  /mês
                </span>
              </div>
            </div>

            <p className="text-[14px] text-stone-600 dark:text-stone-400 leading-relaxed">
              Renovação mensal automática. Cancele a qualquer momento sem nenhuma burocracia ou multa.
            </p>
          </div>

          <button
            onClick={() => handleSubscribe('mensal')}
            disabled={isCheckingOut}
            className="w-full min-h-[52px] rounded-2xl bg-stone-900 hover:bg-black dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-950 font-bold text-[16px] flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <span>Assinar Mensal</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* CARTÃO 2: PLANO ANUAL (DESTACADO COM ECONOMIA) */}
        <div className="relative p-6 rounded-3xl bg-linear-to-b from-emerald-50 to-emerald-100/50 dark:from-emerald-950/60 dark:to-[#1E2220] border-2 border-emerald-600 dark:border-emerald-500 shadow-md flex flex-col justify-between space-y-5">
          {/* Badge de Economia em Destaque */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-[12px] uppercase tracking-wider shadow-sm flex items-center gap-1 whitespace-nowrap">
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Economize R$ 141,80 / ano</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Melhor Escolha
              </span>
              <span className="text-[12px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-600 text-white">
                59% DE DESCONTO
              </span>
            </div>

            <div>
              <h2 className="text-[22px] font-extrabold text-stone-900 dark:text-stone-100">
                Plano Anual
              </h2>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-[32px] font-black text-emerald-950 dark:text-emerald-300">
                  R$ 97,00
                </span>
                <span className="text-[15px] font-bold text-emerald-800 dark:text-emerald-400">
                  /ano
                </span>
              </div>
              <p className="text-[13px] font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">
                Equivale a apenas R$ 8,08 por mês
              </p>
            </div>

            <p className="text-[14px] text-stone-700 dark:text-stone-300 leading-relaxed">
              12 meses de acesso completo garantido pagando menos da metade do valor de 12 meses avulsos.
            </p>
          </div>

          <button
            onClick={() => handleSubscribe('anual')}
            disabled={isCheckingOut}
            className="w-full min-h-[54px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-[17px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <span>Assinar Plano Anual</span>
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* SEÇÃO DE PRÉVIA: 3 RECEITAS DE AMOSTRA (IS_PREVIEW = TRUE) */}
      <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-[18px] sm:text-[19px] font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <span>Amostra Gratuita (3 Receitas Liberadas)</span>
            </h3>
            <p className="text-[13px] text-stone-500 dark:text-stone-400">
              Conheça a qualidade do passo a passo antes de assinar
            </p>
          </div>
          <span className="text-[12px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300">
            Amostra
          </span>
        </div>

        <div className="space-y-3">
          {previewRecipes.map((rec) => (
            <div
              key={rec.id}
              onClick={() => onSelectPreviewRecipe(rec)}
              className="p-4 rounded-2xl bg-stone-50 hover:bg-emerald-50/50 dark:bg-stone-900/60 dark:hover:bg-emerald-950/30 border border-stone-200/80 dark:border-stone-800 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-emerald-800 dark:text-emerald-400">
                    {rec.code}
                  </span>
                  <span className="text-[12px] font-medium text-stone-500 dark:text-stone-400">
                    · {rec.categoryDisplay}
                  </span>
                </div>
                <h4 className="text-[16px] font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors">
                  {rec.title}
                </h4>
                <p className="text-[13px] text-stone-600 dark:text-stone-400 line-clamp-1">
                  {rec.traditionalUse}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[13px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                <span>Ver amostra</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BOTÃO "JÁ PAGUEI E NÃO LIBEROU" & SUPORTE */}
      <section className="p-5 sm:p-6 rounded-3xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center gap-2.5 text-stone-900 dark:text-stone-100">
          <HelpCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <h3 className="text-[17px] font-bold">Ajuda com sua Assinatura</h3>
        </div>

        <p className="text-[14px] text-stone-600 dark:text-stone-400 leading-relaxed">
          Se você realizou o pagamento pelo cartão ou Stripe e a liberação ainda não apareceu na tela, clique no botão abaixo para verificar a sincronização imediata com o banco de dados.
        </p>

        {/* Mensagem de Verificação */}
        {verifyMessage && (
          <div
            className={`p-3.5 rounded-xl text-[14px] font-medium ${
              verifyMessage.isSuccess
                ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
                : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
            }`}
          >
            {verifyMessage.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Botão 9: Já paguei e não liberou */}
          <button
            onClick={handleCheckAlreadyPaid}
            disabled={isVerifying}
            className="flex-1 min-h-[48px] rounded-2xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold text-[14px] flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700 transition-colors shadow-2xs active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verificando...' : 'Já paguei e não liberou'}</span>
          </button>

          {/* Link Falar com o suporte (WhatsApp) */}
          <a
            href={supportWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[48px] rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-2xs transition-colors active:scale-98"
          >
            <MessageCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Falar com o Suporte</span>
          </a>
        </div>
      </section>

      {/* Auth Modal quando usuário não logado clica em assinar */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signup"
      />
    </div>
  );
};
