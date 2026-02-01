export function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface-800 rounded-lg border border-surface-700 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-5 py-4 border-b border-surface-700 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

export function StatCard({ icon: Icon, label, value, subvalue, color = 'brand', className = '' }) {
  const colorMap = {
    brand: 'border-brand-600/30 bg-brand-600/5',
    blue: 'border-blue-600/30 bg-blue-600/5',
    green: 'border-emerald-600/30 bg-emerald-600/5',
    purple: 'border-violet-600/30 bg-violet-600/5',
    amber: 'border-amber-600/30 bg-amber-600/5',
    red: 'border-red-600/30 bg-red-600/5',
    cyan: 'border-cyan-600/30 bg-cyan-600/5',
    primary: 'border-brand-600/30 bg-brand-600/5',
  };

  const iconColors = {
    brand: 'text-brand-400',
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    purple: 'text-violet-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    cyan: 'text-cyan-400',
    primary: 'text-brand-400',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorMap[color] || colorMap.brand} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-surface-400 text-xs font-medium uppercase tracking-wider">{label}</p>
          <p className="text-xl font-semibold text-white mt-1 truncate">{value}</p>
          {subvalue && <p className="text-xs text-surface-400 mt-0.5">{subvalue}</p>}
        </div>
        {Icon && (
          <div className={`p-2 rounded-md bg-surface-900/50 ${iconColors[color] || iconColors.brand}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
