// Skeleton loader for cards
export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 animate-pulse ${className}`}>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 bg-slate-100 dark:bg-slate-700/60 rounded mb-2 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

// Skeleton for stat cards
export function SkeletonStatCard({ className = '' }) {
  return (
    <div className={`rounded-lg border border-slate-200 dark:border-slate-700 p-4 animate-pulse bg-slate-50 dark:bg-slate-800 ${className}`}>
      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-3" />
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
      <div className="h-2 bg-slate-100 dark:bg-slate-700/60 rounded w-1/3" />
    </div>
  );
}

// Full-page loading spinner
export function PageLoader({ message = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
      <div className="w-10 h-10 border-3 border-slate-200 dark:border-slate-700 border-t-brand-500 rounded-full animate-spin mb-4" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

// Inline spinner
export function Spinner({ size = 16, className = '' }) {
  return (
    <svg
      className={`animate-spin text-brand-500 ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action, onAction, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Icon size={28} className="text-slate-400 dark:text-slate-500" />
        </div>
      )}
      <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-4">{description}</p>}
      {action && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          {action}
        </button>
      )}
    </div>
  );
}

// Error state
export function ErrorState({ title = 'Algo deu errado', message, onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-red-500">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
      {message && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-4">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
