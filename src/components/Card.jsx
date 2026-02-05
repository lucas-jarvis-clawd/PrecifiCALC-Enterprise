export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-5 py-4 border-b border-slate-100 dark:border-slate-700 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

export function StatCard({ icon: Icon, label, value, subvalue, color = 'brand', trend, onClick, className = '' }) {
  const colorMap = {
    brand: 'border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/30',
    blue: 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30',
    green: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30',
    purple: 'border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/30',
    amber: 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30',
    red: 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30',
    cyan: 'border-cyan-200 dark:border-cyan-800 bg-cyan-50/50 dark:bg-cyan-950/30',
  };

  const iconColors = {
    brand: 'text-brand-600 dark:text-brand-400',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-emerald-600 dark:text-emerald-400',
    purple: 'text-violet-600 dark:text-violet-400',
    amber: 'text-amber-600 dark:text-amber-400',
    red: 'text-red-600 dark:text-red-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
  };

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      className={`rounded-xl border p-4 transition-all ${colorMap[color] || colorMap.brand} ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1 truncate">{value}</p>
          {subvalue && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subvalue}</p>}
          {trend && (
            <p className={`text-xs font-medium mt-1 ${trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : trend < 0 ? 'text-red-500' : 'text-slate-400'}`}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend).toFixed(1)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg bg-white/80 dark:bg-black/20 ${iconColors[color] || iconColors.brand}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </Wrapper>
  );
}

// Touch-friendly mobile action card
export function ActionCard({ icon: Icon, title, description, action, actionLabel, onClick, color = 'brand', className = '' }) {
  const borderColors = {
    brand: 'border-l-brand-500',
    blue: 'border-l-blue-500',
    green: 'border-l-emerald-500',
    amber: 'border-l-amber-500',
    red: 'border-l-red-500',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 border-l-4 ${borderColors[color]} p-4 sm:p-5 hover:shadow-md active:scale-[0.99] transition-all touch-manipulation ${className}`}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 flex-shrink-0">
            <Icon size={20} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-0.5">{title}</h3>
          {description && <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{description}</p>}
          {actionLabel && (
            <span className="inline-flex items-center mt-2 text-xs font-medium text-brand-600 dark:text-brand-400">
              {actionLabel} →
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
