import { useMemo } from 'react';
import { formatCurrency } from '../data/taxData';

const COLORS = [
  { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400', light: 'bg-red-100 dark:bg-red-900/30' },
  { bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', light: 'bg-amber-100 dark:bg-amber-900/30' },
  { bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', light: 'bg-orange-100 dark:bg-orange-900/30' },
  { bg: 'bg-violet-500', text: 'text-violet-600 dark:text-violet-400', light: 'bg-violet-100 dark:bg-violet-900/30' },
  { bg: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400', light: 'bg-blue-100 dark:bg-blue-900/30' },
  { bg: 'bg-cyan-500', text: 'text-cyan-600 dark:text-cyan-400', light: 'bg-cyan-100 dark:bg-cyan-900/30' },
  { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', light: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { bg: 'bg-pink-500', text: 'text-pink-600 dark:text-pink-400', light: 'bg-pink-100 dark:bg-pink-900/30' },
];

/**
 * Visual breakdown of costs - shows "para onde vai cada centavo"
 * @param {Array} items - [{label, value}] 
 * @param {number} total - total reference value (e.g., receita)
 * @param {string} title - optional heading
 */
export default function CostBreakdownChart({ items, total, title, className = '' }) {
  const processedItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    const t = total || items.reduce((acc, i) => acc + Math.abs(i.value || 0), 0);
    if (t === 0) return [];
    
    return items
      .filter(item => item.value > 0)
      .map((item, idx) => ({
        ...item,
        percent: (item.value / t) * 100,
        color: COLORS[idx % COLORS.length],
      }));
  }, [items, total]);

  if (processedItems.length === 0) return null;

  return (
    <div className={className}>
      {title && (
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">{title}</h3>
      )}

      {/* Stacked bar */}
      <div className="flex rounded-xl overflow-hidden h-10 bg-slate-100 dark:bg-slate-700 mb-4">
        {processedItems.map((item, i) => (
          <div
            key={i}
            className={`${item.color.bg} flex items-center justify-center transition-all duration-500 relative group cursor-default`}
            style={{ width: `${item.percent}%` }}
            title={`${item.label}: ${formatCurrency(item.value)} (${item.percent.toFixed(1)}%)`}
          >
            {item.percent > 8 && (
              <span className="text-[10px] sm:text-xs font-medium text-white truncate px-1">
                {item.percent.toFixed(0)}%
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Legend with values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {processedItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5">
            <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${item.color.bg}`} />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-slate-600 dark:text-slate-400 truncate block">{item.label}</span>
            </div>
            <div className="text-right flex-shrink-0">
              <span className={`text-xs font-semibold ${item.color.text} font-mono`}>
                {formatCurrency(item.value)}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">
                ({item.percent.toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* "Para cada R$1,00" breakdown */}
      {total && total > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            💰 Para cada R$ 1,00 de receita:
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {processedItems.map((item, i) => (
              <span key={i} className="text-[11px] text-slate-600 dark:text-slate-400">
                <span className={`font-semibold ${item.color.text}`}>
                  R$ {(item.value / total).toFixed(2)}
                </span>{' '}
                → {item.label.toLowerCase()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Mini version for stat cards
export function MiniBreakdown({ items, className = '' }) {
  const total = items.reduce((acc, i) => acc + Math.abs(i.value || 0), 0);
  if (total === 0) return null;

  return (
    <div className={`flex rounded-md overflow-hidden h-2 bg-slate-100 dark:bg-slate-700 ${className}`}>
      {items
        .filter(i => i.value > 0)
        .map((item, i) => (
          <div
            key={i}
            className={`${COLORS[i % COLORS.length].bg} transition-all duration-300`}
            style={{ width: `${(item.value / total) * 100}%` }}
          />
        ))}
    </div>
  );
}
