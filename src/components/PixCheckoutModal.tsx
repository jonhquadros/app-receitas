import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { PLANS } from '../types/subscription';
import { useAuth } from '../context/AuthContext';
import { useSubscription, PixSubscriptionForm, PixMethod } from '../context/SubscriptionContext';

interface PixCheckoutModalProps {
  isOpen: boolean;
  plan: 'mensal' | 'anual';
  onClose: () => void;
}

type Step = 'form' | 'pix' | 'done';
type CepStatus = 'idle' | 'loading' | 'found' | 'notfound';

const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 15 * 60 * 1000;

const emptyAddress = { zip_code: '', street: '', street_number: '', neighborhood: '', city: '', state: '' };

export const PixCheckoutModal: React.FC<PixCheckoutModalProps> = ({ isOpen, plan, onClose }) => {
  const { user } = useAuth();
  const { createSubscription, checkSubscriptionStatus } = useSubscription();
  const checkRef = useRef(checkSubscriptionStatus);
  checkRef.current = checkSubscriptionStatus;
  const [checking, setChecking] = useState(false);

  const [step, setStep] = useState<Step>('form');
  const [method, setMethod] = useState<PixMethod>('pix_automatic');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [docType, setDocType] = useState<'cpf' | 'cnpj'>('cpf');
  const [docNumber, setDocNumber] = useState('');
  const [address, setAddress] = useState(emptyAddress);
  const [cepStatus, setCepStatus] = useState<CepStatus>('idle');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Um identificador novo por abertura: retentativas reenviam o mesmo, mas uma nova compra gera outro
  const requestIdRef = useRef<string>('');
  const pollStartRef = useRef<number>(0);
  const lastCepRef = useRef<string>('');

  useEffect(() => {
    if (isOpen) {
      requestIdRef.current = crypto.randomUUID();
      setStep('form');
      setMethod('pix_automatic');
      setError(null);
      setPixCode(null);
      setQrImage(null);
      setCopied(false);
      setChecking(false);
      setCepStatus('idle');
      setName(user?.user_metadata?.full_name ?? '');
    }
  }, [isOpen, user]);

  // Gera a imagem do QR Code a partir do texto copia e cola devolvido pela UvviPay
  useEffect(() => {
    if (!pixCode) {
      setQrImage(null);
      return;
    }
    QRCode.toDataURL(pixCode, { width: 260, margin: 1 })
      .then(setQrImage)
      .catch(() => setQrImage(null));
  }, [pixCode]);

  // Acompanha a confirmação do pagamento até a assinatura ficar ativa
  // Verifica o status no banco. Retorna true quando a assinatura está ativa.
  const verifyPayment = async (): Promise<boolean> => {
    try {
      const sub = await checkRef.current();
      return sub?.status === 'active';
    } catch (err) {
      console.warn('Falha ao verificar pagamento:', err);
      return false;
    }
  };

  useEffect(() => {
    if (step !== 'pix') return;
    pollStartRef.current = Date.now();
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      if (Date.now() - pollStartRef.current > POLL_TIMEOUT_MS) return;
      if (await verifyPayment()) {
        cancelled = true;
        setStep('done');
        return;
      }
      if (!cancelled) timer = window.setTimeout(tick, POLL_INTERVAL_MS);
    };
    let timer = window.setTimeout(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [step]);

  const handleManualCheck = async () => {
    setChecking(true);
    const paid = await verifyPayment();
    setChecking(false);
    if (paid) setStep('done');
    else setError('Ainda não recebemos a confirmação do pagamento. Aguarde alguns instantes e tente de novo.');
  };

  // Preenche rua, bairro, cidade e UF a partir do CEP (ViaCEP). Os campos continuam editáveis.
  const lookupCep = async (cepDigits: string) => {
    if (cepDigits === lastCepRef.current) return;
    lastCepRef.current = cepDigits;
    setCepStatus('loading');
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      const data = await response.json();
      if (!response.ok || data?.erro) {
        setCepStatus('notfound');
        return;
      }
      setAddress((prev) => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
      }));
      setCepStatus('found');
    } catch {
      setCepStatus('notfound');
    }
  };

  useEffect(() => {
    const digits = address.zip_code.replace(/\D/g, '');
    if (digits.length === 8) {
      lookupCep(digits);
    } else {
      lastCepRef.current = '';
      setCepStatus('idle');
    }
  }, [address.zip_code]);

  if (!isOpen) return null;

  const setAddr = (field: keyof typeof emptyAddress, value: string) =>
    setAddress((prev) => ({ ...prev, [field]: value }));

  const validateLocal = (): string | null => {
    if (!user?.email) return 'Faça login para continuar.';
    if (name.trim().length < 3) return 'Informe seu nome completo.';
    if (phone.replace(/\D/g, '').length < 10) return 'Informe um telefone com DDD.';
    if (docNumber.replace(/\D/g, '').length < 11) return docType === 'cpf' ? 'Informe seu CPF.' : 'Informe seu CNPJ.';
    if (address.zip_code.replace(/\D/g, '').length !== 8) return 'Informe um CEP com 8 números.';
    if (!address.street.trim() || !address.street_number.trim() || !address.neighborhood.trim() || !address.city.trim()) {
      return 'Preencha o endereço completo.';
    }
    if (address.state.trim().length !== 2) return 'Informe a UF com 2 letras.';
    if (!consent) return 'Confirme a autorização de cobrança para continuar.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = validateLocal();
    if (message) {
      setError(message);
      return;
    }
    setSubmitting(true);
    setError(null);

    const form: PixSubscriptionForm = {
      plan,
      method,
      client_request_id: requestIdRef.current,
      name: name.trim(),
      email: (user?.email ?? '').trim().toLowerCase(),
      phone: phone.replace(/\D/g, ''),
      document: { type: docType, number: docNumber.replace(/\D/g, '') },
      address: {
        zip_code: address.zip_code.replace(/\D/g, ''),
        street: address.street.trim(),
        street_number: address.street_number.trim(),
        neighborhood: address.neighborhood.trim(),
        city: address.city.trim(),
        state: address.state.trim().toUpperCase(),
      },
    };

    try {
      const result = await createSubscription(form);
      if (result.status === 'active') {
        setStep('done');
        return;
      }
      setPixCode(result.pixQrcode);
      setStep('pix');
    } catch (err: any) {
      setError(err?.message || 'Não foi possível gerar o Pix. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!pixCode) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
    } catch {
      setError('Não foi possível copiar. Selecione o código e copie manualmente.');
    }
  };

  const inputClass =
    'w-full min-h-[48px] px-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 text-[16px] text-stone-900 dark:text-stone-100';
  const labelClass = 'block text-[15px] font-bold text-stone-800 dark:text-stone-200 mb-1';

  const optionClass = (selected: boolean, disabled = false) =>
    [
      'flex items-start gap-3 p-4 rounded-2xl border-2 min-h-[64px]',
      disabled
        ? 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 opacity-60 cursor-not-allowed'
        : selected
          ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 cursor-pointer'
          : 'border-stone-300 dark:border-stone-700 cursor-pointer',
    ].join(' ');
  const optionTitleClass = 'block text-[16px] font-extrabold text-stone-900 dark:text-stone-100';
  const optionTextClass = 'block text-[14px] text-stone-700 dark:text-stone-300';

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pix-checkout-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-stone-900 p-6 shadow-xl space-y-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="pix-checkout-title" className="text-[22px] font-extrabold text-stone-900 dark:text-stone-100">
              {step === 'done' ? 'Assinatura confirmada' : `Assinar ${PLANS[plan].name}`}
            </h2>
            <p className="text-[15px] text-stone-600 dark:text-stone-400">
              {PLANS[plan].priceFormatted} {PLANS[plan].period}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="min-h-[44px] min-w-[44px] text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 font-bold text-[18px]"
          >
            ✕
          </button>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <fieldset className="space-y-3">
              <legend className={labelClass}>Como você quer pagar?</legend>

              <label className={optionClass(method === 'pix_automatic')}>
                <input
                  type="radio"
                  name="pix-method"
                  className="mt-1 w-5 h-5"
                  checked={method === 'pix_automatic'}
                  onChange={() => setMethod('pix_automatic')}
                />
                <span>
                  <span className={optionTitleClass}>Pix Automático</span>
                  <span className={optionTextClass}>
                    Você autoriza uma vez e a renovação é cobrada sozinha. Não precisa lembrar de pagar.
                  </span>
                </span>
              </label>

              <label className={optionClass(method === 'pix_cycle')}>
                <input
                  type="radio"
                  name="pix-method"
                  className="mt-1 w-5 h-5"
                  checked={method === 'pix_cycle'}
                  onChange={() => setMethod('pix_cycle')}
                />
                <span>
                  <span className={optionTitleClass}>Pix a cada renovação</span>
                  <span className={optionTextClass}>
                    Você paga um novo Pix a cada renovação do plano, sem autorização automática.
                  </span>
                </span>
              </label>

              <label className={optionClass(false, true)} aria-disabled="true">
                <input type="radio" name="pix-method" className="mt-1 w-5 h-5" disabled />
                <span>
                  <span className={optionTitleClass}>
                    Cartão de crédito{' '}
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-[12px] font-bold text-stone-700 dark:text-stone-300">
                      Em breve
                    </span>
                  </span>
                  <span className={optionTextClass}>Ainda não está disponível.</span>
                </span>
              </label>
            </fieldset>

            <div>
              <label htmlFor="pix-name" className={labelClass}>Nome completo</label>
              <input id="pix-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
            <div>
              <label htmlFor="pix-phone" className={labelClass}>Telefone com DDD</label>
              <input id="pix-phone" type="tel" inputMode="tel" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="11 98765-4321" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label htmlFor="pix-doc-type" className={labelClass}>Documento</label>
                <select id="pix-doc-type" className={inputClass} value={docType} onChange={(e) => setDocType(e.target.value as 'cpf' | 'cnpj')}>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                </select>
              </div>
              <div className="col-span-2">
                <label htmlFor="pix-doc" className={labelClass}>{docType === 'cpf' ? 'Número do CPF' : 'Número do CNPJ'}</label>
                <input id="pix-doc" inputMode="numeric" className={inputClass} value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label htmlFor="pix-zip" className={labelClass}>CEP</label>
                <input id="pix-zip" inputMode="numeric" className={inputClass} value={address.zip_code} onChange={(e) => setAddr('zip_code', e.target.value)} autoComplete="postal-code" />
              </div>
              <div className="col-span-2">
                <label htmlFor="pix-number" className={labelClass}>Número</label>
                <input id="pix-number" inputMode="numeric" className={inputClass} value={address.street_number} onChange={(e) => setAddr('street_number', e.target.value)} />
              </div>
            </div>
            {cepStatus === 'loading' && (
              <p className="text-[14px] text-stone-600 dark:text-stone-400">Buscando endereço pelo CEP...</p>
            )}
            {cepStatus === 'notfound' && (
              <p className="text-[14px] text-amber-800 dark:text-amber-300">CEP não encontrado. Preencha o endereço abaixo.</p>
            )}
            <div>
              <label htmlFor="pix-street" className={labelClass}>Rua</label>
              <input id="pix-street" className={inputClass} value={address.street} onChange={(e) => setAddr('street', e.target.value)} autoComplete="address-line1" />
            </div>
            <div>
              <label htmlFor="pix-neighborhood" className={labelClass}>Bairro</label>
              <input id="pix-neighborhood" className={inputClass} value={address.neighborhood} onChange={(e) => setAddr('neighborhood', e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label htmlFor="pix-city" className={labelClass}>Cidade</label>
                <input id="pix-city" className={inputClass} value={address.city} onChange={(e) => setAddr('city', e.target.value)} autoComplete="address-level2" />
              </div>
              <div className="col-span-1">
                <label htmlFor="pix-state" className={labelClass}>UF</label>
                <input id="pix-state" maxLength={2} className={inputClass} value={address.state} onChange={(e) => setAddr('state', e.target.value)} />
              </div>
            </div>

            <label className="flex items-start gap-3 text-[14px] text-stone-700 dark:text-stone-300">
              <input type="checkbox" className="mt-1 w-5 h-5" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                {method === 'pix_automatic'
                  ? 'Autorizo o uso destes dados para emitir a cobrança e gerenciar minha assinatura, conforme a política de privacidade. Entendo que a cobrança por Pix Automático é renovada no intervalo do plano, e que posso cancelar quando quiser.'
                  : 'Autorizo o uso destes dados para emitir a cobrança e gerenciar minha assinatura, conforme a política de privacidade. Entendo que preciso pagar um novo Pix a cada renovação do plano, e que posso cancelar quando quiser.'}
              </span>
            </label>

            {error && (
              <p role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 text-[14px] font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[52px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[17px] disabled:opacity-50"
            >
              {submitting ? 'Gerando Pix...' : 'Gerar código Pix'}
            </button>
          </form>
        )}

        {step === 'pix' && (
          <div className="space-y-4">
            <p className="text-[16px] text-stone-800 dark:text-stone-200">
              Abra o app do seu banco e escolha Pix. Você pode ler o QR Code com a câmera ou copiar o código.
            </p>
            {qrImage && (
              <div className="flex justify-center">
                <img src={qrImage} alt="QR Code para pagamento Pix" width={260} height={260} className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white p-2" />
              </div>
            )}
            {pixCode ? (
              <>
                <textarea
                  readOnly
                  aria-label="Código Pix copia e cola"
                  value={pixCode}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-[13px] font-mono break-all"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full min-h-[52px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[17px]"
                >
                  {copied ? 'Código copiado' : 'Copiar código Pix'}
                </button>
              </>
            ) : (
              <p className="text-[15px] text-stone-700 dark:text-stone-300">
                O código Pix não foi recebido. Feche e tente novamente, ou fale com o suporte.
              </p>
            )}
            <p className="text-[14px] text-stone-600 dark:text-stone-400">Aguardando a confirmação do pagamento...</p>
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={checking}
              className="w-full min-h-[48px] rounded-2xl border border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold text-[15px] disabled:opacity-50"
            >
              {checking ? 'Verificando...' : 'Já paguei, verificar'}
            </button>
            {error && (
              <p role="alert" className="text-[14px] text-rose-700 dark:text-rose-300">{error}</p>
            )}
          </div>
        )}

        {step === 'done' && (
          <div className="space-y-4">
            <p className="text-[16px] text-stone-800 dark:text-stone-200">
              Pagamento confirmado! Seu acesso completo já está liberado.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[52px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[17px]"
            >
              Ver as receitas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
