import { useState, useEffect } from 'react';
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

const pages = {
  dashboard: { component: Dashboard, title: 'Dashboard' },
  simulador: { component: SimuladorTributario, title: 'Simulador Tributário' },
  custos: { component: CustosOperacionais, title: 'Custos Operacionais' },
  precificacao: { component: Precificacao, title: 'Precificação' },
  comparativo: { component: ComparativoRegimes, title: 'Comparativo de Regimes' },
  viabilidade: { component: AnaliseViabilidade, title: 'Análise de Viabilidade' },
  equilibrio: { component: PontoEquilibrio, title: 'Ponto de Equilíbrio' },
  propostas: { component: Propostas, title: 'Propostas' },
  dre: { component: DRE, title: 'DRE' },
  calendario: { component: CalendarioFiscal, title: 'Calendário Fiscal' },
  enquadramento: { component: Enquadramento, title: 'Enquadramento' },
  relatorios: { component: Relatorios, title: 'Relatórios' },
  configuracoes: { component: Configuracoes, title: 'Configurações' },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [perfilEmpresa, setPerfilEmpresa] = useState(null);

  useEffect(() => {
    // Verificar se o onboarding já foi feito
    const onboarded = localStorage.getItem('precificalc_onboarded');
    const perfil = localStorage.getItem('precificalc_perfil');
    
    if (onboarded === 'true' && perfil) {
      setIsOnboardingComplete(true);
      setPerfilEmpresa(JSON.parse(perfil));
    }
  }, []);

  const handleOnboardingComplete = (dadosEmpresa) => {
    setPerfilEmpresa(dadosEmpresa);
    setIsOnboardingComplete(true);
  };

  // Se onboarding não foi completado, mostrar a tela de configuração
  if (!isOnboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const PageComponent = pages[currentPage]?.component || Dashboard;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <main className={`flex-1 overflow-y-auto transition-all duration-200 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        <div className="p-6 max-w-[1400px] mx-auto">
          <PageComponent onNavigate={setCurrentPage} perfilEmpresa={perfilEmpresa} />
        </div>
      </main>
    </div>
  );
}
