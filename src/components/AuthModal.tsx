import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, User, X, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        if (!email.trim() || !password) {
          setErrorMessage('Por favor, informe seu e-mail e sua senha.');
          setLoading(false);
          return;
        }

        const res = await signIn(email, password);
        if (res.error) {
          setErrorMessage(res.error);
        } else {
          onClose();
        }
      } else if (mode === 'signup') {
        if (!email.trim() || !password) {
          setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
          setLoading(false);
          return;
        }

        const res = await signUp(email, password, nome);
        if (res.error) {
          setErrorMessage(res.error);
        } else {
          setSuccessMessage(
            'Conta criada com sucesso! Você já está conectado.'
          );
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          setErrorMessage('Informe seu e-mail cadastrado para enviarmos as instruções.');
          setLoading(false);
          return;
        }

        const res = await resetPassword(email);
        if (res.error) {
          setErrorMessage(res.error);
        } else {
          setSuccessMessage(
            'Enviamos as instruções de recuperação para o seu e-mail! Verifique sua caixa de entrada.'
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#1E2220] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header with Close */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[13px] font-bold text-emerald-800 dark:text-emerald-400 tracking-wider uppercase">
              {mode === 'signin'
                ? 'Acesse sua conta'
                : mode === 'signup'
                ? 'Cadastro do Seu Neco'
                : 'Recuperar Acesso'}
            </span>
            <h2 className="text-[22px] sm:text-[24px] font-bold text-stone-900 dark:text-stone-100">
              {mode === 'signin'
                ? 'Entrar no Aplicativo'
                : mode === 'signup'
                ? 'Criar Nova Conta'
                : 'Esqueci Minha Senha'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-3 text-red-800 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
            <p className="text-[14px] leading-snug">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
            <p className="text-[14px] leading-snug font-medium">{successMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-[14px] font-bold text-stone-700 dark:text-stone-300">
                Seu Nome (opcional)
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Como gostaria de ser chamado"
                  className="w-full pl-12 pr-4 h-[54px] rounded-2xl bg-stone-50 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-700 text-[16px] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[14px] font-bold text-stone-700 dark:text-stone-300">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                autoComplete="email"
                className="w-full pl-12 pr-4 h-[54px] rounded-2xl bg-stone-50 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-700 text-[16px] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[14px] font-bold text-stone-700 dark:text-stone-300">
                  Senha
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[13px] font-bold text-emerald-800 dark:text-emerald-400 hover:underline min-h-[32px] px-1"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha secreta"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="w-full pl-12 pr-24 h-[54px] rounded-2xl bg-stone-50 dark:bg-stone-900/90 border border-stone-200 dark:border-stone-700 text-[16px] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-[12px] font-bold flex items-center gap-1 min-h-[40px] transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>Ocultar</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Mostrar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[54px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[16px] flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] transition-all disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                Processando...
              </span>
            ) : mode === 'signin' ? (
              <>
                <span>Entrar</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </>
            ) : mode === 'signup' ? (
              <>
                <span>Cadastrar Gratuitamente</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </>
            ) : (
              <>
                <span>Enviar E-mail de Recuperação</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Mode Switchers */}
        <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-center space-y-2">
          {mode === 'signin' ? (
            <p className="text-[14px] text-stone-600 dark:text-stone-400">
              Não possui uma conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="font-bold text-emerald-800 dark:text-emerald-400 hover:underline min-h-[44px] px-1 inline-flex items-center"
              >
                Cadastre-se aqui
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p className="text-[14px] text-stone-600 dark:text-stone-400">
              Já tem uma conta cadastrada?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="font-bold text-emerald-800 dark:text-emerald-400 hover:underline min-h-[44px] px-1 inline-flex items-center"
              >
                Faça login
              </button>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-[14px] font-bold text-emerald-800 dark:text-emerald-400 hover:underline min-h-[44px] px-2"
            >
              ← Voltar para a tela de login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
