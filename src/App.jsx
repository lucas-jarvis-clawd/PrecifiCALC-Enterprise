import { useState } from 'react';
import Sidebar from './components/Sidebar';
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

const pages = {
  dashboard: { component: Dashboard, title: 'Dashboard' },
  simulador: { component: SimuladorTributario, title: 'Simulador Tributario' },
  custos: { component: CustosOperacionais, title: 'Custos Operacionais' },
  precificacao: { component: Precificacao, title: 'Precificacao' },
  comparativo: { component: ComparativoRegimes, title: 'Comparativo de Regimes' },
  viabilidade: { component: AnaliseViabilidade, title: 'Analise de Viabilidade' },
  equilibrio: { component: PontoEquilibrio, title: 'Ponto de Equilibrio' },
  propostas: { component: Propostas, title: 'Gerador de Propostas' },
  relatorios: { component: Relatorios, title: 'Relatorios' },
  configuracoes: { component: Configuracoes, title: 'Configuracoes' },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const PageComponent = pages[currentPage]?.component || Dashboard;

  return (
    <div className="flex h-screen overflow-hidden bg-surface-900">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <main className={`flex-1 overflow-y-auto transition-all duration-200 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        <div className="p-6 max-w-[1400px] mx-auto">
          <PageComponent onNavigate={setCurrentPage} />
        </div>
      </main>
    </div>
  );
}
