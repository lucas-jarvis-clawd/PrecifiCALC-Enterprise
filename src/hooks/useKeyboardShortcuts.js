import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Atalhos de teclado para power users
 * Ctrl/Cmd + K: Busca rápida (futuro)
 * G + D: Dashboard
 * G + S: Simulador
 * G + P: Precificação
 * G + C: Comparativo
 * G + R: Relatórios
 * ?: Help (mostra atalhos)
 */

const SHORTCUTS = {
  dashboard: { keys: ['g', 'd'], path: '/', label: 'Dashboard' },
  simulador: { keys: ['g', 's'], path: '/simulador', label: 'Simulador Tributário' },
  precificacao: { keys: ['g', 'p'], path: '/precificacao', label: 'Precificação' },
  comparativo: { keys: ['g', 'c'], path: '/comparativo', label: 'Comparativo' },
  custos: { keys: ['g', 'o'], path: '/custos', label: 'Custos Operacionais' },
  equilibrio: { keys: ['g', 'e'], path: '/equilibrio', label: 'Ponto de Equilíbrio' },
  projecao: { keys: ['g', 'j'], path: '/projecao', label: 'Projeção' },
  viabilidade: { keys: ['g', 'v'], path: '/viabilidade', label: 'Viabilidade' },
  dre: { keys: ['g', 'r'], path: '/dre', label: 'DRE' },
  relatorios: { keys: ['g', 'l'], path: '/relatorios', label: 'Relatórios' },
  configuracoes: { keys: ['g', 'x'], path: '/configuracoes', label: 'Configurações' },
};

export function useKeyboardShortcuts({ onShowHelp } = {}) {
  const navigate = useNavigate();
  
  const handleKeydown = useCallback((e) => {
    // Don't trigger in inputs/textareas
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) {
      return;
    }

    // ? = show help
    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      onShowHelp?.();
      return;
    }

    // Escape = close modals (bubble up)
    if (e.key === 'Escape') return;

    // G + <key> navigation (vim-style)
    if (e.key === 'g' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Wait for next key
      const handler = (e2) => {
        document.removeEventListener('keydown', handler);
        clearTimeout(timeout);
        
        if (e2.target.tagName === 'INPUT' || e2.target.tagName === 'TEXTAREA') return;
        
        const shortcut = Object.values(SHORTCUTS).find(s => s.keys[1] === e2.key);
        if (shortcut) {
          e2.preventDefault();
          navigate(shortcut.path);
        }
      };
      
      const timeout = setTimeout(() => {
        document.removeEventListener('keydown', handler);
      }, 1000);
      
      document.addEventListener('keydown', handler, { once: true });
    }
  }, [navigate, onShowHelp]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [handleKeydown]);

  return SHORTCUTS;
}

/**
 * Componente de overlay de atalhos de teclado
 */
export function KeyboardShortcutsHelp({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape' || e.key === '?') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full max-h-[80vh] overflow-y-auto animate-slideUp"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">⌨️ Atalhos de Teclado</h2>
            <p className="text-xs text-slate-500 mt-0.5">Navegação rápida para power users</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Navegação (G + tecla)</h3>
            <div className="space-y-1.5">
              {Object.entries(SHORTCUTS).map(([key, shortcut]) => (
                <div key={key} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{shortcut.label}</span>
                  <div className="flex items-center gap-1">
                    <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono text-slate-600 dark:text-slate-300">
                      G
                    </kbd>
                    <span className="text-slate-400 text-xs">então</span>
                    <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono text-slate-600 dark:text-slate-300">
                      {shortcut.keys[1].toUpperCase()}
                    </kbd>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Geral</h3>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-slate-600 dark:text-slate-300">Mostrar atalhos</span>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono text-slate-600 dark:text-slate-300">?</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm text-slate-600 dark:text-slate-300">Fechar modal/popup</span>
                <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono text-slate-600 dark:text-slate-300">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
