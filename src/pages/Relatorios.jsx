import { useState, useEffect } from 'react';
import { FileDown, Mail, Calendar, Search, Download, Printer, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';

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

function gerarRelatorio(tipo) {
  let titulo = '';
  let conteudo = '';

  switch (tipo) {
    case 'tributario': {
      const data = JSON.parse(localStorage.getItem('precificalc_simulador') || '{}');
      if (!data.regime) break;
      const regimeLabels = { simples: 'Simples Nacional', presumido: 'Lucro Presumido', real: 'Lucro Real', mei: 'MEI' };
      titulo = 'Análise Tributária';
      conteudo = `
        <div class="section">
          <h2>Dados da Simulação</h2>
          <table>
            <thead><tr><th>Parâmetro</th><th>Valor</th></tr></thead>
            <tbody>
              <tr><td>Regime Tributário</td><td><strong>${regimeLabels[data.regime] || data.regime}</strong></td></tr>
              <tr><td>Receita Mensal</td><td>${formatCurrencyLocal(data.receitaMensal)}</td></tr>
              <tr><td>Receita Bruta 12 meses (RBT12)</td><td>${formatCurrencyLocal(data.rbt12)}</td></tr>
              ${data.anexo ? `<tr><td>Anexo do Simples Nacional</td><td>Anexo ${data.anexo}</td></tr>` : ''}
              <tr><td>Tipo de Atividade</td><td>${data.tipoAtividade || '-'}</td></tr>
              <tr><td>Alíquota ISS</td><td>${data.issAliquota != null ? data.issAliquota + '%' : '-'}</td></tr>
              <tr><td>Despesas Dedutíveis</td><td>${formatCurrencyLocal(data.despesasDedutiveis)}</td></tr>
              <tr><td>Créditos PIS/COFINS</td><td>${formatCurrencyLocal(data.creditosPisCofins)}</td></tr>
              <tr><td>Despesas Operacionais</td><td>${formatCurrencyLocal(data.despesasOperacionais)}</td></tr>
              <tr><td>Folha de Pagamento Mensal</td><td>${formatCurrencyLocal(data.folhaMensal)}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="section">
          <h2>Observações</h2>
          <p style="font-size:12px;color:#475569;">Os valores acima são baseados nos dados informados no Simulador Tributário. Para uma análise completa, consulte um contador habilitado.</p>
        </div>`;
      break;
    }

    case 'custos': {
      const data = JSON.parse(localStorage.getItem('precificalc_custos') || '{}');
      if (!data.totalGeral && data.totalGeral !== 0) break;
      titulo = 'Relatório de Custos Operacionais';
      conteudo = `
        <div class="section">
          <h2>Resumo de Custos Mensais</h2>
          <table>
            <thead><tr><th>Categoria</th><th style="text-align:right">Valor Mensal</th></tr></thead>
            <tbody>
              <tr><td>Custos Fixos</td><td style="text-align:right">${formatCurrencyLocal(data.totalFixos)}</td></tr>
              <tr><td>Custos Variáveis</td><td style="text-align:right">${formatCurrencyLocal(data.totalVariaveis)}</td></tr>
              <tr><td>Folha de Pagamento + Pró-Labore</td><td style="text-align:right">${formatCurrencyLocal(data.custoFolha || data.folhaMensal)}</td></tr>
              <tr class="total"><td><strong>Custo Total Mensal</strong></td><td style="text-align:right"><strong>${formatCurrencyLocal(data.totalGeral)}</strong></td></tr>
            </tbody>
          </table>
        </div>
        <div class="section">
          <h2>Indicadores</h2>
          <table>
            <thead><tr><th>Indicador</th><th style="text-align:right">Valor</th></tr></thead>
            <tbody>
              <tr><td>Custo por Unidade Produzida</td><td style="text-align:right">${formatCurrencyLocal(data.custoPorUnidade)}</td></tr>
              <tr><td>Custo Variável Unitário</td><td style="text-align:right">${formatCurrencyLocal(data.custoVariavelUnitario)}</td></tr>
              <tr><td>Quantidade Mensal</td><td style="text-align:right">${(data.quantidadeMensal || 0).toLocaleString('pt-BR')} un.</td></tr>
              <tr><td>Funcionários</td><td style="text-align:right">${data.numFuncionarios || '-'}</td></tr>
              <tr><td>Salário Médio</td><td style="text-align:right">${formatCurrencyLocal(data.salarioMedio)}</td></tr>
              <tr><td>Pró-Labore</td><td style="text-align:right">${formatCurrencyLocal(data.proLabore)}</td></tr>
            </tbody>
          </table>
        </div>`;
      break;
    }

    case 'precificacao': {
      const data = JSON.parse(localStorage.getItem('precificalc_precificacao') || '{}');
      if (!data.tipo) break;
      titulo = 'Relatório de Precificação';
      conteudo = `
        <div class="section">
          <h2>Parâmetros de Precificação</h2>
          <table>
            <thead><tr><th>Parâmetro</th><th style="text-align:right">Valor</th></tr></thead>
            <tbody>
              <tr><td>Tipo</td><td style="text-align:right">${data.tipo === 'produto' ? 'Produto' : 'Serviço'}</td></tr>
              <tr><td>Custo do Produto/Serviço</td><td style="text-align:right">${formatCurrencyLocal(data.custoProduto)}</td></tr>
              <tr><td>Despesas Fixas Rateadas</td><td style="text-align:right">${formatCurrencyLocal(data.despesasFixas)}</td></tr>
              <tr><td>Despesas Variáveis</td><td style="text-align:right">${data.despesasVariaveisPercent || 0}%</td></tr>
              <tr><td>Margem Desejada</td><td style="text-align:right">${data.margemDesejada || 0}%</td></tr>
              <tr><td>Regime Tributário</td><td style="text-align:right">${data.regime || '-'}</td></tr>
              <tr><td>Quantidade Mensal</td><td style="text-align:right">${(data.quantidadeMensal || 0).toLocaleString('pt-BR')} un.</td></tr>
              <tr><td>Receita Mensal</td><td style="text-align:right">${formatCurrencyLocal(data.receitaMensal)}</td></tr>
            </tbody>
          </table>
        </div>`;
      break;
    }

    case 'viabilidade': {
      const data = JSON.parse(localStorage.getItem('precificalc_viabilidade') || '{}');
      if (!data.investimentoInicial && data.investimentoInicial !== 0) break;
      titulo = 'Análise de Viabilidade';
      conteudo = `
        <div class="section">
          <h2>Dados do Investimento</h2>
          <table>
            <thead><tr><th>Parâmetro</th><th style="text-align:right">Valor</th></tr></thead>
            <tbody>
              <tr><td>Investimento Inicial</td><td style="text-align:right">${formatCurrencyLocal(data.investimentoInicial)}</td></tr>
              <tr><td>Receita Mensal Esperada</td><td style="text-align:right">${formatCurrencyLocal(data.receitaMensal)}</td></tr>
              <tr><td>Custos Mensais</td><td style="text-align:right">${formatCurrencyLocal(data.custosMensais)}</td></tr>
            </tbody>
          </table>
        </div>`;
      break;
    }

    case 'dre': {
      const custos = JSON.parse(localStorage.getItem('precificalc_custos') || '{}');
      const simulador = JSON.parse(localStorage.getItem('precificalc_simulador') || '{}');
      if (!custos.totalGeral && !simulador.receitaMensal) break;
      const receita = simulador.receitaMensal || 0;
      const custoTotal = custos.totalGeral || 0;
      const lucro = receita - custoTotal;
      const margem = receita > 0 ? ((lucro / receita) * 100).toFixed(1) : '0.0';
      titulo = 'Demonstrativo de Resultados (DRE Simplificado)';
      conteudo = `
        <div class="section">
          <h2>Demonstrativo Mensal</h2>
          <table>
            <thead><tr><th>Conta</th><th style="text-align:right">Valor Mensal</th><th style="text-align:right">Valor Anual</th></tr></thead>
            <tbody>
              <tr><td><strong>Receita Bruta</strong></td><td style="text-align:right">${formatCurrencyLocal(receita)}</td><td style="text-align:right">${formatCurrencyLocal(receita * 12)}</td></tr>
              <tr><td>(-) Custos Fixos</td><td style="text-align:right;color:#dc2626">${formatCurrencyLocal(custos.totalFixos || 0)}</td><td style="text-align:right;color:#dc2626">${formatCurrencyLocal((custos.totalFixos || 0) * 12)}</td></tr>
              <tr><td>(-) Custos Variáveis</td><td style="text-align:right;color:#dc2626">${formatCurrencyLocal(custos.totalVariaveis || 0)}</td><td style="text-align:right;color:#dc2626">${formatCurrencyLocal((custos.totalVariaveis || 0) * 12)}</td></tr>
              <tr><td>(-) Folha de Pagamento</td><td style="text-align:right;color:#dc2626">${formatCurrencyLocal(custos.custoFolha || custos.folhaMensal || 0)}</td><td style="text-align:right;color:#dc2626">${formatCurrencyLocal((custos.custoFolha || custos.folhaMensal || 0) * 12)}</td></tr>
              <tr class="total"><td><strong>Resultado (Lucro/Prejuízo)</strong></td><td style="text-align:right;color:${lucro >= 0 ? '#16a34a' : '#dc2626'}"><strong>${formatCurrencyLocal(lucro)}</strong></td><td style="text-align:right;color:${lucro >= 0 ? '#16a34a' : '#dc2626'}"><strong>${formatCurrencyLocal(lucro * 12)}</strong></td></tr>
            </tbody>
          </table>
        </div>
        <div class="section">
          <h2>Indicadores</h2>
          <table>
            <thead><tr><th>Indicador</th><th style="text-align:right">Valor</th></tr></thead>
            <tbody>
              <tr><td>Margem de Lucro</td><td style="text-align:right;color:${lucro >= 0 ? '#16a34a' : '#dc2626'}">${margem}%</td></tr>
              <tr><td>Ponto de Equilíbrio Mensal</td><td style="text-align:right">${formatCurrencyLocal(custoTotal)}</td></tr>
            </tbody>
          </table>
        </div>`;
      break;
    }

    default:
      break;
  }

  if (!conteudo) {
    alert('Sem dados disponíveis. Preencha os módulos correspondentes primeiro.');
    return;
  }

  const win = window.open('', '_blank');
  win.document.write(`
    <html><head><title>${titulo} - PrecifiCALC</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', sans-serif; color: #1e293b; padding: 40px; font-size: 13px; line-height: 1.6; }
      .header { border-bottom: 3px solid #4f46e5; padding-bottom: 15px; margin-bottom: 25px; }
      .header h1 { font-size: 20px; color: #4f46e5; }
      .header p { font-size: 11px; color: #64748b; }
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
      <div class="header"><h1>${titulo}</h1><p>PrecifiCALC Enterprise | ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p></div>
      ${conteudo}
      <div class="footer">Gerado por PrecifiCALC Enterprise</div>
      <script>window.print();<\/script>
    </body></html>
  `);
  win.document.close();
}

export default function Relatorios() {
  const [busca, setBusca] = useState('');

  const [disponibilidade, setDisponibilidade] = useState({});

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
    {
      id: 'tributario',
      nome: 'Análise Tributária',
      descricao: 'Regime tributário, alíquotas e parâmetros do simulador',
      tipo: 'tributario',
    },
    {
      id: 'custos',
      nome: 'Relatório de Custos Operacionais',
      descricao: 'Custos fixos, variáveis e folha de pagamento',
      tipo: 'custos',
    },
    {
      id: 'precificacao',
      nome: 'Relatório de Precificação',
      descricao: 'Parâmetros e margens de precificação configurados',
      tipo: 'precificacao',
    },
    {
      id: 'viabilidade',
      nome: 'Análise de Viabilidade',
      descricao: 'Investimento, receita esperada e custos mensais',
      tipo: 'viabilidade',
    },
    {
      id: 'dre',
      nome: 'DRE Simplificado',
      descricao: 'Demonstrativo de Resultados com base nos custos e receita',
      tipo: 'dre',
    },
  ];

  const filtrados = relatorios.filter(rel => {
    if (!busca) return true;
    return rel.nome.toLowerCase().includes(busca.toLowerCase()) || rel.descricao.toLowerCase().includes(busca.toLowerCase());
  });

  const totalDisponiveis = Object.values(disponibilidade).filter(Boolean).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <FileDown className="text-brand-600" size={22} />
          Relatórios
        </h1>
        <p className="text-slate-500 text-sm mt-1">Gere relatórios profissionais a partir dos dados preenchidos nos módulos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard icon={FileDown} label="Tipos Disponíveis" value={String(relatorios.length)} subvalue="Modelos de relatório" color="blue" />
        <StatCard icon={CheckCircle2} label="Com Dados" value={String(totalDisponiveis)} subvalue="Prontos para gerar" color="green" />
        <StatCard icon={Calendar} label="Data Atual" value={new Date().toLocaleDateString('pt-BR')} subvalue="Referência dos relatórios" color="purple" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Gerar Rápido */}
        <Card>
          <CardHeader>
            <h2 className="text-slate-800 font-medium text-sm">Geração Rápida</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <p className="text-xs text-slate-500">Clique para gerar e imprimir diretamente:</p>
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
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Dados disponíveis</span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-50 text-slate-400 border border-slate-200">Sem dados</span>
                  )}
                </button>
              ))}
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
              {filtrados.map((rel) => (
                <div key={rel.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
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
                              <AlertCircle size={11} /> Sem dados - preencha o módulo correspondente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <button
                        onClick={() => gerarRelatorio(rel.tipo)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-md transition-colors"
                        title="Gerar e imprimir"
                      >
                        <Download size={13} /> Gerar
                      </button>
                      <button
                        onClick={() => alert('Configure um servidor SMTP para habilitar envio por e-mail.')}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="Enviar por e-mail"
                      >
                        <Mail size={14} />
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
              <h3 className="text-slate-800 text-sm font-medium">Como funciona</h3>
              <p className="text-slate-500 text-xs mt-1">
                Os relatórios são gerados a partir dos dados preenchidos nos módulos do sistema (Simulador Tributário, Custos Operacionais, Precificação e Viabilidade).
                Preencha os módulos desejados e volte aqui para gerar relatórios profissionais prontos para impressão.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
