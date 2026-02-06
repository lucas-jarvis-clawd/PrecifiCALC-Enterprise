import { useState, useEffect, useMemo } from 'react';
import {
  FileDown, Mail, Calendar, Search, Download, Printer, AlertCircle,
  CheckCircle2, FileSpreadsheet, Table2, Building2, Palette
} from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';

// ─── Helpers ────────────────────────────────────────────────────
function formatCurrencyLocal(value) {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function checkDados(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0;
  } catch { return false; }
}

function getConfig() {
  try {
    return JSON.parse(localStorage.getItem('precificalc_config') || '{}');
  } catch { return {}; }
}

function getPerfil() {
  try {
    return JSON.parse(localStorage.getItem('precificalc_perfil') || '{}');
  } catch { return {}; }
}

// ─── White-label: loads company info for PDFs ────────────────────
function getEmpresaInfo() {
  const config = getConfig();
  const perfil = getPerfil();
  return {
    nome: config.nomeEmpresa || perfil.nomeEmpresa || 'PrecifiCALC Enterprise',
    cnpj: config.cnpj || perfil.cnpj || '',
    endereco: config.endereco || '',
    telefone: config.telefone || '',
    email: config.email || '',
    cor: config.corMarca || '#4f46e5',
  };
}

// ─── Segment Templates ─────────────────────────────────────────
const segmentTemplates = {
  comercio: {
    label: 'Comércio',
    icon: '🏪',
    regimeDefault: 'simples',
    custosTipoDefault: [
      { nome: 'Custo de Mercadoria (CMV)', valor: 0 },
      { nome: 'Frete de Entrega', valor: 0 },
      { nome: 'Embalagens', valor: 0 },
      { nome: 'Comissões de Vendas', valor: 0 },
    ],
    margem: 35,
    descricao: 'Template ideal para lojas, e-commerces e distribuidores'
  },
  servicos: {
    label: 'Serviços',
    icon: '💼',
    regimeDefault: 'presumido',
    custosTipoDefault: [
      { nome: 'Mão de Obra Direta', valor: 0 },
      { nome: 'Ferramentas / Licenças', valor: 0 },
      { nome: 'Deslocamento / Transporte', valor: 0 },
      { nome: 'Insumos de Serviço', valor: 0 },
    ],
    margem: 45,
    descricao: 'Para consultorias, agências, prestadores de serviço'
  },
  industria: {
    label: 'Indústria',
    icon: '🏭',
    regimeDefault: 'real',
    custosTipoDefault: [
      { nome: 'Matéria Prima', valor: 0 },
      { nome: 'Mão de Obra Produção', valor: 0 },
      { nome: 'Energia / Utilities', valor: 0 },
      { nome: 'Manutenção Máquinas', valor: 0 },
    ],
    margem: 25,
    descricao: 'Para fábricas e linhas de produção'
  },
  contabilidade: {
    label: 'Escritório Contábil',
    icon: '📊',
    regimeDefault: 'presumido',
    custosTipoDefault: [
      { nome: 'Software Contábil', valor: 0 },
      { nome: 'Certificado Digital', valor: 0 },
      { nome: 'Treinamento / CRC', valor: 0 },
      { nome: 'Marketing Digital', valor: 0 },
    ],
    margem: 50,
    descricao: 'Para escritórios de contabilidade e BPO financeiro'
  },
  saude: {
    label: 'Saúde',
    icon: '🏥',
    regimeDefault: 'presumido',
    custosTipoDefault: [
      { nome: 'Materiais Clínicos', valor: 0 },
      { nome: 'Equipamentos', valor: 0 },
      { nome: 'Seguros / RC Profissional', valor: 0 },
      { nome: 'Aluguel Consultório', valor: 0 },
    ],
    margem: 40,
    descricao: 'Para clínicas, consultórios e profissionais da saúde'
  },
};

