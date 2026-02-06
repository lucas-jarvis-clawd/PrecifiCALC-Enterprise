import { useState } from 'react';
import { Calculator, Zap } from 'lucide-react';

/**
 * Container de abas reutilizável para interface premium
 * Segue as DIRETRIZES_UX.md para design consistente
 */
export function TabsContainer({ children, defaultTab = 'normal', className = '' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Headers */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
        <button
          onClick={() => setActiveTab('normal')}
          className={`
            flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors
            ${activeTab === 'normal' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }
          `}
        >
          <Calculator size={16} />
          Precificação Padrão
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`
            flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors relative
            ${activeTab === 'advanced' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }
          `}
        >
          <Zap size={16} />
          Precificação Avançada
          <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            NOVO
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {typeof children === 'function' ? children(activeTab) : children}
      </div>
    </div>
  );
}

/**
 * Componente de aba individual para conteúdo
 */
export function TabPanel({ value, activeTab, children }) {
  if (value !== activeTab) return null;
  
  return (
    <div className="tab-panel animate-fadeIn">
      {children}
    </div>
  );
}

export default TabsContainer;