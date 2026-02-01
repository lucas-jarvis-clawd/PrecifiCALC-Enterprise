import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SimuladorTributario from './pages/SimuladorTributario';
import CustosOperacionais from './pages/CustosOperacionais';
import Precificacao from './pages/Precificacao';
import ComparativoRegimes from './pages/ComparativoRegimes';
import Propostas from './pages/Propostas';
import AnaliseViabilidade from './pages/AnaliseViabilidade';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';

const pages = {
  dashboard: { component: Dashboard, title: 'Dashboard' },
  simulador: { component: SimuladorTributario, title: 'Simulador Tributário' },
  custos: { component: CustosOperacionais, title: 'Custos Operacionais' },
  precificacao: { component: Precificacao, title: 'Precificação de Serviços' },
  comparativo: { component: ComparativoRegimes, title: 'Comparativo de Regimes' },
  viabilidade: { component: AnaliseViabilidade, title: 'Análise de Viabilidade' },
  propostas: { component: Propostas, title: 'Gerador de Propostas' },
  relatorios: { component: Relatorios, title: 'Relatórios Avançados' },
  configuracoes: { component: Configuracoes, title: 'Configurações' },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const PageComponent = pages[currentPage].component;

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6 max-w-[1600px] mx-auto">
          <PageComponent />
        </div>
      </main>
    </div>
  );
}
