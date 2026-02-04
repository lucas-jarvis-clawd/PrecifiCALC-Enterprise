import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Onboarding from './components/Onboarding';
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
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    const onboarded = localStorage.getItem('precificalc_onboarded');
    const perfil = localStorage.getItem('precificalc_perfil');
    
    if (onboarded === 'true' && perfil) {
      setIsOnboardingComplete(true);
      setPerfilEmpresa(JSON.parse(perfil));
    }
  }, []);

  // Close sidebar on mobile by default
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
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

  if (!isOnboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Compute main content margin based on sidebar state (desktop only)
  const mainMargin = isMobile ? '' : (sidebarOpen ? 'ml-60' : 'ml-16');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
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
          <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 h-14 flex items-center gap-3 shadow-sm">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-md text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-brand-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <span className="text-sm font-semibold text-slate-800">PrecifiCALC</span>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
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
