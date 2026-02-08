// Vértice - Performance Optimized
import { useState, useEffect, useCallback, memo, useMemo, StrictMode } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';

// Core components (always loaded)
import Sidebar from './components/Sidebar';
import Onboarding from './components/Onboarding';
import ThemeToggle from './components/ThemeToggle';

// Lazy-loaded pages with intelligent preloading
import {
  LazyDashboard,
  LazySimuladorTributario,
  LazyCustosOperacionais,
  LazyPrecificacao,
  LazyComparativoRegimes,
  LazyPropostas,
  LazyAnaliseViabilidade,
  LazyPontoEquilibrio,
  LazyRelatorios,
  LazyConfiguracoes,
  LazyDRE,
  LazyCalendarioFiscal,
  LazyEnquadramento,
  LazyProjecaoCrescimento,
  LazyOtimizadorProLabore,
} from './components/LazyPages';

// Responsive hook with performance optimization
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < breakpoint);
      }, 100);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}

// Performance-optimized App component
const App = memo(() => {
  // State management with performance considerations
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [perfilEmpresa, setPerfilEmpresa] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appError, setAppError] = useState(null);

  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Track initial app load
  useEffect(() => {
    const initializeApp = () => {
      try {
        const onboarded = localStorage.getItem('precificalc_onboarded');
        const perfil = localStorage.getItem('precificalc_perfil');

        if (onboarded === 'true' && perfil) {
          setIsOnboardingComplete(true);

          try {
            const parsedPerfil = JSON.parse(perfil);
            setPerfilEmpresa(parsedPerfil);
          } catch (parseError) {
            // Failed to parse user profile, clear corrupted data
            localStorage.removeItem('precificalc_perfil');
          }
        }
      } catch (storageError) {
        // Storage access error
        setAppError('Erro ao acessar dados salvos');
      }

      // Small delay for smooth entrance
      setTimeout(() => {
        setIsLoading(false);
        // Remove HTML splash screen
        if (window.__removeSplash) window.__removeSplash();
      }, 200);
    };

    initializeApp();
  }, []);

  // Mobile responsiveness optimization
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Memoized navigation handler for performance
  const handleNavigate = useCallback((pageId) => {
    const routeMap = {
      dashboard: '/',
      simulador: '/simulador',
      custos: '/custos',
      precificacao: '/precificacao',
      comparativo: '/comparativo',
      viabilidade: '/viabilidade',
      equilibrio: '/equilibrio',
      projecao: '/projecao',
      propostas: '/propostas',
      dre: '/dre',
      calendario: '/calendario',
      enquadramento: '/enquadramento',
      relatorios: '/relatorios',
      configuracoes: '/configuracoes',
      'otimizador-prolabore': '/otimizador-prolabore',
    };

    const targetRoute = routeMap[pageId] || '/';
    navigate(targetRoute);

    // Close mobile menu after navigation
    if (isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [navigate, isMobile, mobileMenuOpen]);

  // Memoized onboarding completion handler
  const handleOnboardingComplete = useCallback((dadosEmpresa) => {
    try {
      setPerfilEmpresa(dadosEmpresa);
      setIsOnboardingComplete(true);

      localStorage.setItem('precificalc_onboarded', 'true');
      localStorage.setItem('precificalc_perfil', JSON.stringify(dadosEmpresa));
    } catch (saveError) {
      // Failed to save onboarding data
      setAppError('Erro ao salvar configurações');
    }
  }, []);

  // Memoized computed values
  const mainMarginClass = useMemo(() => {
    if (isMobile) return '';
    return sidebarOpen ? 'ml-60' : 'ml-16';
  }, [isMobile, sidebarOpen]);

  // Sidebar toggle handler
  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleMobileMenuOpen = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  // Error state
  if (appError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center animate-fadeIn max-w-md mx-auto p-6">
          <div className="w-16 h-16 rounded-xl bg-red-500 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Erro na aplicação
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{appError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Recarregar aplicação
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#001a2d] flex items-center justify-center mx-auto shadow-xl shadow-[#001a2d]/25">
              <span className="text-white font-bold text-2xl">V</span>
            </div>

            <div className="absolute -inset-2">
              <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-700 border-t-[#0a2540] rounded-full animate-spin" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Vértice
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">
            Carregando sistema de precificação...
          </p>
        </div>
      </div>
    );
  }

  // Onboarding flow
  if (!isOnboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Main application interface
  return (
    <StrictMode>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg"
        >
          Pular para o conteudo
        </a>
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={handleSidebarToggle}
          isMobile={isMobile}
          mobileOpen={mobileMenuOpen}
          onMobileClose={handleMobileMenuClose}
        />

        <main id="main-content" className={`flex-1 overflow-y-auto transition-all duration-200 ${mainMarginClass}`}>

          {isMobile && (
            <div className="sticky top-0 z-30 glass border-b border-slate-200 dark:border-slate-700 px-4 h-14 flex items-center gap-3 shadow-sm safe-top">
              <button
                onClick={handleMobileMenuOpen}
                className="p-2.5 -ml-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
                aria-label="Abrir menu"
              >
                <Menu size={22} />
              </button>

              <div className="flex items-center gap-2 flex-1">
                <div className="w-7 h-7 rounded-lg bg-[#001a2d] flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xs">V</span>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Vértice
                </span>
              </div>

              <ThemeToggle compact />
            </div>
          )}

          <div className="p-4 sm:p-6 max-w-[1400px] mx-auto safe-bottom">
            <Routes>
              <Route 
                path="/" 
                element={
                  <LazyDashboard 
                    onNavigate={handleNavigate} 
                    perfilEmpresa={perfilEmpresa} 
                  />
                } 
              />
              <Route 
                path="/simulador" 
                element={
                  <LazySimuladorTributario 
                    onNavigate={handleNavigate} 
                    perfilEmpresa={perfilEmpresa} 
                  />
                } 
              />
              <Route 
                path="/custos" 
                element={
                  <LazyCustosOperacionais 
                    onNavigate={handleNavigate} 
                    perfilEmpresa={perfilEmpresa} 
                  />
                } 
              />
              <Route 
                path="/precificacao" 
                element={
                  <LazyPrecificacao 
                    onNavigate={handleNavigate} 
                    perfilEmpresa={perfilEmpresa} 
                  />
                } 
              />
              <Route 
                path="/comparativo" 
                element={
                  <LazyComparativoRegimes 
                    onNavigate={handleNavigate} 
                    perfilEmpresa={perfilEmpresa} 
                  />
                } 
              />
              <Route 
                path="/viabilidade" 
                element={
                  <LazyAnaliseViabilidade 
                    onNavigate={handleNavigate} 
                    perfilEmpresa={perfilEmpresa} 
                  />
                } 
              />
              <Route 
                path="/equilibrio" 
                element={
                  <LazyPontoEquilibrio 
                    onNavigate={handleNavigate} 
                    perfilEmpresa={perfilEmpresa} 
                  />
                } 
              />
              <Route 
                path="/projecao" 
                element={
                  <LazyProjecaoCrescimento 
                    onNavigate={handleNavigate} 
                    perfilEmpresa={perfilEmpresa} 
                  />
                } 
              />
              <Route 
                path="/propostas" 
                element={
                  <LazyPropostas 
                    onNavigate={handleNavigate} 
                    perfilEmpresa={perfilEmpresa} 
                  />
                } 
              />
              <Route 
                path="/dre" 
                element={
                  <LazyDRE 
                    onNavigate={handleNavigate} 
                    perfilEmpresa={perfilEmpresa} 
                  />
                } 
              />
              <Route 
                path="/calendario" 
                element={
                  <LazyCalendarioFiscal 
                    onNavigate={handleNavigate} 
                    perfilEmpresa={perfilEmpresa} 
                  />
                } 
              />
              <Route 
                path="/enquadramento" 
                element={
                  <LazyEnquadramento 
                    onNavigate={handleNavigate} 
                    perfilEmpresa={perfilEmpresa} 
                  />
                } 
              />
              <Route 
                path="/relatorios" 
                element={
                  <LazyRelatorios 
                    onNavigate={handleNavigate} 
                    perfilEmpresa={perfilEmpresa} 
                  />
                } 
              />
              <Route
                path="/configuracoes"
                element={
                  <LazyConfiguracoes
                    onNavigate={handleNavigate}
                    perfilEmpresa={perfilEmpresa}
                  />
                }
              />
              <Route
                path="/otimizador-prolabore"
                element={
                  <LazyOtimizadorProLabore
                    onNavigate={handleNavigate}
                    perfilEmpresa={perfilEmpresa}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </StrictMode>
  );
});

App.displayName = 'Vértice App';

export default App;