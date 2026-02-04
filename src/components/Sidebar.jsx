import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  X,
} from 'lucide-react';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/simulador', icon: Calculator, label: 'Simulador Tributário' },
  { path: '/comparativo', icon: BarChart3, label: 'Comparativo de Regimes' },
  { path: '/viabilidade', icon: Target, label: 'Análise de Viabilidade' },
  { path: '/custos', icon: Wallet, label: 'Custos Operacionais' },
  { path: '/precificacao', icon: Tags, label: 'Precificação' },
  { path: '/equilibrio', icon: Scale, label: 'Ponto de Equilíbrio' },
  { path: '/dre', icon: FileSpreadsheet, label: 'DRE' },
  { path: '/calendario', icon: CalendarDays, label: 'Calendário Fiscal' },
  { path: '/enquadramento', icon: UserCheck, label: 'Enquadramento' },
  { path: '/propostas', icon: FileText, label: 'Propostas' },
  { path: '/relatorios', icon: FileDown, label: 'Relatórios' },
  { path: '/configuracoes', icon: Settings, label: 'Configurações' },
];

export default function Sidebar({ isOpen, onToggle, isMobile, mobileOpen, onMobileClose }) {
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile && mobileOpen) {
      onMobileClose();
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, mobileOpen]);

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-white/10">
        <div className="w-8 h-8 rounded-md bg-brand-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        {(isOpen || isMobile) && (
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-white tracking-tight">PrecifiCALC</h1>
            <p className="text-[10px] text-slate-400 -mt-0.5">Enterprise</p>
          </div>
        )}
        {isMobile && (
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-300'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
              title={!isOpen && !isMobile ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`flex-shrink-0 ${isActive ? 'text-brand-400' : 'text-slate-500'}`}
                  />
                  {(isOpen || isMobile) && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Toggle - only on desktop */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className="flex items-center justify-center h-10 border-t border-white/10 text-slate-500 hover:text-white transition-colors"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      )}
    </>
  );

  // Mobile: overlay sidebar
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onMobileClose}
        />
        {/* Sidebar drawer */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-navy-950 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop: fixed sidebar
  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-navy-950 z-50 transition-all duration-200 flex flex-col ${
        isOpen ? 'w-60' : 'w-16'
      }`}
    >
      {sidebarContent}
    </aside>
  );
}
