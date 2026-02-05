import { useProgress } from '../contexts/ProgressContext';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

export default function ProgressBar({ compact = false, className = '' }) {
  const { progressPercent, completedModules, moduleWeights, nextStep } = useProgress();

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {progressPercent}%
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Seu progresso</h3>
        <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{progressPercent}%</span>
      </div>
      
      <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-brand-500 via-brand-400 to-cyan-500 rounded-full transition-all duration-700 ease-out relative"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-shimmer" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(moduleWeights).map(([id, mod]) => {
          const done = completedModules.includes(id);
          return (
            <div key={id} className="flex items-center gap-1.5">
              {done ? (
                <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
              ) : (
                <Circle size={14} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
              )}
              <span className={`text-[11px] truncate ${done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {mod.label}
              </span>
            </div>
          );
        })}
      </div>

      {nextStep && progressPercent < 100 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <ArrowRight size={14} className="text-brand-500" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Próximo passo: <span className="font-medium text-brand-600 dark:text-brand-400">{nextStep.label}</span>
          </span>
        </div>
      )}
    </div>
  );
}

// Mini badge for sidebar
export function ProgressBadge() {
  const { progressPercent } = useProgress();
  
  return (
    <div className="flex items-center gap-2 px-3 py-1.5">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-400 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-400 font-mono">{progressPercent}%</span>
    </div>
  );
}
