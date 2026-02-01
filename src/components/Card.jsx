export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-5 py-4 border-b border-slate-100 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

export function StatCard({ icon: Icon, label, value, subvalue, color = 'brand', className = '' }) {
  const colorMap = {
    brand: 'border-brand-200 bg-brand-50/50',
    blue: 'border-blue-200 bg-blue-50/50',
    green: 'border-emerald-200 bg-emerald-50/50',
    purple: 'border-violet-200 bg-violet-50/50',
    amber: 'border-amber-200 bg-amber-50/50',
    red: 'border-red-200 bg-red-50/50',
    cyan: 'border-cyan-200 bg-cyan-50/50',
  };

  const iconColors = {
    brand: 'text-brand-600',
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    purple: 'text-violet-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    cyan: 'text-cyan-600',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorMap[color] || colorMap.brand} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
          <p className="text-xl font-semibold text-slate-800 mt-1 truncate">{value}</p>
          {subvalue && <p className="text-xs text-slate-500 mt-0.5">{subvalue}</p>}
        </div>
        {Icon && (
          <div className={`p-2 rounded-md bg-white/80 ${iconColors[color] || iconColors.brand}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
