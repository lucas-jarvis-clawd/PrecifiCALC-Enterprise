import { Component } from 'react';
import { RefreshCw, AlertTriangle, Home, Bug, Copy, Check } from 'lucide-react';

/**
 * Error Boundary profissional - nunca quebra na frente do usuário
 * Captura erros de renderização, mostra UI amigável, permite recovery
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      copied: false 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log para analytics
    try {
      const errorLog = {
        message: error?.message,
        stack: error?.stack?.slice(0, 500),
        component: errorInfo?.componentStack?.slice(0, 300),
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };
      
      // Salva no localStorage para debug
      const logs = JSON.parse(localStorage.getItem('precificalc_error_log') || '[]');
      logs.push(errorLog);
      // Mantém apenas últimos 20 erros
      if (logs.length > 20) logs.splice(0, logs.length - 20);
      localStorage.setItem('precificalc_error_log', JSON.stringify(logs));
      
      // Console detalhado para desenvolvedores
      console.error('[Vértice Error Boundary]', error, errorInfo);
    } catch { /* ignore logging errors */ }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleCopyError = () => {
    const errorText = `Vértice Error Report\n\nError: ${this.state.error?.message}\n\nStack: ${this.state.error?.stack?.slice(0, 500)}\n\nComponent: ${this.state.errorInfo?.componentStack?.slice(0, 300)}`;
    navigator.clipboard.writeText(errorText).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback({ 
          error: this.state.error, 
          retry: this.handleRetry 
        });
      }

      const isMinimal = this.props.minimal;

      if (isMinimal) {
        return (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  {this.props.errorMessage || 'Erro ao carregar este módulo'}
                </p>
                <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                  {this.state.error?.message?.slice(0, 100)}
                </p>
              </div>
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
              >
                <RefreshCw size={12} />
                Tentar novamente
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 animate-fadeIn">
          <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-500 p-6 text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Ops! Algo deu errado</h2>
              <p className="text-red-100 text-sm mt-1">
                Não se preocupe, seus dados estão seguros
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Ocorreu um erro inesperado nesta página. Isso pode ser resolvido facilmente:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-xs text-brand-600 font-bold">1</span>
                    Clique em "Tentar novamente"
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-xs text-brand-600 font-bold">2</span>
                    Se persistir, volte ao Dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-xs text-brand-600 font-bold">3</span>
                    Em último caso, recarregue a página (F5)
                  </li>
                </ul>
              </div>

              {/* Error details (collapsible) */}
              <details className="group">
                <summary className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">
                  <Bug size={12} />
                  Detalhes técnicos (para suporte)
                </summary>
                <div className="mt-2 bg-slate-900 rounded-lg p-3 text-xs text-slate-400 font-mono overflow-auto max-h-32">
                  <p className="text-red-400">{this.state.error?.message}</p>
                  {this.state.error?.stack && (
                    <pre className="mt-1 text-[10px] leading-relaxed opacity-60 whitespace-pre-wrap">
                      {this.state.error.stack.slice(0, 300)}
                    </pre>
                  )}
                </div>
              </details>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
                >
                  <RefreshCw size={16} />
                  Tentar novamente
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <Home size={16} />
                  Ir ao Dashboard
                </button>
                <button
                  onClick={this.handleCopyError}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  title="Copiar erro para suporte"
                >
                  {this.state.copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook wrapper para usar Error Boundary com componentes específicos
 */
export function withErrorBoundary(Component, options = {}) {
  const { minimal = false, errorMessage } = options;
  
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary minimal={minimal} errorMessage={errorMessage}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
