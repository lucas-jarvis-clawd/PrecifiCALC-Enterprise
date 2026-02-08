import { useState, useRef, useCallback } from 'react';
import { Calculator, Zap, Percent } from 'lucide-react';

const TABS = [
  { id: 'normal', label: 'Precificacao Padrao', icon: Calculator, badge: null },
  { id: 'advanced', label: 'Precificacao Avancada', icon: Zap, badge: 'NOVO' },
  { id: 'markup', label: 'Markup sobre CMV', icon: Percent, badge: 'NOVO' },
];

/**
 * Container de abas reutilizavel para interface premium
 * Segue as DIRETRIZES_UX.md para design consistente
 */
export function TabsContainer({ children, defaultTab = 'normal', className = '' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const tabsRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    const tabIds = TABS.map(t => t.id);
    const currentIndex = tabIds.indexOf(activeTab);

    let nextIndex = -1;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabIds.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabIds.length) % tabIds.length;
    }

    if (nextIndex >= 0) {
      e.preventDefault();
      const nextId = tabIds[nextIndex];
      setActiveTab(nextId);
      // Focus the newly active tab button
      const nextButton = tabsRef.current?.querySelector(`#tab-${nextId}`);
      nextButton?.focus();
    }
  }, [activeTab]);

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Headers */}
      <div
        ref={tabsRef}
        role="tablist"
        className="flex overflow-x-auto flex-nowrap border-b border-slate-200 dark:border-slate-700 mb-6"
        onKeyDown={handleKeyDown}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap relative
                ${isActive
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }
              `}
            >
              <Icon size={16} />
              {tab.label}
              {tab.badge && (
                <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {typeof children === 'function' ? children(activeTab) : children}
      </div>
    </div>
  );
}

/**
 * Componente de aba individual para conteudo
 */
export function TabPanel({ value, activeTab, children }) {
  return (
    <div
      role="tabpanel"
      id={`panel-${value}`}
      aria-labelledby={`tab-${value}`}
      hidden={value !== activeTab}
      className="tab-panel animate-fadeIn"
    >
      {children}
    </div>
  );
}

export default TabsContainer;
