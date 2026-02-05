import { useEffect, useState } from 'react';
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
  TrendingUp,
  X,
  Sun,
  Moon,
  HelpCircle,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ProgressBadge } from './ProgressBar';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', shortLabel: 'Dashboard', tooltip: 'Visão geral do seu negócio', section: 'visao_geral' },
  { path: '/simulador', icon: Calculator, label: 'Simulador Tributário', shortLabel: 'Simulador', tooltip: 'Calcule impostos em cada regime', section: 'visao_geral' },
  { path: '/comparativo', icon: BarChart3, label: 'Comparativo de Regimes', shortLabel: 'Comparativo', tooltip: 'Compare impostos entre MEI, Simples, Presumido e Real', section: 'visao_geral' },
  { path: '/precificacao', icon: Tags, label: 'Precificação', shortLabel: 'Precificação', tooltip: 'Calcule o preço ideal de venda', section: 'precificacao' },
  { path: '/custos', icon: Wallet, label: 'Custos Operacionais', shortLabel: 'Custos', tooltip: 'Gastos fixos e variáveis do negócio', section: 'precificacao' },
  { path: '/equilibrio', icon: Scale, label: 'Ponto de Equilíbrio', shortLabel: 'Equilíbrio', tooltip: 'Mínimo que precisa vender para não ter prejuízo', section: 'precificacao' },
  { path: '/projecao', icon: TrendingUp, label: 'Projeção de Crescimento', shortLabel: 'Projeção', tooltip: 'Simule o impacto de crescer no futuro', section: 'analise' },
  { path: '/viabilidade', icon: Target, label: 'Análise de Viabilidade', shortLabel: 'Viabilidade', tooltip: 'ROI, payback e viabilidade do negócio', section: 'analise' },
  { path: '/dre', icon: FileSpreadsheet, label: 'DRE (Resultado Mensal)', shortLabel: 'DRE', tooltip: 'Demonstração do Resultado: entradas, saídas e lucro', section: 'analise' },
  { path: '/enquadramento', icon: UserCheck, label: 'Enquadramento Tributário', shortLabel: 'Enquadramento', tooltip: 'Descubra o melhor tipo de empresa pra você', section: 'extras' },
  { path: '/calendario', icon: CalendarDays, label: 'Calendário Fiscal', shortLabel: 'Calendário', tooltip: 'Datas de impostos e obrigações', section: 'extras' },
  { path: '/propostas', icon: FileText, label: 'Propostas Comerciais', shortLabel: 'Propostas', tooltip: 'Gere propostas profissionais para clientes', section: 'extras' },
  { path: '/relatorios', icon: FileDown, label: 'Relatórios', shortLabel: 'Relatórios', tooltip: 'Exporte relatórios e análises', section: 'extras' },
  { path: '/configuracoes', icon: Settings, label: 'Configurações', shortLabel: 'Config.', tooltip: 'Dados da empresa e preferências', section: 'extras' },
];

const sections = {
  visao_geral: '📊 Visão Geral',
  precificacao: '🏷️ Preço & Custos',
  analise: '📈 Análise & Projeção',
  extras: '⚙️ Ferramentas',
};

export default function Sidebar({ isOpen, onToggle, isMobile, mobileOpen, onMobileClose }) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (isMobile && mobileOpen) onMobileClose();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="flex items-center gap-3 px-4 h-14 border-b border-white/10 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/20">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        {(isOpen || isMobile) && (
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-white tracking-tight">PrecifiCALC</h1>
            <p className="text-[10px] text-slate-400 -mt-0.5">Enterprise</p>
          </div>
        )}
        {isMobile && (
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors touch-manipulation"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Progress Badge */}
      {(isOpen || isMobile) && (
        <div className="px-2 pt-2 flex-shrink-0">
          <ProgressBadge />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2 overflow-y-auto">
        {Object.entries(sections).map(([sectionKey, sectionLabel]) => {
          const sectionItems = menuItems.filter(item => item.section === sectionKey);
          return (
            <div key={sectionKey} className="mb-2">
              {(isOpen || isMobile) && (
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-1.5">
                  {sectionLabel}
                </p>
              )}
              <div className="space-y-0.5">
                {sectionItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) =>
                        `group/nav w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all touch-manipulation ${
                          isActive
                            ? 'bg-brand-500/20 text-brand-300 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10'
                        }`
                      }
                      title={!isOpen && !isMobile ? item.tooltip || item.label : undefined}
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
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer - Theme toggle + Collapse */}
      <div className="border-t border-white/10 flex-shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors touch-manipulation"
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {(isOpen || isMobile) && (
            <span className="text-xs font-medium">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
          )}
        </button>

        {/* Toggle sidebar - desktop only */}
        {!isMobile && (
          <button
            onClick={onToggle}
            className="flex items-center justify-center h-10 w-full text-slate-500 hover:text-white transition-colors"
          >
            {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onMobileClose}
        />
        <aside
          className={`fixed top-0 left-0 h-full w-72 bg-navy-950 z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

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
