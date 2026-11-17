import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, RefreshCw, X } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

interface RenewalPixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatExpiry = (value: string): string => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'Data não disponível';

  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('day')}/${get('month')} às ${get('hour')}:${get('minute')}`;
};

export const RenewalPixModal: React.FC<RenewalPixModalProps> = ({ isOpen, onClose }) => {
  const { pendingRenewal, renewalPixExpired, refreshRenewal } = useSubscription();
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const expiresAt = pendingRenewal ? new Date(pendingRenewal.pixExpiresAt).getTime() : 0;
  const isExpiredNow = Boolean(pendingRenewal && expiresAt <= Date.now());

  useEffect(() => {
    if (!pendingRenewal?.pixCode || isExpiredNow) {
      setQrImage(null);
      return;
    }

    QRCode.toDataURL(pendingRenewal.pixCode, { width: 260, margin: 1 })
      .then(setQrImage)
      .catch(() => setQrImage(null));
  }, [pendingRenewal?.pixCode, isExpiredNow]);

  useEffect(() => {
    if (!isOpen || !pendingRenewal || isExpiredNow) return;
    const delay = Math.max(0, expiresAt - Date.now() + 1000);
    const timer = window.setTimeout(() => {
      refreshRenewal();
    }, delay);
    return () => window.clearTimeout(timer);
  }, [isOpen, pendingRenewal, expiresAt, isExpiredNow, refreshRenewal]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!pendingRenewal?.pixCode) return;
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(pendingRenewal.pixCode);
      setCopied(true);
    } catch {
      setCopyError('Não foi possível copiar. Selecione o código e copie manualmente.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshRenewal();
    setRefreshing(false);
    setCopied(false);
    setCopyError(null);
  };

  const expired = renewalPixExpired || isExpiredNow;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="renewal-pix-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-stone-900 p-5 sm:p-6 shadow-xl space-y-5"
      >
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 id="renewal-pix-title" className="text-[22px] font-extrabold text-stone-900 dark:text-stone-100">
              Renovar assinatura
            </h2>
            <p className="mt-1 text-[15px] text-stone-600 dark:text-stone-400">
              Pague com o Pix abaixo para regularizar sua renovação.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {pendingRenewal && !isExpiredNow ? (
          <div className="space-y-4">
            {pendingRenewal.amountCents !== null && (
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-4 text-center">
                <p className="text-[14px] font-semibold text-emerald-900 dark:text-emerald-200">Valor da renovação</p>
                <p className="text-[26px] font-extrabold text-emerald-950 dark:text-emerald-100">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingRenewal.amountCents / 100)}
                </p>
              </div>
            )}

            <p className="text-[15px] text-stone-700 dark:text-stone-300 text-center">
              Abra o aplicativo do seu banco e escaneie o QR Code ou copie o código Pix.
            </p>

            {qrImage ? (
              <div className="flex justify-center">
                <img
                  src={qrImage}
                  alt="QR Code Pix para renovar a assinatura"
                  width={260}
                  height={260}
                  className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white p-2"
                />
              </div>
            ) : (
              <p className="text-center text-[14px] text-stone-600 dark:text-stone-400">
                Preparando o QR Code...
              </p>
            )}

            <div className="space-y-2">
              <label htmlFor="renewal-pix-code" className="block text-[15px] font-bold text-stone-800 dark:text-stone-200">
                Pix copia e cola
              </label>
              <textarea
                id="renewal-pix-code"
                readOnly
                aria-label="Código Pix copia e cola para renovação"
                value={pendingRenewal.pixCode}
                rows={4}
                className="w-full min-h-[104px] p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-[14px] text-stone-900 dark:text-stone-100 font-mono break-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="w-full min-h-[52px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[17px] flex items-center justify-center gap-2"
              >
                <Copy className="w-5 h-5" />
                {copied ? 'Código copiado' : 'Copiar código Pix'}
              </button>
              {copyError && (
                <p role="alert" className="text-[14px] text-rose-700 dark:text-rose-300">{copyError}</p>
              )}
            </div>

            <p className="text-center text-[14px] font-semibold text-amber-800 dark:text-amber-300">
              Válido até {formatExpiry(pendingRenewal.pixExpiresAt)} (horário de Brasília)
            </p>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full min-h-[48px] rounded-2xl border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-bold text-[15px] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[16px] leading-relaxed text-stone-800 dark:text-stone-200">
              {expired
                ? 'O Pix venceu. Um novo código será gerado automaticamente. Atualize em alguns minutos.'
                : 'Seu Pix de renovação ainda não está disponível. Ele é gerado perto da data de renovação. Tente novamente em alguns minutos.'}
            </p>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full min-h-[52px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[17px] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
