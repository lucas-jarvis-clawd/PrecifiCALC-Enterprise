import {
  LayoutDashboard,
  Calculator,
  Wallet,
  Tags,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
  Target,
  FileDown,
  Settings,
  Scale,
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'simulador', icon: Calculator, label: 'Simulador Tributario' },
  { id: 'comparativo', icon: BarChart3, label: 'Comparativo de Regimes' },
  { id: 'viabilidade', icon: Target, label: 'Analise de Viabilidade' },
  { id: 'custos', icon: Wallet, label: 'Custos Operacionais' },
  { id: 'precificacao', icon: Tags, label: 'Precificacao' },
  { id: 'equilibrio', icon: Scale, label: 'Ponto de Equilibrio' },
  { id: 'propostas', icon: FileText, label: 'Propostas' },
  { id: 'relatorios', icon: FileDown, label: 'Relatorios' },
  { id: 'configuracoes', icon: Settings, label: 'Configuracoes' },
];

export default function Sidebar({ currentPage, onNavigate, isOpen, onToggle }) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-surface-950 border-r border-surface-700 z-50 transition-all duration-200 flex flex-col ${
        isOpen ? 'w-60' : 'w-16'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-surface-700">
        <div className="w-8 h-8 rounded-md bg-brand-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        {isOpen && (
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight">PrecifiCALC</h1>
            <p className="text-[10px] text-surface-500 -mt-0.5">Enterprise</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-brand-600/15 text-brand-400'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
              }`}
              title={!isOpen ? item.label : undefined}
            >
              <Icon
                size={18}
                className={`flex-shrink-0 ${
                  isActive ? 'text-brand-400' : 'text-surface-500'
                }`}
              />
              {isOpen && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-10 border-t border-surface-700 text-surface-500 hover:text-surface-300 transition-colors"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </aside>
  );
}
