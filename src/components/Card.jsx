export function Card({ children, className = '', glow = false, gradient = false }) {
  return (
    <div
      className={`bg-dark-800/60 backdrop-blur-sm rounded-xl border border-dark-700/50 ${
        glow ? 'card-glow' : ''
      } ${gradient ? 'gradient-border' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-b border-dark-700/30 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function StatCard({ icon: Icon, label, value, subvalue, color = 'primary', trend, className = '' }) {
  const colorMap = {
    primary: 'from-primary-500/20 to-primary-600/10 border-primary-500/20 text-primary-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400',
    rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/20 text-rose-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20 text-cyan-400',
  };

  const iconColors = {
    primary: 'text-primary-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    cyan: 'text-cyan-400',
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-5 animate-fadeIn ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-dark-400 text-xs font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subvalue && <p className="text-sm text-dark-400 mt-0.5">{subvalue}</p>}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg bg-dark-900/30 ${iconColors[color]}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
      {trend && (
        <div className={`mt-3 text-xs font-medium ${trend > 0 ? 'text-primary-400' : 'text-rose-400'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs mês anterior
        </div>
      )}
    </div>
  );
}
