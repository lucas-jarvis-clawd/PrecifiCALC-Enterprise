import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Onboarding from './components/Onboarding';
import ThemeToggle from './components/ThemeToggle';
import Dashboard from './pages/Dashboard';
import SimuladorTributario from './pages/SimuladorTributario';
import CustosOperacionais from './pages/CustosOperacionais';
import Precificacao from './pages/Precificacao';
import ComparativoRegimes from './pages/ComparativoRegimes';
import Propostas from './pages/Propostas';
import AnaliseViabilidade from './pages/AnaliseViabilidade';
import PontoEquilibrio from './pages/PontoEquilibrio';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import DRE from './pages/DRE';
import CalendarioFiscal from './pages/CalendarioFiscal';
import Enquadramento from './pages/Enquadramento';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [perfilEmpresa, setPerfilEmpresa] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    const onboarded = localStorage.getItem('precificalc_onboarded');
    const perfil = localStorage.getItem('precificalc_perfil');
    
    if (onboarded === 'true' && perfil) {
      setIsOnboardingComplete(true);
      try {
        setPerfilEmpresa(JSON.parse(perfil));
      } catch { /* ignore */ }
    }
    // Small delay for smooth entrance
    setTimeout(() => setIsLoading(false), 200);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const handleOnboardingComplete = (dadosEmpresa) => {
    setPerfilEmpresa(dadosEmpresa);
    setIsOnboardingComplete(true);
  };

  const handleNavigate = useCallback((pageId) => {
    const routeMap = {
      dashboard: '/',
      simulador: '/simulador',
      custos: '/custos',
      precificacao: '/precificacao',
      comparativo: '/comparativo',
      viabilidade: '/viabilidade',
      equilibrio: '/equilibrio',
      propostas: '/propostas',
      dre: '/dre',
      calendario: '/calendario',
      enquadramento: '/enquadramento',
      relatorios: '/relatorios',
      configuracoes: '/configuracoes',
    };
    navigate(routeMap[pageId] || '/');
  }, [navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/20">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div className="w-8 h-8 border-3 border-slate-200 dark:border-slate-700 border-t-brand-500 rounded-full animate-spin mx-auto mt-4" />
        </div>
      </div>
    );
  }

  if (!isOnboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const mainMargin = isMobile ? '' : (sidebarOpen ? 'ml-60' : 'ml-16');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <main className={`flex-1 overflow-y-auto transition-all duration-200 ${mainMargin}`}>
        {/* Mobile top bar */}
        {isMobile && (
          <div className="sticky top-0 z-30 glass border-b border-slate-200 dark:border-slate-700 px-4 h-14 flex items-center gap-3 shadow-sm safe-top">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2.5 -ml-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">PrecifiCALC</span>
            </div>
            <ThemeToggle compact />
          </div>
        )}

        <div className="p-4 sm:p-6 max-w-[1400px] mx-auto safe-bottom">
          <Routes>
            <Route path="/" element={<Dashboard onNavigate={handleNavigate} perfilEmpresa={perfilEmpresa} />} />
            <Route path="/simulador" element={<SimuladorTributario onNavigate={handleNavigate} perfilEmpresa={perfilEmpresa} />} />
            <Route path="/custos" element={<CustosOperacionais onNavigate={handleNavigate} perfilEmpresa={perfilEmpresa} />} />
            <Route path="/precificacao" element={<Precificacao onNavigate={handleNavigate} perfilEmpresa={perfilEmpresa} />} />
            <Route path="/comparativo" element={<ComparativoRegimes onNavigate={handleNavigate} perfilEmpresa={perfilEmpresa} />} />
            <Route path="/viabilidade" element={<AnaliseViabilidade onNavigate={handleNavigate} perfilEmpresa={perfilEmpresa} />} />
            <Route path="/equilibrio" element={<PontoEquilibrio onNavigate={handleNavigate} perfilEmpresa={perfilEmpresa} />} />
            <Route path="/propostas" element={<Propostas onNavigate={handleNavigate} perfilEmpresa={perfilEmpresa} />} />
            <Route path="/dre" element={<DRE onNavigate={handleNavigate} perfilEmpresa={perfilEmpresa} />} />
            <Route path="/calendario" element={<CalendarioFiscal onNavigate={handleNavigate} perfilEmpresa={perfilEmpresa} />} />
            <Route path="/enquadramento" element={<Enquadramento onNavigate={handleNavigate} perfilEmpresa={perfilEmpresa} />} />
            <Route path="/relatorios" element={<Relatorios onNavigate={handleNavigate} perfilEmpresa={perfilEmpresa} />} />
            <Route path="/configuracoes" element={<Configuracoes onNavigate={handleNavigate} perfilEmpresa={perfilEmpresa} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
