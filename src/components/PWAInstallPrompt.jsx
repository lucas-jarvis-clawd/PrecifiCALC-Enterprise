import { useState, useEffect, useCallback } from 'react';
import { Download, X, Smartphone, Share, Plus, Wifi, WifiOff, CheckCircle2 } from 'lucide-react';
import { onInstallAvailable, promptInstall, isInstalled, getIOSInstallInfo } from '../pwa/installPrompt';

/**
 * PWA Install Banner - Shows at bottom of screen when app can be installed
 */
export function PWAInstallBanner() {
  const [canShow, setCanShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isInstalled()) return;

    // Don't show if dismissed recently (24h)
    const dismissedAt = localStorage.getItem('precificalc_install_dismissed');
    if (dismissedAt && Date.now() - Number(dismissedAt) < 24 * 60 * 60 * 1000) {
      return;
    }

    const cleanup = onInstallAvailable((available) => {
      setCanShow(available);
    });

    return cleanup;
  }, []);

  const handleInstall = useCallback(async () => {
    setInstalling(true);
    const result = await promptInstall();
    setInstalling(false);

    if (result.outcome === 'accepted') {
      setCanShow(false);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem('precificalc_install_dismissed', String(Date.now()));
  }, []);

  if (!canShow || dismissed || isInstalled()) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slideUp md:left-auto md:right-6 md:max-w-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-brand-500/10 border border-slate-200 dark:border-slate-700 p-4 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <span className="text-white font-bold text-lg">P</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Instalar PrecifiCALC
              </h3>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Acesse offline direto da tela inicial. Funciona como app nativo.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleInstall}
                disabled={installing}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-brand-500/25 active:scale-95 disabled:opacity-50"
              >
                {installing ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                {installing ? 'Instalando...' : 'Instalar App'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl transition-colors"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * iOS Install Instructions - Shows for Safari on iOS
 */
export function IOSInstallGuide() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const { canShowPrompt } = getIOSInstallInfo();
    
    // Don't show if dismissed recently
    const dismissedAt = localStorage.getItem('precificalc_ios_dismissed');
    if (dismissedAt && Date.now() - Number(dismissedAt) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Delay showing by 30 seconds to not be intrusive
    if (canShowPrompt) {
      const timer = setTimeout(() => setShow(true), 30000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('precificalc_ios_dismissed', String(Date.now()));
  };

  if (!show || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slideUp">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Smartphone size={18} className="text-brand-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Instalar no iPhone/iPad
            </h3>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
              <span className="text-brand-600 dark:text-brand-400 font-bold text-[10px]">1</span>
            </div>
            <span>Toque no ícone <Share size={14} className="inline text-blue-500" /> de compartilhar</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
              <span className="text-brand-600 dark:text-brand-400 font-bold text-[10px]">2</span>
            </div>
            <span>Selecione <Plus size={14} className="inline" /> <strong>"Adicionar à Tela de Início"</strong></span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
              <span className="text-brand-600 dark:text-brand-400 font-bold text-[10px]">3</span>
            </div>
            <span>Confirme tocando em <strong>"Adicionar"</strong></span>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="w-full mt-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 rounded-xl transition-colors"
        >
          Entendi, obrigado
        </button>
      </div>
    </div>
  );
}

/**
 * Compact install button for sidebar/header
 */
export function InstallButton({ compact = false, className = '' }) {
  const [canShow, setCanShow] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isInstalled()) return;
    const cleanup = onInstallAvailable(setCanShow);
    return cleanup;
  }, []);

  const handleInstall = async () => {
    setInstalling(true);
    await promptInstall();
    setInstalling(false);
  };

  if (!canShow || isInstalled()) return null;

  if (compact) {
    return (
      <button
        onClick={handleInstall}
        disabled={installing}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-100 dark:hover:bg-brand-900/50 rounded-lg transition-all ${className}`}
        title="Instalar PrecifiCALC"
      >
        <Download size={13} />
        Instalar
      </button>
    );
  }

  return (
    <button
      onClick={handleInstall}
      disabled={installing}
      className={`flex items-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 rounded-xl transition-all shadow-md shadow-brand-500/20 active:scale-[0.98] ${className}`}
    >
      {installing ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <Download size={16} />
      )}
      {installing ? 'Instalando...' : 'Instalar App'}
    </button>
  );
}
