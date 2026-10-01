import React from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Mail,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface TermsPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsPrivacyModal: React.FC<TermsPrivacyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FAF8F5] dark:bg-[#1E2220] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-[20px] sm:text-[22px] font-bold text-stone-900 dark:text-stone-100">
                Termos e Privacidade
              </h2>
              <p className="text-[13px] text-stone-500 dark:text-stone-400">
                Linguagem simples, transparência e conformidade com a LGPD
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Fechar Termos e Privacidade"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-stone-800 dark:text-stone-200 text-[15px] leading-relaxed">
          {/* Seção 1: Quem somos e objetivo */}
          <section className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
            <h3 className="text-[17px] font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>1. Sobre o Aplicativo e Finalidade Cultural</span>
            </h3>
            <p>
              O aplicativo <strong>Receitas do Seu Neco</strong> tem como única finalidade resgatar, organizar e compartilhar a sabedoria popular tradicional de infusões, chás e receitas caseiras de ervas e plantas do campo.
            </p>
            <p className="font-medium text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
              O conteúdo deste aplicativo tem <strong>caráter estritamente informativo e cultural</strong>. As preparações não substituem orientação médica, consultas, exames, diagnósticos ou tratamentos profissionais.
            </p>
          </section>

          {/* Seção 2: Privacidade e LGPD */}
          <section className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
            <h3 className="text-[17px] font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span>2. Privacidade e Seus Dados (LGPD - Lei 13.709/2018)</span>
            </h3>
            <p>
              Respeitamos integralmente a sua privacidade segundo os princípios de necessidade, transparência e segurança da LGPD:
            </p>
            <ul className="space-y-2 pl-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                <span>
                  <strong>Quais dados coletamos:</strong> Apenas o seu endereço de e-mail e nome (quando informado no cadastro) para autenticação e sincronização dos seus favoritos e tamanho de texto preferido.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                <span>
                  <strong>Não vendemos dados:</strong> Nós <strong>nunca vendemos, não alugamos e não compartilhamos</strong> seus dados pessoais com anunciantes, parceiros comerciais ou empresas de análise externa.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                <span>
                  <strong>Armazenamento seguro:</strong> Seus dados são protegidos por criptografia de ponta a ponta e controle restrito de acesso por banco de dados seguro.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                <span>
                  <strong>Seus direitos garantidos:</strong> Você tem o direito de solicitar a confirmação, correção de dados ou a <strong>exclusão completa e definitiva</strong> da sua conta e de todos os seus dados a qualquer momento, sem burocracia.
                </span>
              </li>
            </ul>
          </section>

          {/* Seção 3: Política de Cancelamento e Reembolso */}
          <section className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
            <h3 className="text-[17px] font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              <span>3. Política de Cancelamento e Reembolso Integral</span>
            </h3>
            <p>
              Acreditamos na total transparência e no respeito absoluto aos direitos do consumidor:
            </p>
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                <h4 className="font-bold text-stone-900 dark:text-stone-100">
                  Cancelamento Descomplicado
                </h4>
                <p className="text-[14px] text-stone-600 dark:text-stone-400 mt-0.5">
                  Você pode cancelar sua assinatura ou renovação a qualquer momento, sem qualquer fidelidade, multa ou retenção. O acesso permanece válido até o final do período vigente contratado.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <span>Garantia de Reembolso em até 7 Dias (CDC - Art. 49)</span>
                </h4>
                <p className="text-[14px] text-emerald-950 dark:text-emerald-300 mt-0.5">
                  Conforme o Código de Defesa do Consumidor para compras pela internet, se por qualquer motivo você não ficar 100% satisfeito(a) nos primeiros <strong>7 (sete) dias corridos</strong> após a compra, devolveremos <strong>100% do valor pago</strong>, sem perguntas e sem complicações.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
                <h4 className="font-bold text-stone-900 dark:text-stone-100">
                  Como Solicitar o Reembolso
                </h4>
                <p className="text-[14px] text-stone-600 dark:text-stone-400 mt-0.5">
                  Basta entrar em contato pelo nosso WhatsApp oficial de atendimento: <strong>+55 91 98571-9332</strong> informando o e-mail cadastrado. O estorno é processado imediatamente pela operadora de pagamento.
                </p>
              </div>
            </div>
          </section>

          {/* Seção 4: Contato e Encarregado de Dados (DPO) */}
          <section className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
            <h3 className="text-[17px] font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <span>4. Atendimento e Contato</span>
            </h3>
            <p>
              Para qualquer dúvida sobre seus dados, termos de uso, cancelamentos ou suporte geral:
            </p>
            <p className="font-medium text-stone-800 dark:text-stone-200">
              • WhatsApp de Atendimento: <strong>+55 (91) 98571-9332</strong><br />
              • E-mail: <strong>jonhquadros@gmail.com</strong>
            </p>
          </section>

          <button
            onClick={onClose}
            className="w-full min-h-[50px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[16px] transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
