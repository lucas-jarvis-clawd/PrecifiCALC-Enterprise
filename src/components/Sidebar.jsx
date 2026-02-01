import {
  LayoutDashboard,
  Calculator,
  Wallet,
  Tags,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Target,
  FileDown,
  Settings,
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'simulador', icon: Calculator, label: 'Simulador Tributário' },
  { id: 'comparativo', icon: BarChart3, label: 'Comparativo de Regimes' },
  { id: 'viabilidade', icon: Target, label: 'Análise de Viabilidade' },
  { id: 'custos', icon: Wallet, label: 'Custos Operacionais' },
  { id: 'precificacao', icon: Tags, label: 'Precificação' },
  { id: 'propostas', icon: FileText, label: 'Propostas' },
  { id: 'relatorios', icon: FileDown, label: 'Relatórios' },
  { id: 'configuracoes', icon: Settings, label: 'Configurações' },
];

export default function Sidebar({ currentPage, onNavigate, isOpen, onToggle }) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-dark-950 border-r border-dark-700/50 z-50 transition-all duration-300 flex flex-col ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-dark-700/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
          <TrendingUp size={18} className="text-white" />
        </div>
        {isOpen && (
          <div className="animate-fadeIn">
            <h1 className="text-sm font-bold text-white tracking-tight">PrecifiCALC</h1>
            <p className="text-[10px] text-dark-400 -mt-0.5">Consultoria Contábil</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50 border border-transparent'
              }`}
              title={!isOpen ? item.label : undefined}
            >
              <Icon
                size={20}
                className={`flex-shrink-0 transition-colors ${
                  isActive ? 'text-primary-400' : 'text-dark-500 group-hover:text-dark-300'
                }`}
              />
              {isOpen && (
                <span className="text-sm font-medium truncate animate-fadeIn">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-12 border-t border-dark-700/50 text-dark-500 hover:text-dark-300 transition-colors"
      >
        {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    </aside>
  );
}
