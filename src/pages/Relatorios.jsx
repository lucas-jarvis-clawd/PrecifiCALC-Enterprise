import { useState } from 'react';
import { FileDown, Mail, Share2, Calendar, Filter, Search, Eye, Download } from 'lucide-react';
import { Card, CardBody, StatCard } from '../components/Card';

export default function Relatorios() {
  const [filtros, setFiltros] = useState({
    tipoRelatorio: 'tributario',
    periodo: 'mensal',
    regime: 'todos',
    formato: 'pdf'
  });

  const [relatoriosDisponiveis] = useState([
    {
      id: 1,
      nome: 'Análise Tributária Completa',
      descricao: 'Comparativo detalhado de todos os regimes tributários',
      tamanho: '2.3 MB',
      dataGeracao: '2026-02-01',
      downloads: 45,
      tipo: 'tributario'
    },
    {
      id: 2,
      nome: 'Relatório de Custos Operacionais',
      descricao: 'Demonstrativo de custos fixos e variáveis por categoria',
      tamanho: '1.8 MB',
      dataGeracao: '2026-01-31',
      downloads: 23,
      tipo: 'custos'
    },
    {
      id: 3,
      nome: 'Planilha de Precificação',
      descricao: 'Lista completa de serviços com preços sugeridos',
      tamanho: '945 KB',
      dataGeracao: '2026-01-30',
      downloads: 67,
      tipo: 'precificacao'
    },
    {
      id: 4,
      nome: 'Projeção de Viabilidade',
      descricao: 'Análise de viabilidade com projeções de 12 meses',
      tamanho: '3.1 MB',
      dataGeracao: '2026-01-29',
      downloads: 34,
      tipo: 'viabilidade'
    },
    {
      id: 5,
      nome: 'Propostas Comerciais',
      descricao: 'Template profissional para propostas de clientes',
      tamanho: '1.2 MB',
      dataGeracao: '2026-01-28',
      downloads: 89,
      tipo: 'propostas'
    }
  ]);

  const tiposRelatorio = [
    { value: 'todos', label: 'Todos os Relatórios' },
    { value: 'tributario', label: 'Análise Tributária' },
    { value: 'custos', label: 'Custos Operacionais' },
    { value: 'precificacao', label: 'Precificação' },
    { value: 'viabilidade', label: 'Viabilidade' },
    { value: 'propostas', label: 'Propostas' }
  ];

  const gerarRelatorio = async (tipo) => {
    // Simular geração de relatório
    alert(`Gerando relatório ${tipo}... Será enviado por email quando estiver pronto!`);
  };

  const baixarRelatorio = (relatorio) => {
    // Simular download
    alert(`Baixando: ${relatorio.nome}`);
  };

  const enviarPorEmail = (relatorio) => {
    // Simular envio por email
    alert(`Enviando ${relatorio.nome} por email...`);
  };

  const compartilhar = (relatorio) => {
    // Simular compartilhamento
    alert(`Link de compartilhamento gerado para: ${relatorio.nome}`);
  };

  const relatoriosFiltrados = relatoriosDisponiveis.filter(rel => 
    filtros.tipoRelatorio === 'todos' || rel.tipo === filtros.tipoRelatorio
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
          <FileDown size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Relatórios Avançados</h1>
          <p className="text-dark-400">Gere e baixe relatórios profissionais em PDF ou Excel</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={FileDown}
          label="Relatórios Disponíveis"
          value="5"
          subvalue="Prontos para download"
          color="blue"
        />
        <StatCard
          icon={Download}
          label="Downloads Total"
          value="258"
          subvalue="Este mês"
          color="green"
        />
        <StatCard
          icon={Calendar}
          label="Último Gerado"
          value="Hoje"
          subvalue="Análise tributária"
          color="purple"
        />
        <StatCard
          icon={Share2}
          label="Compartilhamentos"
          value="34"
          subvalue="Links ativos"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Gerar Novos Relatórios */}
        <div className="xl:col-span-1">
          <Card>
            <div className="px-6 py-4 border-b border-dark-700/30">
              <h2 className="font-semibold text-white">Gerar Novo Relatório</h2>
            </div>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Tipo de Relatório
                </label>
                <select
                  value={filtros.tipoRelatorio}
                  onChange={(e) => setFiltros({ ...filtros, tipoRelatorio: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                >
                  {tiposRelatorio.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Período
                </label>
                <select
                  value={filtros.periodo}
                  onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                >
                  <option value="mensal">Mensal</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="semestral">Semestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Formato
                </label>
                <select
                  value={filtros.formato}
                  onChange={(e) => setFiltros({ ...filtros, formato: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="word">Word</option>
                </select>
              </div>

              <button
                onClick={() => gerarRelatorio(filtros.tipoRelatorio)}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-700 transition-all duration-200"
              >
                <FileDown size={16} className="inline mr-2" />
                Gerar Relatório
              </button>

              <div className="pt-4 border-t border-dark-700/30">
                <h3 className="text-white font-medium mb-3">Relatórios Rápidos</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => gerarRelatorio('tributario')}
                    className="w-full text-left px-3 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors text-sm"
                  >
                    📊 Análise Tributária
                  </button>
                  <button
                    onClick={() => gerarRelatorio('custos')}
                    className="w-full text-left px-3 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors text-sm"
                  >
                    💰 Relatório de Custos
                  </button>
                  <button
                    onClick={() => gerarRelatorio('viabilidade')}
                    className="w-full text-left px-3 py-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors text-sm"
                  >
                    🎯 Análise de Viabilidade
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Lista de Relatórios */}
        <div className="xl:col-span-3">
          <Card>
            <div className="px-6 py-4 border-b border-dark-700/30">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">Relatórios Disponíveis</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-500" />
                    <input
                      type="text"
                      placeholder="Buscar relatórios..."
                      className="pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white text-sm"
                    />
                  </div>
                  <button className="p-2 text-dark-400 hover:text-white transition-colors">
                    <Filter size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-dark-700/20">
              {relatoriosFiltrados.map((relatorio) => (
                <div key={relatorio.id} className="px-6 py-4 hover:bg-dark-800/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-dark-700 flex items-center justify-center">
                          <FileDown size={16} className="text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{relatorio.nome}</h3>
                          <p className="text-dark-400 text-sm">{relatorio.descricao}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-dark-500">
                            <span>{relatorio.tamanho}</span>
                            <span>•</span>
                            <span>{new Date(relatorio.dataGeracao).toLocaleDateString('pt-BR')}</span>
                            <span>•</span>
                            <span>{relatorio.downloads} downloads</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => baixarRelatorio(relatorio)}
                        className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-all"
                        title="Baixar"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => enviarPorEmail(relatorio)}
                        className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-all"
                        title="Enviar por email"
                      >
                        <Mail size={16} />
                      </button>
                      <button
                        onClick={() => compartilhar(relatorio)}
                        className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-all"
                        title="Compartilhar"
                      >
                        <Share2 size={16} />
                      </button>
                      <button
                        className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-all"
                        title="Visualizar"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Templates de Relatório */}
      <Card>
        <div className="px-6 py-4 border-b border-dark-700/30">
          <h2 className="font-semibold text-white">Templates Personalizados</h2>
          <p className="text-dark-400 text-sm">Crie templates reutilizáveis para seus relatórios</p>
        </div>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-dark-700 rounded-lg hover:border-dark-600 transition-colors cursor-pointer">
              <h3 className="text-white font-medium mb-2">Template Executivo</h3>
              <p className="text-dark-400 text-sm">Resumo executivo para apresentações</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">Executivo</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">PDF</span>
              </div>
            </div>
            
            <div className="p-4 border border-dark-700 rounded-lg hover:border-dark-600 transition-colors cursor-pointer">
              <h3 className="text-white font-medium mb-2">Template Técnico</h3>
              <p className="text-dark-400 text-sm">Relatório detalhado com cálculos</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">Técnico</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Excel</span>
              </div>
            </div>
            
            <div className="p-4 border border-dark-700 rounded-lg hover:border-dark-600 transition-colors cursor-pointer">
              <h3 className="text-white font-medium mb-2">Template Cliente</h3>
              <p className="text-dark-400 text-sm">Formato simplificado para clientes</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded">Cliente</span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">PDF</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}