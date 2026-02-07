// Lazy-loaded Pages - Code splitting for PrecifiCALC modules
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Loading fallback
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    <p className="mt-4 text-sm text-slate-500 font-medium">Carregando...</p>
  </div>
);

// Simple wrapper that adds Suspense to a lazy component
const withSuspense = (LazyComponent) => {
  const Wrapped = (props) => (
    <Suspense fallback={<PageLoader />}>
      <LazyComponent {...props} />
    </Suspense>
  );
  return Wrapped;
};

// Lazy imports
const Dashboard = lazy(() => import('../pages/Dashboard.jsx'));
const SimuladorTributario = lazy(() => import('../pages/SimuladorTributario.jsx'));
const Precificacao = lazy(() => import('../pages/Precificacao.jsx'));
const ComparativoRegimes = lazy(() => import('../pages/ComparativoRegimes.jsx'));
const CustosOperacionais = lazy(() => import('../pages/CustosOperacionais.jsx'));
const PontoEquilibrio = lazy(() => import('../pages/PontoEquilibrio.jsx'));
const AnaliseViabilidade = lazy(() => import('../pages/AnaliseViabilidade.jsx'));
const DRE = lazy(() => import('../pages/DRE.jsx'));
const ProjecaoCrescimento = lazy(() => import('../pages/ProjecaoCrescimento.jsx'));
const Propostas = lazy(() => import('../pages/Propostas.jsx'));
const Relatorios = lazy(() => import('../pages/Relatorios.jsx'));
const Enquadramento = lazy(() => import('../pages/Enquadramento.jsx'));
const CalendarioFiscal = lazy(() => import('../pages/CalendarioFiscal.jsx'));
const Configuracoes = lazy(() => import('../pages/Configuracoes.jsx'));

// Wrapped exports with Suspense
export const LazyDashboard = withSuspense(Dashboard);
export const LazySimuladorTributario = withSuspense(SimuladorTributario);
export const LazyPrecificacao = withSuspense(Precificacao);
export const LazyComparativoRegimes = withSuspense(ComparativoRegimes);
export const LazyCustosOperacionais = withSuspense(CustosOperacionais);
export const LazyPontoEquilibrio = withSuspense(PontoEquilibrio);
export const LazyAnaliseViabilidade = withSuspense(AnaliseViabilidade);
export const LazyDRE = withSuspense(DRE);
export const LazyProjecaoCrescimento = withSuspense(ProjecaoCrescimento);
export const LazyPropostas = withSuspense(Propostas);
export const LazyRelatorios = withSuspense(Relatorios);
export const LazyEnquadramento = withSuspense(Enquadramento);
export const LazyCalendarioFiscal = withSuspense(CalendarioFiscal);
export const LazyConfiguracoes = withSuspense(Configuracoes);

export const initializeSmartPreloading = () => {};
