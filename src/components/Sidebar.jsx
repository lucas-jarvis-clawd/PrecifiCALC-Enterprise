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
  FileSpreadsheet,
  CalendarDays,
  UserCheck,
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'simulador', icon: Calculator, label: 'Simulador Tributário' },
  { id: 'comparativo', icon: BarChart3, label: 'Comparativo de Regimes' },
  { id: 'viabilidade', icon: Target, label: 'Análise de Viabilidade' },
  { id: 'custos', icon: Wallet, label: 'Custos Operacionais' },
  { id: 'precificacao', icon: Tags, label: 'Precificação' },
  { id: 'equilibrio', icon: Scale, label: 'Ponto de Equilíbrio' },
  { id: 'dre', icon: FileSpreadsheet, label: 'DRE' },
  { id: 'calendario', icon: CalendarDays, label: 'Calendário Fiscal' },
  { id: 'enquadramento', icon: UserCheck, label: 'Enquadramento' },
  { id: 'propostas', icon: FileText, label: 'Propostas' },
  { id: 'relatorios', icon: FileDown, label: 'Relatórios' },
  { id: 'configuracoes', icon: Settings, label: 'Configurações' },
];

export default function Sidebar({ currentPage, onNavigate, isOpen, onToggle }) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-navy-950 z-50 transition-all duration-200 flex flex-col ${
        isOpen ? 'w-60' : 'w-16'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-white/10">
        <div className="w-8 h-8 rounded-md bg-brand-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        {isOpen && (
          <div>
            <h1 className="text-sm font-semibold text-white tracking-tight">PrecifiCALC</h1>
            <p className="text-[10px] text-slate-400 -mt-0.5">Enterprise</p>
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
                  ? 'bg-brand-600/20 text-brand-300'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={!isOpen ? item.label : undefined}
            >
              <Icon
                size={18}
                className={`flex-shrink-0 ${isActive ? 'text-brand-400' : 'text-slate-500'}`}
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
        className="flex items-center justify-center h-10 border-t border-white/10 text-slate-500 hover:text-white transition-colors"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </aside>
  );
}
