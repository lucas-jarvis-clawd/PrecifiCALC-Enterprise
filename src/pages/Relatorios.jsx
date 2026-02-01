import { useState } from 'react';
import { FileDown, Mail, Share2, Calendar, Search, Eye, Download } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';

export default function Relatorios() {
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busca, setBusca] = useState('');

  const [relatoriosDisponiveis] = useState([
    {
      id: 1,
      nome: 'Análise Tributária Completa',
      descricao: 'Comparativo detalhado de todos os regimes tributários',
      tamanho: '2.3 MB',
      dataGeracao: '2026-02-01',
      downloads: 45,
      tipo: 'tributario',
    },
    {
      id: 2,
      nome: 'Relatório de Custos Operacionais',
      descricao: 'Demonstrativo de custos fixos e variáveis por categoria',
      tamanho: '1.8 MB',
      dataGeracao: '2026-01-31',
      downloads: 23,
      tipo: 'custos',
    },
    {
      id: 3,
      nome: 'Planilha de Precificação',
      descricao: 'Lista completa de serviços com preços sugeridos',
      tamanho: '945 KB',
      dataGeracao: '2026-01-30',
      downloads: 67,
      tipo: 'precificacao',
    },
    {
      id: 4,
      nome: 'Projeção de Viabilidade',
      descricao: 'Análise de viabilidade com projeções de 12 meses',
      tamanho: '3.1 MB',
      dataGeracao: '2026-01-29',
      downloads: 34,
      tipo: 'viabilidade',
    },
    {
      id: 5,
      nome: 'Propostas Comerciais',
      descricao: 'Template profissional para propostas de clientes',
      tamanho: '1.2 MB',
      dataGeracao: '2026-01-28',
      downloads: 89,
      tipo: 'propostas',
    },
  ]);

  const tiposRelatorio = [
    { value: 'todos', label: 'Todos' },
    { value: 'tributario', label: 'Tributário' },
    { value: 'custos', label: 'Custos' },
    { value: 'precificacao', label: 'Precificação' },
    { value: 'viabilidade', label: 'Viabilidade' },
    { value: 'propostas', label: 'Propostas' },
  ];

  const gerarRelatorio = (tipo) => {
    alert(`Gerando relatório ${tipo}... Será enviado por e-mail quando estiver pronto!`);
  };

  const baixarRelatorio = (relatorio) => {
    alert(`Baixando: ${relatorio.nome}`);
  };

  const enviarPorEmail = (relatorio) => {
    alert(`Enviando ${relatorio.nome} por e-mail...`);
  };

  const compartilhar = (relatorio) => {
    alert(`Link de compartilhamento gerado para: ${relatorio.nome}`);
  };

  const relatoriosFiltrados = relatoriosDisponiveis.filter(rel => {
    const matchTipo = filtroTipo === 'todos' || rel.tipo === filtroTipo;
    const matchBusca = !busca || rel.nome.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchBusca;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <FileDown className="text-brand-600" size={22} />
          Relatórios
        </h1>
        <p className="text-slate-500 text-sm mt-1">Gere e baixe relatórios profissionais em PDF ou Excel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={FileDown} label="Disponíveis" value="5" subvalue="Prontos para download" color="blue" />
        <StatCard icon={Download} label="Downloads" value="258" subvalue="Este mês" color="green" />
        <StatCard icon={Calendar} label="Último Gerado" value="Hoje" subvalue="Análise tributária" color="purple" />
        <StatCard icon={Share2} label="Compartilhamentos" value="34" subvalue="Links ativos" color="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Gerar Novo */}
        <Card>
          <CardHeader>
            <h2 className="text-slate-800 font-medium text-sm">Gerar Novo</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Tipo</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {tiposRelatorio.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => gerarRelatorio(filtroTipo)}
              className="w-full px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              Gerar Relatório
            </button>

            <div className="border-t border-slate-200 pt-3">
              <p className="text-xs font-medium text-slate-500 mb-2">Relatórios Rápidos</p>
              <div className="space-y-1">
                {[
                  { key: 'tributario', label: 'Análise Tributária' },
                  { key: 'custos', label: 'Relatório de Custos' },
                  { key: 'viabilidade', label: 'Análise de Viabilidade' },
                ].map(r => (
                  <button
                    key={r.key}
                    onClick={() => gerarRelatorio(r.key)}
                    className="w-full text-left px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-colors text-xs"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lista */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-slate-800 font-medium text-sm">Relatórios Disponíveis</h2>
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar..."
                    className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800 text-xs w-48 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>
            </CardHeader>

            <div className="divide-y divide-slate-100">
              {relatoriosFiltrados.map((rel) => (
                <div key={rel.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <FileDown size={14} className="text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-slate-800 text-sm font-medium truncate">{rel.nome}</h3>
                        <p className="text-slate-500 text-xs truncate">{rel.descricao}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span>{rel.tamanho}</span>
                          <span>{new Date(rel.dataGeracao).toLocaleDateString('pt-BR')}</span>
                          <span>{rel.downloads} downloads</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <button onClick={() => baixarRelatorio(rel)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors" title="Baixar">
                        <Download size={14} />
                      </button>
                      <button onClick={() => enviarPorEmail(rel)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors" title="Enviar por e-mail">
                        <Mail size={14} />
                      </button>
                      <button onClick={() => compartilhar(rel)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors" title="Compartilhar">
                        <Share2 size={14} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors" title="Visualizar">
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {relatoriosFiltrados.length === 0 && (
                <div className="px-5 py-8 text-center text-slate-400 text-sm">
                  Nenhum relatório encontrado.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Templates */}
      <Card>
        <CardHeader>
          <h2 className="text-slate-800 font-medium text-sm">Templates Personalizados</h2>
          <p className="text-slate-400 text-xs mt-0.5">Templates reutilizáveis para seus relatórios</p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { nome: 'Template Executivo', desc: 'Resumo executivo para apresentações', tags: [{ label: 'Executivo', color: 'blue' }, { label: 'PDF', color: 'green' }] },
              { nome: 'Template Técnico', desc: 'Relatório detalhado com cálculos', tags: [{ label: 'Técnico', color: 'purple' }, { label: 'Excel', color: 'green' }] },
              { nome: 'Template Cliente', desc: 'Formato simplificado para clientes', tags: [{ label: 'Cliente', color: 'amber' }, { label: 'PDF', color: 'green' }] },
            ].map((t, i) => (
              <div key={i} className="p-4 border border-slate-200 rounded-md hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                <h3 className="text-slate-800 text-sm font-medium mb-1">{t.nome}</h3>
                <p className="text-slate-500 text-xs">{t.desc}</p>
                <div className="mt-3 flex items-center gap-2">
                  {t.tags.map((tag, j) => {
                    const colors = { blue: 'bg-blue-50 text-blue-700', green: 'bg-emerald-50 text-emerald-700', purple: 'bg-violet-50 text-violet-700', amber: 'bg-amber-50 text-amber-700' };
                    return <span key={j} className={`px-2 py-0.5 text-xs rounded ${colors[tag.color]}`}>{tag.label}</span>;
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
