import { useEffect, useState } from 'react';
import { Download, Smartphone, ShieldCheck } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallPwaGate() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (installed) return null;

  const handleInstall = async () => {
    if (installPrompt) {
      const result = await installPrompt.prompt();
      setInstallPrompt(null);

      if (result.outcome === 'accepted') {
        setInstalled(true);
      }
      return;
    }

    // Em navegadores móveis que não disponibilizam beforeinstallprompt,
    // a instalação precisa ser iniciada pelo menu do próprio navegador.
    setShowInstallHelp(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/80 px-5 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-pwa-title"
        className="w-full max-w-md rounded-3xl bg-white p-6 text-stone-900 shadow-2xl dark:bg-[#1E2220] dark:text-stone-100"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          <Download className="h-8 w-8" strokeWidth={2.5} />
        </div>

        <h2 id="install-pwa-title" className="text-center text-2xl font-extrabold tracking-tight">
          Instale o Seu Neco
        </h2>

        <p className="mt-3 text-center text-base leading-7 text-stone-600 dark:text-stone-300">
          Para ter uma experiência mais rápida e prática, instale o aplicativo no seu celular ou computador.
        </p>

        <div className="mt-5 space-y-3 text-sm text-stone-600 dark:text-stone-300">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>Acesso direto pela tela inicial.</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>Experiência de aplicativo, sem a barra do navegador.</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleInstall}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4 text-base font-extrabold text-white shadow-lg transition-transform active:scale-[0.98] hover:bg-emerald-800"
        >
          <Download className="h-5 w-5" />
          {installPrompt ? 'Instalar aplicativo' : 'Como instalar'}
        </button>

        {showInstallHelp && (
          <div className="mt-5 rounded-2xl bg-stone-100 p-4 text-sm leading-6 dark:bg-stone-800">
            {isIOS() ? (
              <>
                <strong>Como instalar no iPhone/iPad:</strong>
                <br />
                1. Toque em <strong>Compartilhar</strong> no Safari.
                <br />
                2. Escolha <strong>Adicionar à Tela de Início</strong>.
                <br />
                3. Confirme em <strong>Adicionar</strong>.
              </>
            ) : (
              <>
                <strong>Como instalar no celular:</strong>
                <br />
                1. Abra o menu do navegador (<strong>⋮</strong>).
                <br />
                2. Toque em <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.
                <br />
                3. Confirme a instalação.
              </>
            )}
            <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
              Depois de instalar, abra o Seu Neco pelo ícone criado na tela inicial.
            </p>
          </div>
        )}

        {!installPrompt && !showInstallHelp && (
          <p className="mt-4 text-center text-xs leading-5 text-stone-500 dark:text-stone-400">
            Se o botão não abrir a instalação automaticamente, siga as instruções acima pelo menu do navegador.
          </p>
        )}
      </div>
    </div>
  );
}
