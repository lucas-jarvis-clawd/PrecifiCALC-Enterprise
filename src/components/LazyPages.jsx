// 🚀 Lazy-loaded Pages with Performance Optimization
// Intelligent code splitting for all PrecifiCALC modules

import { lazy } from 'react';
import { withLazyLoader } from './LazyLoader';

// 📱 Core business modules - High priority
const Dashboard = lazy(() => 
  import('../pages/Dashboard.jsx').then(module => ({ default: module.default }))
);

const SimuladorTributario = lazy(() => 
  import('../pages/SimuladorTributario.jsx').then(module => ({ default: module.default }))
);

const Precificacao = lazy(() => 
  import('../pages/Precificacao.jsx').then(module => ({ default: module.default }))
);

const ComparativoRegimes = lazy(() => 
  import('../pages/ComparativoRegimes.jsx').then(module => ({ default: module.default }))
);

// 💰 Financial analysis modules - Medium priority  
const CustosOperacionais = lazy(() => 
  import('../pages/CustosOperacionais.jsx').then(module => ({ default: module.default }))
);

const PontoEquilibrio = lazy(() => 
  import('../pages/PontoEquilibrio.jsx').then(module => ({ default: module.default }))
);

const AnaliseViabilidade = lazy(() => 
  import('../pages/AnaliseViabilidade.jsx').then(module => ({ default: module.default }))
);

const DRE = lazy(() => 
  import('../pages/DRE.jsx').then(module => ({ default: module.default }))
);

const ProjecaoCrescimento = lazy(() => 
  import('../pages/ProjecaoCrescimento.jsx').then(module => ({ default: module.default }))
);

// 📊 Reports and proposals - Medium priority
const Propostas = lazy(() => 
  import('../pages/Propostas.jsx').then(module => ({ default: module.default }))
);

const Relatorios = lazy(() => 
  import('../pages/Relatorios.jsx').then(module => ({ default: module.default }))
);

// 🎯 Support modules - Low priority
const Enquadramento = lazy(() => 
  import('../pages/Enquadramento.jsx').then(module => ({ default: module.default }))
);

const CalendarioFiscal = lazy(() => 
  import('../pages/CalendarioFiscal.jsx').then(module => ({ default: module.default }))
);

const Configuracoes = lazy(() => 
  import('../pages/Configuracoes.jsx').then(module => ({ default: module.default }))
);

// 📄 Static pages - Lowest priority
const LandingPage = lazy(() => 
  import('../pages/LandingPage.jsx').then(module => ({ default: module.default }))
);

const TermosDeUso = lazy(() => 
  import('../pages/TermosDeUso.jsx').then(module => ({ default: module.default }))
);

const PoliticaPrivacidade = lazy(() => 
  import('../pages/PoliticaPrivacidade.jsx').then(module => ({ default: module.default }))
);

// 🎯 Wrapped components with LazyLoader HOC and specific configurations
export const LazyDashboard = withLazyLoader(Dashboard, 'Dashboard', {
  preloadTrigger: 'immediate', // Always preload dashboard
  loadingMessage: 'Carregando painel principal...',
  showProgress: true
});

export const LazySimuladorTributario = withLazyLoader(SimuladorTributario, 'SimuladorTributario', {
  preloadTrigger: 'hover',
  preloadDelay: 50, // Quick preload for core feature
  loadingMessage: 'Carregando simulador tributário...',
  showProgress: true
});

export const LazyPrecificacao = withLazyLoader(Precificacao, 'Precificacao', {
  preloadTrigger: 'hover',
  preloadDelay: 50,
  loadingMessage: 'Carregando módulo de precificação...',
  showProgress: true
});

export const LazyComparativoRegimes = withLazyLoader(ComparativoRegimes, 'ComparativoRegimes', {
  preloadTrigger: 'hover',
  preloadDelay: 100,
  loadingMessage: 'Carregando comparativo de regimes...',
  showProgress: true
});

export const LazyCustosOperacionais = withLazyLoader(CustosOperacionais, 'CustosOperacionais', {
  preloadTrigger: 'hover',
  preloadDelay: 150,
  loadingMessage: 'Carregando gestão de custos...',
  showProgress: false
});

export const LazyPontoEquilibrio = withLazyLoader(PontoEquilibrio, 'PontoEquilibrio', {
  preloadTrigger: 'hover',
  preloadDelay: 150,
  loadingMessage: 'Carregando análise de ponto de equilíbrio...',
  showProgress: false
});

export const LazyAnaliseViabilidade = withLazyLoader(AnaliseViabilidade, 'AnaliseViabilidade', {
  preloadTrigger: 'hover', 
  preloadDelay: 200,
  loadingMessage: 'Carregando análise de viabilidade...',
  showProgress: false
});

export const LazyDRE = withLazyLoader(DRE, 'DRE', {
  preloadTrigger: 'hover',
  preloadDelay: 150,
  loadingMessage: 'Carregando demonstração de resultados...',
  showProgress: false
});

export const LazyProjecaoCrescimento = withLazyLoader(ProjecaoCrescimento, 'ProjecaoCrescimento', {
  preloadTrigger: 'hover',
  preloadDelay: 200,
  loadingMessage: 'Carregando projeção de crescimento...',
  showProgress: false
});

export const LazyPropostas = withLazyLoader(Propostas, 'Propostas', {
  preloadTrigger: 'hover',
  preloadDelay: 100,
  loadingMessage: 'Carregando gerador de propostas...',
  showProgress: true
});

