import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, X, Download, ArrowUpCircle } from 'lucide-react';

/**
 * Update notification banner - shows when new version is available
 */
export function PWAUpdateNotification({ updateSW }) {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Listen for the update signal from the SW registration
  useEffect(() => {
    if (updateSW) {
      // updateSW is a function that triggers the update
      setNeedRefresh(true);
    }
  }, [updateSW]);

  const handleUpdate = useCallback(async () => {
    if (!updateSW) return;
    
    setUpdating(true);
    try {
      // This will reload the page with the new version
      await updateSW(true);
    } catch (error) {
      console.error('[PWA] Update failed:', error);
      // Fallback: force reload
      window.location.reload();
    }
  }, [updateSW]);

  const handleDismiss = useCallback(() => {
    setNeedRefresh(false);
  }, []);

  if (!needRefresh) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[60] animate-slideDown md:left-auto md:right-6 md:max-w-sm">
      <div className="bg-gradient-to-r from-brand-500 to-cyan-500 rounded-2xl shadow-2xl shadow-brand-500/30 p-4 text-white">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <ArrowUpCircle size={22} />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Nova versão disponível!</h3>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs opacity-90 mt-0.5">
              Atualize para obter melhorias e correções.
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-brand-600 text-xs font-semibold rounded-xl transition-all hover:bg-white/90 active:scale-95 shadow-md disabled:opacity-50"
              >
                {updating ? (
                  <div className="w-3.5 h-3.5 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                {updating ? 'Atualizando...' : 'Atualizar agora'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-xs font-medium opacity-80 hover:opacity-100 rounded-xl transition-opacity"
              >
                Depois
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
