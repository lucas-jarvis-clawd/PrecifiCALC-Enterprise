// Enhanced skeleton loader for cards with shimmer effect
export function SkeletonCard({ lines = 3, className = '', hasHeader = true }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse ${className}`}>
      {hasHeader && (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={`h-3 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-slate-700/60 dark:via-slate-600 dark:to-slate-700/60 rounded mb-2 shimmer ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
        />
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

// Premium success feedback with auto-dismiss
export function SuccessToast({ 
  message, 
  duration = 3000, 
  onDismiss, 
  className = '',
  autoHide = true 
}) {
  if (autoHide && duration > 0) {
    setTimeout(() => onDismiss?.(), duration);
  }

  return (
    <div className={`
      fixed top-4 right-4 z-50 bg-emerald-500 text-white px-4 py-3 rounded-lg shadow-premium
      flex items-center gap-3 max-w-sm animate-fade-in-up
      ${className}
    `}>
      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="text-sm font-medium">{message}</span>
      {!autoHide && (
        <button onClick={onDismiss} className="ml-2 text-white/80 hover:text-white">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}

// Premium calculation animation
export function CalculationLoader({ message = 'Calculando...', progress = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
      <div className="relative w-12 h-12 mb-4">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 border-3 border-slate-200 dark:border-slate-700 rounded-full animate-spin">
          <div className="w-3 h-3 bg-brand-500 rounded-full absolute -top-1.5 left-1/2 -translate-x-1/2"></div>
        </div>
        {/* Inner pulsing core */}
        <div className="absolute inset-2 bg-brand-500/20 rounded-full animate-pulse-soft"></div>
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-brand-500">
            <path d="M3 12h18m-9-9v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      
      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-2">{message}</p>
      
      {progress !== null && (
        <div className="w-32 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Microinteraction button loading
export function ButtonLoading({ 
  children, 
  loading = false, 
  loadingText = 'Processando...', 
  className = '',
  ...props 
}) {
  return (
    <button 
      {...props}
      disabled={loading || props.disabled}
      className={`
        relative overflow-hidden transition-all duration-200
        ${loading ? 'cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <span className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center gap-2">
          <Spinner size={14} />
          <span className="text-sm">{loadingText}</span>
        </span>
      )}
    </button>
  );
}

// Data table skeleton
export function SkeletonTable({ rows = 5, columns = 4, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className={`h-3 bg-slate-100 dark:bg-slate-700/60 rounded animate-pulse ${
                    colIndex === 0 ? 'w-5/6' : colIndex === columns - 1 ? 'w-2/3' : 'w-4/5'
                  }`} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Premium progress indicator
export function ProgressIndicator({ 
  steps = [], 
  currentStep = 0, 
  className = '' 
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isUpcoming = index > currentStep;
        
        return (
          <div key={index} className="flex items-center gap-2">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
              ${isCompleted 
                ? 'bg-emerald-500 text-white scale-110' 
                : isActive 
                  ? 'bg-brand-500 text-white scale-110 animate-pulse-soft' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }
            `}>
              {isCompleted ? '✓' : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 transition-colors duration-300 ${
                isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