export const LazyRelatorios = withLazyLoader(Relatorios, 'Relatorios', {
  preloadTrigger: 'hover',
  preloadDelay: 200,
  loadingMessage: 'Carregando sistema de relatórios...',
  showProgress: false
});

export const LazyEnquadramento = withLazyLoader(Enquadramento, 'Enquadramento', {
  preloadTrigger: 'hover',
  preloadDelay: 300,
  loadingMessage: 'Carregando análise de enquadramento...',
  showProgress: false
});

export const LazyCalendarioFiscal = withLazyLoader(CalendarioFiscal, 'CalendarioFiscal', {
  preloadTrigger: 'hover',
  preloadDelay: 300,
  loadingMessage: 'Carregando calendário fiscal...',
  showProgress: false
});

export const LazyConfiguracoes = withLazyLoader(Configuracoes, 'Configuracoes', {
  preloadTrigger: 'immediate', // Settings should be quick to load
  preloadDelay: 50,
  loadingMessage: 'Carregando configurações...',
  showProgress: false
});

export const LazyLandingPage = withLazyLoader(LandingPage, 'LandingPage', {
  preloadTrigger: 'none', // Only load when explicitly navigated
  loadingMessage: 'Carregando página inicial...',
  showProgress: false
});

export const LazyTermosDeUso = withLazyLoader(TermosDeUso, 'TermosDeUso', {
  preloadTrigger: 'none',
  loadingMessage: 'Carregando termos de uso...',
  showProgress: false
});

export const LazyPoliticaPrivacidade = withLazyLoader(PoliticaPrivacidade, 'PoliticaPrivacidade', {
  preloadTrigger: 'none', 
  loadingMessage: 'Carregando política de privacidade...',
  showProgress: false
});

// 📊 Module priority configuration for intelligent preloading
export const MODULE_PRIORITIES = {
  // Critical path - sempre carregados rapidamente
  'Dashboard': 'critical',
  'SimuladorTributario': 'critical',
  'Precificacao': 'critical',
  'Configuracoes': 'critical',
  
  // High priority - core business features
  'ComparativoRegimes': 'high',
  'Propostas': 'high',
  'CustosOperacionais': 'high',
  
  // Medium priority - analysis features  
  'PontoEquilibrio': 'medium',
  'DRE': 'medium',
  'Relatorios': 'medium',
  'AnaliseViabilidade': 'medium',
  'ProjecaoCrescimento': 'medium',
  
  // Low priority - utility features
  'Enquadramento': 'low',
  'CalendarioFiscal': 'low',
  
  // Static - only on demand
  'LandingPage': 'static',
  'TermosDeUso': 'static',
  'PoliticaPrivacidade': 'static'
};

// 🎯 Smart preloading strategy
export const initializeSmartPreloading = () => {
  // Preload critical modules immediately after app start
  setTimeout(() => {
    Object.entries(MODULE_PRIORITIES).forEach(([moduleName, priority]) => {
      if (priority === 'critical') {
        if (window.lazyTracker && !window.lazyTracker.loadedModules.has(moduleName)) {
          window.lazyTracker.schedulePreload(moduleName, 'high');
        }
      }
    });
  }, 1000); // Wait 1 second after app initialization

  // Preload high priority modules after user interaction
  setTimeout(() => {
    Object.entries(MODULE_PRIORITIES).forEach(([moduleName, priority]) => {
      if (priority === 'high') {
        if (window.lazyTracker && !window.lazyTracker.loadedModules.has(moduleName)) {
          window.lazyTracker.schedulePreload(moduleName, 'medium');
        }
      }
    });
  }, 3000); // Wait 3 seconds for high priority

  // Preload medium priority modules when network is idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      Object.entries(MODULE_PRIORITIES).forEach(([moduleName, priority]) => {
        if (priority === 'medium') {
          if (window.lazyTracker && !window.lazyTracker.loadedModules.has(moduleName)) {
            window.lazyTracker.schedulePreload(moduleName, 'low');
          }
        }
      });
    });
  }
};

// 📱 Mobile-specific optimizations  
export const getMobileOptimizedComponent = (componentName) => {
  // Return lighter versions for mobile if screen is small
  const isMobile = window.innerWidth < 768;
  
  if (isMobile) {
    // For mobile, we might want to load components with reduced functionality
    // This is where we could implement mobile-specific versions
    return componentName;
  }
  
  return componentName;
};

// 🔧 Development helpers
export const getLoadedModules = () => {
  if (window.lazyTracker) {
    return window.lazyTracker.getLoadStats();
  }
  return { totalModules: 0, loadedModules: [] };
};

export const forcePreloadAll = () => {
  if (window.lazyTracker) {
    Object.keys(MODULE_PRIORITIES).forEach(moduleName => {
      window.lazyTracker.schedulePreload(moduleName, 'high');
    });
  }
};

// Export all lazy components as named exports for easier imports
export {
  // Direct lazy components (for advanced usage)
  Dashboard,
  SimuladorTributario,
  Precificacao,
  ComparativoRegimes,
  CustosOperacionais,
  PontoEquilibrio,
  AnaliseViabilidade,
  DRE,
  ProjecaoCrescimento,
  Propostas,
  Relatorios,
  Enquadramento,
  CalendarioFiscal,
  Configuracoes,
  LandingPage,
  TermosDeUso,
  PoliticaPrivacidade
};