// ─── Export to CSV ──────────────────────────────────────────────
function exportCSV(rows, filename) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => headers.map(h => {
      const val = row[h];
      if (typeof val === 'number') return val.toString().replace('.', ',');
      return `"${(val || '').toString().replace(/"/g, '""')}"`;
    }).join(';'))
  ].join('\n');

  // BOM for UTF-8
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Export to Excel (XLSX) ─────────────────────────────────────
async function exportXLSX(rows, filename, sheetName = 'Dados') {
  if (!rows || rows.length === 0) return;
  try {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Auto-width columns
    const maxWidths = Object.keys(rows[0]).map(key => {
      const maxLen = Math.max(key.length, ...rows.map(r => String(r[key] || '').length));
      return { wch: Math.min(maxLen + 2, 40) };
    });
    ws['!cols'] = maxWidths;

    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (err) {
    console.error('Erro ao exportar Excel:', err);
    alert('Erro ao exportar para Excel. Tente usar CSV.');
  }
}

// ─── Build report data rows for export ──────────────────────────
function buildReportRows(tipo) {
  switch (tipo) {
    case 'tributario': {
      const data = JSON.parse(localStorage.getItem('precificalc_simulador') || '{}');
      if (!data.regime) return null;
      const regimeLabels = { simples: 'Simples Nacional', presumido: 'Lucro Presumido', real: 'Lucro Real', mei: 'MEI' };
      return [
        { Parâmetro: 'Regime Tributário', Valor: regimeLabels[data.regime] || data.regime },
        { Parâmetro: 'Receita Mensal', Valor: data.receitaMensal || 0 },
        { Parâmetro: 'Receita Bruta 12 meses (RBT12)', Valor: data.rbt12 || 0 },
        { Parâmetro: 'Anexo do Simples', Valor: data.anexo || '-' },
        { Parâmetro: 'Tipo de Atividade', Valor: data.tipoAtividade || '-' },
        { Parâmetro: 'Alíquota ISS (%)', Valor: data.issAliquota ?? '-' },
        { Parâmetro: 'Despesas Dedutíveis', Valor: data.despesasDedutiveis || 0 },
        { Parâmetro: 'Créditos PIS/COFINS', Valor: data.creditosPisCofins || 0 },
        { Parâmetro: 'Despesas Operacionais', Valor: data.despesasOperacionais || 0 },
        { Parâmetro: 'Folha de Pagamento', Valor: data.folhaMensal || 0 },
      ];
    }
    case 'custos': {
      const data = JSON.parse(localStorage.getItem('precificalc_custos') || '{}');
      if (!data.totalGeral && data.totalGeral !== 0) return null;
      return [
        { Categoria: 'Custos Fixos', 'Valor Mensal': data.totalFixos || 0, 'Valor Anual': (data.totalFixos || 0) * 12 },
        { Categoria: 'Custos Variáveis', 'Valor Mensal': data.totalVariaveis || 0, 'Valor Anual': (data.totalVariaveis || 0) * 12 },
        { Categoria: 'Folha + Pró-Labore', 'Valor Mensal': data.custoFolha || data.folhaMensal || 0, 'Valor Anual': (data.custoFolha || data.folhaMensal || 0) * 12 },
        { Categoria: 'TOTAL', 'Valor Mensal': data.totalGeral || 0, 'Valor Anual': (data.totalGeral || 0) * 12 },
      ];
    }
    case 'precificacao': {
      const data = JSON.parse(localStorage.getItem('precificalc_precificacao') || '{}');
      if (!data.tipo) return null;
      return [
        { Parâmetro: 'Tipo', Valor: data.tipo === 'produto' ? 'Produto' : 'Serviço' },
        { Parâmetro: 'Custo do Produto/Serviço', Valor: data.custoProduto || 0 },
        { Parâmetro: 'Despesas Fixas Rateadas', Valor: data.despesasFixas || 0 },
        { Parâmetro: 'Despesas Variáveis (%)', Valor: data.despesasVariaveisPercent || 0 },
        { Parâmetro: 'Margem Desejada (%)', Valor: data.margemDesejada || 0 },
        { Parâmetro: 'Regime Tributário', Valor: data.regime || '-' },
        { Parâmetro: 'Quantidade Mensal', Valor: data.quantidadeMensal || 0 },
        { Parâmetro: 'Receita Mensal', Valor: data.receitaMensal || 0 },
      ];
    }
    case 'viabilidade': {
      const data = JSON.parse(localStorage.getItem('precificalc_viabilidade') || '{}');
      if (!data.investimentoInicial && data.investimentoInicial !== 0) return null;
      return [
        { Parâmetro: 'Investimento Inicial', Valor: data.investimentoInicial || 0 },
        { Parâmetro: 'Receita Mensal Esperada', Valor: data.receitaMensal || 0 },
        { Parâmetro: 'Custos Mensais', Valor: data.custosMensais || 0 },
      ];
    }
    case 'dre': {
      const custos = JSON.parse(localStorage.getItem('precificalc_custos') || '{}');
      const simulador = JSON.parse(localStorage.getItem('precificalc_simulador') || '{}');
      if (!custos.totalGeral && !simulador.receitaMensal) return null;
      const receita = simulador.receitaMensal || 0;
      const custoTotal = custos.totalGeral || 0;
      const lucro = receita - custoTotal;
      return [
        { Conta: 'Receita Bruta', 'Valor Mensal': receita, 'Valor Anual': receita * 12 },
        { Conta: '(-) Custos Fixos', 'Valor Mensal': custos.totalFixos || 0, 'Valor Anual': (custos.totalFixos || 0) * 12 },
        { Conta: '(-) Custos Variáveis', 'Valor Mensal': custos.totalVariaveis || 0, 'Valor Anual': (custos.totalVariaveis || 0) * 12 },
        { Conta: '(-) Folha de Pagamento', 'Valor Mensal': custos.custoFolha || custos.folhaMensal || 0, 'Valor Anual': (custos.custoFolha || custos.folhaMensal || 0) * 12 },
        { Conta: 'Resultado (Lucro/Prejuízo)', 'Valor Mensal': lucro, 'Valor Anual': lucro * 12 },
      ];
    }
    default:
      return null;
  }
}

// ─── Generate PDF (white-label print view) ──────────────────────
function gerarRelatorio(tipo) {
  const rows = buildReportRows(tipo);
  if (!rows) {
    alert('Sem dados disponíveis. Preencha os módulos correspondentes primeiro.');
    return;
  }

  const empresa = getEmpresaInfo();
  const tituloMap = {
    tributario: 'Análise Tributária',
    custos: 'Relatório de Custos Operacionais',
    precificacao: 'Relatório de Precificação',
    viabilidade: 'Análise de Viabilidade',
    dre: 'Demonstrativo de Resultados (DRE Simplificado)',
  };
  const titulo = tituloMap[tipo] || 'Relatório';

  // Build table HTML from rows
  const headers = Object.keys(rows[0]);
  const thHtml = headers.map(h => `<th>${h}</th>`).join('');
  const tbHtml = rows.map(row => {
    const isTotal = String(row[headers[0]]).toUpperCase().includes('TOTAL') || String(row[headers[0]]).startsWith('=') || String(row[headers[0]]).includes('Resultado');
    return `<tr class="${isTotal ? 'total' : ''}">${headers.map(h => {
      const val = row[h];
      if (typeof val === 'number') {
        return `<td style="text-align:right">${formatCurrencyLocal(val)}</td>`;
      }
      return `<td>${val}</td>`;
    }).join('')}</tr>`;
  }).join('');

  const empresaHeader = empresa.cnpj
    ? `<p style="font-size:11px;color:#64748b;">${empresa.nome}${empresa.cnpj ? ' | CNPJ: ' + empresa.cnpj : ''}${empresa.telefone ? ' | ' + empresa.telefone : ''}</p>`
    : `<p style="font-size:11px;color:#64748b;">${empresa.nome}</p>`;

  const win = window.open('', '_blank');
  win.document.write(`
    <html><head><title>${titulo} - ${empresa.nome}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', sans-serif; color: #1e293b; padding: 40px; font-size: 13px; line-height: 1.6; }
      .header { border-bottom: 3px solid ${empresa.cor}; padding-bottom: 15px; margin-bottom: 25px; }
      .header h1 { font-size: 20px; color: ${empresa.cor}; }
      .section { margin: 20px 0; }
      .section h2 { font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #f8fafc; padding: 8px; text-align: left; font-size: 11px; color: #64748b; border-bottom: 2px solid #e2e8f0; }
      td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
      .total td { font-weight: 700; border-top: 2px solid #e2e8f0; }
      .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
      @media print { body { padding: 20px; } }
    </style></head>
    <body>
      <div class="header">
        <h1>${titulo}</h1>
        ${empresaHeader}
        <p style="font-size:11px;color:#94a3b8;">${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>
      <div class="section">
        <table>
          <thead><tr>${thHtml}</tr></thead>
          <tbody>${tbHtml}</tbody>
        </table>
      </div>
      <div class="footer">
        Gerado por ${empresa.nome} • Powered by PrecifiCALC Enterprise
      </div>
      <script>window.print();</script>
    </body></html>
  `);
  win.document.close();
}

// ─── Main Component ─────────────────────────────────────────────
export default function Relatorios() {
  const [busca, setBusca] = useState('');
  const [disponibilidade, setDisponibilidade] = useState({});
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    setDisponibilidade({
      tributario: checkDados('precificalc_simulador'),
      custos: checkDados('precificalc_custos'),
      precificacao: checkDados('precificalc_precificacao'),
      viabilidade: checkDados('precificalc_viabilidade'),
      dre: checkDados('precificalc_custos') || checkDados('precificalc_simulador'),
    });
  }, []);

  const relatorios = [
    { id: 'tributario', nome: 'Análise Tributária', descricao: 'Regime tributário, alíquotas e parâmetros do simulador', tipo: 'tributario' },
    { id: 'custos', nome: 'Relatório de Custos Operacionais', descricao: 'Custos fixos, variáveis e folha de pagamento', tipo: 'custos' },
    { id: 'precificacao', nome: 'Relatório de Precificação', descricao: 'Parâmetros e margens de precificação configurados', tipo: 'precificacao' },
    { id: 'viabilidade', nome: 'Análise de Viabilidade', descricao: 'Investimento, receita esperada e custos mensais', tipo: 'viabilidade' },
    { id: 'dre', nome: 'DRE Simplificado', descricao: 'Demonstrativo de Resultados com base nos custos e receita', tipo: 'dre' },
  ];

  const filtrados = relatorios.filter(rel => {
    if (!busca) return true;
    return rel.nome.toLowerCase().includes(busca.toLowerCase()) || rel.descricao.toLowerCase().includes(busca.toLowerCase());
  });

  const totalDisponiveis = Object.values(disponibilidade).filter(Boolean).length;

  function handleExport(tipo, formato) {
    const rows = buildReportRows(tipo);
    if (!rows) {
      alert('Sem dados disponíveis. Preencha os módulos correspondentes primeiro.');
      return;
    }
    const nameMap = {
      tributario: 'analise_tributaria',
      custos: 'custos_operacionais',
      precificacao: 'precificacao',
      viabilidade: 'viabilidade',
      dre: 'dre_simplificado',
    };
    const filename = nameMap[tipo] || 'relatorio';
    if (formato === 'csv') exportCSV(rows, filename);
    else if (formato === 'xlsx') exportXLSX(rows, filename);
  }

  function aplicarTemplate(templateKey) {
    const template = segmentTemplates[templateKey];
    if (!template) return;

    // Pre-fill precificacao data with template defaults
    const existingPrec = JSON.parse(localStorage.getItem('precificalc_precificacao') || '{}');
    const updated = {
      ...existingPrec,
      margemDesejada: template.margem,
      segmento: templateKey,
    };
    localStorage.setItem('precificalc_precificacao', JSON.stringify(updated));

    // Pre-fill simulador regime
    const existingSim = JSON.parse(localStorage.getItem('precificalc_simulador') || '{}');
    const updatedSim = {
      ...existingSim,
      regime: template.regimeDefault,
    };
    localStorage.setItem('precificalc_simulador', JSON.stringify(updatedSim));

    alert(`Template "${template.label}" aplicado! Margem padrão: ${template.margem}%, regime sugerido: ${template.regimeDefault}. Recarregue os módulos para ver os dados.`);
    setShowTemplates(false);
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <FileDown className="text-brand-600" size={22} />
          Relatórios
        </h1>
        <p className="text-slate-500 text-sm mt-1">Gere relatórios profissionais, exporte em PDF, Excel ou CSV</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={FileDown} label="Tipos Disponíveis" value={String(relatorios.length)} subvalue="Modelos de relatório" color="blue" />
        <StatCard icon={CheckCircle2} label="Com Dados" value={String(totalDisponiveis)} subvalue="Prontos para gerar" color="green" />
        <StatCard icon={Calendar} label="Data Atual" value={new Date().toLocaleDateString('pt-BR')} subvalue="Referência dos relatórios" color="purple" />
        <StatCard icon={Building2} label="Marca Branca" value="Ativo" subvalue="PDFs personalizados" color="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left column: Quick actions + Templates */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-slate-800 font-medium text-sm">Geração Rápida</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <p className="text-xs text-slate-500">Clique para gerar e imprimir:</p>
              <div className="space-y-1">
                {[
                  { key: 'tributario', label: 'Análise Tributária' },
                  { key: 'custos', label: 'Relatório de Custos' },
                  { key: 'dre', label: 'DRE Simplificado' },
                  { key: 'precificacao', label: 'Precificação' },
                  { key: 'viabilidade', label: 'Viabilidade' },
                ].map(r => (
                  <button
                    key={r.key}
                    onClick={() => gerarRelatorio(r.key)}
                    className="w-full text-left px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-colors text-xs flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Printer size={12} className="text-slate-400" />
                      {r.label}
                    </span>
                    {disponibilidade[r.key] ? (
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200">OK</span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-50 text-slate-400 border border-slate-200">—</span>
                    )}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Templates por segmento */}
          <Card>
            <CardHeader>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="w-full flex items-center justify-between text-slate-800 font-medium text-sm"
              >
                <span className="flex items-center gap-1.5">
                  <Palette size={14} className="text-brand-500" />
                  Templates por Segmento
                </span>
                <span className="text-xs text-brand-600">{showTemplates ? '▲' : '▼'}</span>
              </button>
            </CardHeader>
            {showTemplates && (
              <CardBody className="space-y-2 pt-0">
                <p className="text-xs text-slate-500 mb-2">Aplique configurações pré-definidas para seu segmento:</p>
                {Object.entries(segmentTemplates).map(([key, tpl]) => (
                  <button
                    key={key}
                    onClick={() => aplicarTemplate(key)}
                    className="w-full text-left px-3 py-2.5 border border-slate-200 rounded-md hover:border-brand-300 hover:bg-brand-50/50 transition-all text-xs group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{tpl.icon}</span>
                      <div>
                        <div className="font-medium text-slate-700 group-hover:text-brand-700">{tpl.label}</div>
                        <div className="text-slate-400 text-[11px]">{tpl.descricao}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </CardBody>
            )}
          </Card>

          {/* White Label Config */}
          <Card>
            <CardHeader>
              <h2 className="text-slate-800 font-medium text-sm flex items-center gap-1.5">
                <Building2 size={14} className="text-slate-400" />
                Marca Branca
              </h2>
            </CardHeader>
            <CardBody>
              <p className="text-xs text-slate-500 mb-2">
                Os PDFs usam automaticamente os dados da empresa em <strong>Configurações</strong>.
                Preencha nome, CNPJ e cor da marca para personalizar seus relatórios.
              </p>
              <div className="p-2 bg-slate-50 rounded-md text-xs text-slate-600 space-y-1">
                {(() => {
                  const emp = getEmpresaInfo();
                  return (
                    <>
                      <div className="flex justify-between"><span className="text-slate-400">Empresa:</span> <span className="font-medium truncate ml-2">{emp.nome}</span></div>
                      {emp.cnpj && <div className="flex justify-between"><span className="text-slate-400">CNPJ:</span> <span className="font-mono">{emp.cnpj}</span></div>}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Cor:</span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-sm border border-slate-200" style={{ backgroundColor: emp.cor }} />
                          <span className="font-mono">{emp.cor}</span>
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main: report list */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h2 className="text-slate-800 font-medium text-sm">Relatórios Disponíveis</h2>
                <div className="relative w-full sm:w-auto">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full sm:w-48 pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>
            </CardHeader>

            <div className="divide-y divide-slate-100">
              {filtrados.map((rel) => (
                <div key={rel.id} className="px-4 sm:px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <FileDown size={14} className="text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-slate-800 text-sm font-medium truncate">{rel.nome}</h3>
                        <p className="text-slate-500 text-xs truncate">{rel.descricao}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          {disponibilidade[rel.tipo] ? (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <CheckCircle2 size={11} /> Dados disponíveis
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-400">
                              <AlertCircle size={11} /> Sem dados
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* PDF / Print */}
                      <button
                        onClick={() => gerarRelatorio(rel.tipo)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-md transition-colors"
                        title="Gerar PDF / Imprimir"
                      >
                        <Download size={13} /> PDF
                      </button>
                      {/* CSV */}
                      <button
                        onClick={() => handleExport(rel.tipo, 'csv')}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        title="Exportar CSV"
                      >
                        <Table2 size={12} /> CSV
                      </button>
                      {/* Excel */}
                      <button
                        onClick={() => handleExport(rel.tipo, 'xlsx')}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                        title="Exportar Excel"
                      >
                        <FileSpreadsheet size={12} /> Excel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filtrados.length === 0 && (
                <div className="px-5 py-8 text-center text-slate-400 text-sm">
                  Nenhum relatório encontrado.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Dica */}
      <Card>
        <CardBody>
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-slate-800 text-sm font-medium">Exportação e Marca Branca</h3>
              <p className="text-slate-500 text-xs mt-1">
                <strong>PDF:</strong> Abre uma janela de impressão com seus dados da empresa (marca branca).{' '}
                <strong>CSV:</strong> Abre em qualquer planilha, compatível com separador ponto-e-vírgula.{' '}
                <strong>Excel:</strong> Arquivo .xlsx nativo com larguras automáticas.{' '}
                Configure sua marca em <strong>Configurações → Dados da Empresa</strong>.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
