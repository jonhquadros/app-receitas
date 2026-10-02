import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThemeSelector } from '../components/ThemeSelector';
import { FontSizeControls } from '../components/FontSizeControls';
import { AuthModal } from '../components/AuthModal';
import {
  User,
  ShieldCheck,
  LogOut,
  LogIn,
  MessageCircle,
  Sparkles,
  ChevronRight,
  BookOpen,
  Scale,
  Flame,
  ShoppingCart,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { useSubscription } from '../context/SubscriptionContext';
import { IngredientGuideModal } from '../components/modules/IngredientGuideModal';
import { MeasuresGuideModal } from '../components/modules/MeasuresGuideModal';
import { TechniquesModal } from '../components/modules/TechniquesModal';
import { ShoppingListsModal } from '../components/modules/ShoppingListsModal';
import { Calendar30DaysModal } from '../components/modules/Calendar30DaysModal';
import { TermsPrivacyModal } from '../components/TermsPrivacyModal';

interface MoreViewProps {
  onOpenAdmin?: () => void;
  onSelectRecipeNumber?: (recipeNumber: number) => void;
  onOpenPaywall?: () => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  onOpenAdmin,
  onSelectRecipeNumber,
  onOpenPaywall,
}) => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { subscription, hasAccess, isPastDue } = useSubscription();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Estados de abertura dos 5 Módulos Extras (Fase 5)
  const [isIngredientGuideOpen, setIsIngredientGuideOpen] = useState(false);
  const [isMeasuresGuideOpen, setIsMeasuresGuideOpen] = useState(false);
  const [isTechniquesOpen, setIsTechniquesOpen] = useState(false);
  const [isShoppingListsOpen, setIsShoppingListsOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Estado de Termos e Privacidade (Fase 6)
  const [isTermsPrivacyOpen, setIsTermsPrivacyOpen] = useState(false);

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    if (window.confirm('Tem certeza de que deseja sair da sua conta?')) {
      await signOut();
    }
  };

  return (
    <div className="space-y-6 pb-32 max-w-2xl mx-auto px-4 pt-4 sm:pt-6">
      {/* Title */}
      <div>
        <h1 className="text-[24px] sm:text-[28px] font-bold text-stone-900 dark:text-stone-100">
          Mais e Ajustes
        </h1>
        <p className="text-[15px] text-stone-600 dark:text-stone-400 mt-0.5">
          Módulos práticos, sabedoria tradicional e ajustes da sua conta
        </p>
      </div>

      {/* ==================================================================== */}
      {/* FASE 5 — MÓDULOS EXTRAS (EM CARTÕES GRANDES E DESTACADOS) */}
      {/* ==================================================================== */}
      <section className="space-y-3.5">
        <div>
          <h2 className="text-[20px] sm:text-[22px] font-extrabold text-stone-900 dark:text-stone-100">
            Módulos e Guias Práticos
          </h2>
          <p className="text-[14px] text-stone-600 dark:text-stone-400">
            Técnicas, medidas, listas de feira e organização diária do Seu Neco
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {/* CARTÃO 1: Guia de Ingredientes A–Z */}
          <button
            onClick={() => setIsIngredientGuideOpen(true)}
            className="w-full text-left p-5 sm:p-6 rounded-3xl bg-linear-to-br from-emerald-800 to-teal-900 text-white shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between min-h-[135px] group cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="p-3 rounded-2xl bg-white/15 text-white backdrop-blur-xs">
                <BookOpen className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-white/20 text-emerald-100">
                Lista A–Z Completa
              </span>
            </div>
            <div className="pt-3">
              <h3 className="text-[20px] font-bold tracking-tight flex items-center justify-between">
                <span>1. Guia de Ingredientes A–Z</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-[14px] text-emerald-100/90 leading-relaxed mt-1">
                Busca de A a Z com como escolher, lavar, preparar, armazenar, utilizar, cuidados e interações.
              </p>
            </div>
          </button>

          {/* CARTÃO 2: Guia de Medidas Caseiras */}
          <button
            onClick={() => setIsMeasuresGuideOpen(true)}
            className="w-full text-left p-5 sm:p-6 rounded-3xl bg-linear-to-br from-amber-700 to-orange-850 text-white shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between min-h-[135px] group cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="p-3 rounded-2xl bg-white/15 text-white backdrop-blur-xs">
                <Scale className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-white/20 text-amber-100">
                Fonte Grande
              </span>
            </div>
            <div className="pt-3">
              <h3 className="text-[20px] font-bold tracking-tight flex items-center justify-between">
                <span>2. Guia de Medidas Caseiras</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-[14px] text-amber-100/90 leading-relaxed mt-1">
                Tabela de conversão simples: colher de chá, sopa, xícara, copo, 100 ml, 250 ml e 1 litro.
              </p>
            </div>
          </button>

          {/* CARTÃO 3: Técnicas Tradicionais */}
          <button
            onClick={() => setIsTechniquesOpen(true)}
            className="w-full text-left p-5 sm:p-6 rounded-3xl bg-linear-to-br from-teal-800 to-cyan-950 text-white shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between min-h-[135px] group cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="p-3 rounded-2xl bg-white/15 text-white backdrop-blur-xs">
                <Flame className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-white/20 text-teal-100">
                6 Métodos Tradicionais
              </span>
            </div>
            <div className="pt-3">
              <h3 className="text-[20px] font-bold tracking-tight flex items-center justify-between">
                <span>3. Técnicas: Infusão, Decocção e mais</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-[14px] text-teal-100/90 leading-relaxed mt-1">
                Infusão, Decocção, Maceração, Coagem, Armazenamento e Higienização passo a passo.
              </p>
            </div>
          </button>

          {/* CARTÃO 4: Listas de Compras Práticas */}
          <button
            onClick={() => setIsShoppingListsOpen(true)}
            className="w-full text-left p-5 sm:p-6 rounded-3xl bg-linear-to-br from-emerald-900 to-stone-900 text-white shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between min-h-[135px] group cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="p-3 rounded-2xl bg-white/15 text-white backdrop-blur-xs">
                <ShoppingCart className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-white/20 text-emerald-200">
                Marcação com Checkbox
              </span>
            </div>
            <div className="pt-3">
              <h3 className="text-[20px] font-bold tracking-tight flex items-center justify-between">
                <span>4. Listas de Compras da Feira</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-[14px] text-emerald-100/90 leading-relaxed mt-1">
                Básica, Econômica, 7 dias e 30 dias por frutas, folhas, ervas, raízes e especiarias.
              </p>
            </div>
          </button>

          {/* CARTÃO 5: Calendário de 30 Dias */}
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="w-full text-left p-5 sm:p-6 rounded-3xl bg-linear-to-br from-stone-850 to-stone-950 text-white shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between min-h-[135px] group cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="p-3 rounded-2xl bg-white/15 text-white backdrop-blur-xs">
                <Calendar className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/30">
                Grade de 30 Dias
              </span>
            </div>
            <div className="pt-3">
              <h3 className="text-[20px] font-bold tracking-tight flex items-center justify-between">
                <span>5. Calendário de 30 Dias</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-[14px] text-stone-200/90 leading-relaxed mt-1">
                Grade simples com receitas sugeridas. Sugestão de organização, não é tratamento.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* 1. Minha Conta */}
      <section className="p-6 rounded-3xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              <User className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h2 className="text-[19px] font-bold text-stone-900 dark:text-stone-100">
              Minha Conta
            </h2>
          </div>

          {user && (
            <span
              className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                isAdmin
                  ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {isAdmin ? 'ADMINISTRADOR' : 'USUÁRIO'}
            </span>
          )}
        </div>

        {user ? (
          <div className="space-y-3 pt-1">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-1">
              <p className="text-[13px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                E-mail conectado
              </p>
              <p className="text-[16px] font-semibold text-stone-900 dark:text-stone-100 break-all">
                {user.email}
              </p>
              {profile?.nome && (
                <p className="text-[14px] text-stone-600 dark:text-stone-400">
                  Nome: <strong>{profile.nome}</strong>
                </p>
              )}
            </div>

            <button
              onClick={handleSignOut}
              className="w-full h-[50px] rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 text-[15px] font-bold flex items-center justify-center gap-2 transition-colors active:scale-98"
            >
              <LogOut className="w-5 h-5 stroke-[2.2]" />
              <span>Sair da Conta</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <p className="text-[15px] text-stone-600 dark:text-stone-400 leading-relaxed">
              Conecte-se para sincronizar seus favoritos em múltiplos aparelhos e gerenciar seus acessos.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => handleOpenAuth('signin')}
                className="h-[52px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-98"
              >
                <LogIn className="w-5 h-5 stroke-[2.5]" />
                <span>Entrar na Minha Conta</span>
              </button>
              <button
                onClick={() => handleOpenAuth('signup')}
                className="h-[52px] rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 font-bold text-[15px] flex items-center justify-center gap-2 transition-colors active:scale-98"
              >
                <span>Criar Conta Gratuita</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 2. Minha Assinatura (Fase 7 - Requirement 6) */}
      <section className="p-6 rounded-3xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              <CreditCard className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h2 className="text-[19px] font-bold text-stone-900 dark:text-stone-100">
              Minha Assinatura
            </h2>
          </div>

          <span
            className={`text-[12px] font-bold px-3 py-1 rounded-full ${
              hasAccess
                ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : isPastDue
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-400'
            }`}
          >
            {hasAccess ? 'ACESSO ATIVO' : isPastDue ? 'PAGAMENTO PENDENTE' : 'SEM ASSINATURA'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Plano Atual
            </span>
            <span className="text-[15px] font-bold text-stone-900 dark:text-stone-100">
              {isAdmin
                ? 'Administrador (Acesso Irrestrito)'
                : subscription?.manualOverride
                ? 'Acesso Manual (Liberado pelo Admin)'
                : subscription?.plan === 'anual'
                ? 'Plano Anual (R$ 97,00/ano)'
                : subscription?.plan === 'mensal'
                ? 'Plano Mensal (R$ 19,90/mês)'
                : 'Nenhum plano ativo'}
            </span>
          </div>

          {subscription?.currentPeriodEnd && (
            <div className="flex items-baseline justify-between pt-1 border-t border-stone-200/60 dark:border-stone-800">
              <span className="text-[13px] font-medium text-stone-500 dark:text-stone-400">
                Próxima Cobrança / Validade:
              </span>
              <span className="text-[14px] font-semibold text-stone-800 dark:text-stone-200">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
        </div>

        {!hasAccess && (
          <button
            onClick={onOpenPaywall}
            className="w-full min-h-[50px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span>Ver Planos e Assinar</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </section>

      {/* 3. Área Admin (Somente se role = 'admin') */}
      {isAdmin && (
        <section className="p-6 rounded-3xl bg-linear-to-r from-emerald-900 to-teal-950 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/20 text-white">
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h2 className="text-[19px] font-bold">Painel do Administrador</h2>
            </div>
            <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-emerald-100">
              Acesso Exclusivo
            </span>
          </div>

          <p className="text-[14px] text-emerald-100 leading-relaxed">
            Gerencie as receitas do Seu Neco, importe lotes CSV/JSON e controle o status de acesso dos usuários.
          </p>

          <button
            onClick={onOpenAdmin}
            className="w-full h-[52px] rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-[15px] flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-98 cursor-pointer"
          >
            <span>Acessar Área do Administrador</span>
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </section>
      )}

      {/* 3. Tema (Claro / Escuro / Automático) */}
      <section className="p-5 rounded-3xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 shadow-xs space-y-1">
        <ThemeSelector />
      </section>

      {/* 4. Tamanho do Texto */}
      <section>
        <FontSizeControls />
      </section>

      {/* 5. Suporte (Link Direto WhatsApp) */}
      <section className="p-6 rounded-3xl bg-white dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
            <MessageCircle className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h2 className="text-[19px] font-bold text-stone-900 dark:text-stone-100">
            Suporte Direto
          </h2>
        </div>

        <p className="text-[15px] text-stone-600 dark:text-stone-400 leading-relaxed">
          Dúvidas sobre as receitas, sugestões ou suporte com sua conta? Fale diretamente conosco pelo WhatsApp.
        </p>

        <a
          href="https://wa.me/5591985719332"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-[52px] rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-98"
        >
          <MessageCircle className="w-5 h-5 stroke-[2.5]" />
          <span>Conversar no WhatsApp</span>
        </a>
      </section>

      {/* 6. Termos e Aviso Legal */}
      <section className="p-6 rounded-3xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
        <div className="flex items-center gap-2.5 text-stone-900 dark:text-stone-100">
          <ShieldCheck className="w-6 h-6 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <h2 className="text-[19px] font-bold">Termos e Aviso Legal</h2>
        </div>

        <p className="text-[14px] text-stone-700 dark:text-stone-300 leading-relaxed">
          As preparações e infusões deste aplicativo são receitas caseiras tradicionais da sabedoria popular. Elas <strong>não substituem consultas, diagnósticos ou tratamentos médicos</strong>.
        </p>

        <p className="text-[14px] text-stone-700 dark:text-stone-300 leading-relaxed">
          Em caso de gestação, lactação, uso contínuo de medicamentos ou sintomas graves, consulte sempre um médico ou profissional habilitado de saúde.
        </p>

        <button
          onClick={() => setIsTermsPrivacyOpen(true)}
          className="w-full min-h-[48px] rounded-2xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-emerald-800 dark:text-emerald-300 font-bold text-[14px] flex items-center justify-center gap-2 border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
        >
          <span>Ler Termos e Privacidade (LGPD & Reembolso)</span>
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </section>

      {/* ==================================================================== */}
      {/* MODAIS DOS 5 MÓDULOS EXTRAS (FASE 5) */}
      {/* ==================================================================== */}
      <IngredientGuideModal
        isOpen={isIngredientGuideOpen}
        onClose={() => setIsIngredientGuideOpen(false)}
      />

      <MeasuresGuideModal
        isOpen={isMeasuresGuideOpen}
        onClose={() => setIsMeasuresGuideOpen(false)}
      />

      <TechniquesModal
        isOpen={isTechniquesOpen}
        onClose={() => setIsTechniquesOpen(false)}
      />

      <ShoppingListsModal
        isOpen={isShoppingListsOpen}
        onClose={() => setIsShoppingListsOpen(false)}
      />

      <Calendar30DaysModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onSelectRecipeNumber={onSelectRecipeNumber}
      />

      {/* Termos e Privacidade Modal (Fase 6) */}
      <TermsPrivacyModal
        isOpen={isTermsPrivacyOpen}
        onClose={() => setIsTermsPrivacyOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};
