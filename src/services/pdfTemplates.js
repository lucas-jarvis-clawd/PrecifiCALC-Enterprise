/**
 * PrecifiCALC Enterprise - PDF Templates por Segmento
 * 
 * Templates profissionais para cada tipo de negócio:
 * - Comércio/Padaria: Custos de produtos, margens, precificação
 * - Serviços/Consultoria: Precificação por hora, projetos
 * - Saúde/Clínica: Consultas, procedimentos, convênios
 * - TI/Software: Projetos, horas, licenças, suporte
 * - Indústria: Matéria prima, produção, MOD
 */

import PDFEngine, { fmtCurrency, fmtPercent, fmtDate, getEmpresaInfo } from './pdfEngine';

// ─── Data Loaders ────────────────────────────────────────────────
function loadData(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function loadAllData() {
  return {
    simulador: loadData('precificalc_simulador'),
    custos: loadData('precificalc_custos'),
    precificacao: loadData('precificalc_precificacao'),
    viabilidade: loadData('precificalc_viabilidade'),
    comparativo: loadData('precificalc_comparativo'),
    dre: loadData('precificalc_dre'),
    propostas: loadData('precificalc_propostas'),
    perfil: loadData('precificalc_perfil'),
    config: loadData('precificalc_config'),
  };
}

const REGIME_LABELS = {
  simples: 'Simples Nacional',
  presumido: 'Lucro Presumido',
  real: 'Lucro Real',
  mei: 'MEI',
};

// ─── 1. ANÁLISE TRIBUTÁRIA COMPLETA ─────────────────────────────
export function gerarAnalisesTributarias() {
  const data = loadAllData();
  const sim = data.simulador;
  if (!sim.regime) return null;

  const empresa = getEmpresaInfo();
  const engine = new PDFEngine({
    title: `Análise Tributária Completa`,
    subtitle: `${empresa.nome} — Estudo de Enquadramento e Impacto Fiscal`,
  });

  engine.addTitlePage({
    extraLines: [
      `Regime Atual: ${REGIME_LABELS[sim.regime] || sim.regime}`,
      `Receita Mensal: ${fmtCurrency(sim.receitaMensal)}`,
    ],
  });

  // Executive Summary
  engine.addSectionTitle('Resumo Executivo');
  
  const receitaAnual = (sim.receitaMensal || 0) * 12;
  const impostoEstimado = (sim.receitaMensal || 0) * 0.08; // rough estimate
  
  engine.addHighlightBox('Visão Geral da Carga Tributária', [
    `A empresa ${empresa.nome} opera sob o regime ${REGIME_LABELS[sim.regime] || sim.regime}.`,
    `Com faturamento mensal de ${fmtCurrency(sim.receitaMensal)}, o faturamento anual projetado é de ${fmtCurrency(receitaAnual)}.`,
    `A carga tributária estimada representa uma parcela significativa dos custos operacionais.`,
    `Esta análise detalha os parâmetros fiscais e sugere oportunidades de otimização.`,
  ], 'brand');

  // KPI Cards
  engine.addKPICards([
    { label: 'Receita Mensal', value: fmtCurrency(sim.receitaMensal), color: '#4f46e5' },
    { label: 'Receita Anual', value: fmtCurrency(receitaAnual), color: '#10b981' },
    { label: 'Regime Tributário', value: REGIME_LABELS[sim.regime] || sim.regime, color: '#8b5cf6' },
    { label: 'RBT 12 Meses', value: fmtCurrency(sim.rbt12), color: '#f59e0b' },
  ]);

  // Parameters Table
  engine.addSectionTitle('Parâmetros do Simulador');
  engine.addKeyValueTable([
    { key: 'Regime Tributário', value: REGIME_LABELS[sim.regime] || sim.regime },
    { key: 'Receita Mensal', value: fmtCurrency(sim.receitaMensal) },
    { key: 'Receita Bruta 12 meses (RBT12)', value: fmtCurrency(sim.rbt12) },
    { key: 'Anexo do Simples', value: sim.anexo || 'N/A' },
    { key: 'Tipo de Atividade', value: sim.tipoAtividade || 'N/A' },
    { key: 'Alíquota ISS (%)', value: sim.issAliquota ? fmtPercent(sim.issAliquota) : 'N/A' },
    { key: 'Folha de Pagamento Mensal', value: fmtCurrency(sim.folhaMensal) },
    { key: 'Despesas Dedutíveis', value: fmtCurrency(sim.despesasDedutiveis) },
    { key: 'Créditos PIS/COFINS', value: fmtCurrency(sim.creditosPisCofins) },
    { key: 'Despesas Operacionais', value: fmtCurrency(sim.despesasOperacionais) },
  ]);

  // Visual comparison
  engine.addSectionTitle('Composição Visual');
  const taxComponents = [
    { label: 'Receita Líquida', value: (sim.receitaMensal || 0) * 0.85, color: '#10b981' },
    { label: 'Tributos', value: (sim.receitaMensal || 0) * 0.08, color: '#ef4444' },
    { label: 'Folha + Encargos', value: sim.folhaMensal || 0, color: '#f59e0b' },
    { label: 'Desp. Operacionais', value: sim.despesasOperacionais || 0, color: '#8b5cf6' },
  ].filter(c => c.value > 0);
  
  if (taxComponents.length > 0) {
    engine.addPieChart(taxComponents, { title: 'Distribuição de Receita', currency: true });
  }

  // Alerts and Opportunities
  engine.addSectionTitle('Oportunidades de Otimização');
  
  const opportunities = [];
  if (sim.regime === 'simples' && receitaAnual > 3600000) {
    opportunities.push('Receita próxima ao sublimite do Simples Nacional — avaliar migração para Lucro Presumido.');
  }
  if (sim.regime === 'mei' && receitaAnual > 65000) {
    opportunities.push('Faturamento próximo ao limite do MEI — planejar transição para Simples Nacional.');
  }
  if (sim.folhaMensal && sim.receitaMensal && (sim.folhaMensal / sim.receitaMensal) > 0.28) {
    opportunities.push('Fator R acima de 28% — possibilidade de migrar do Anexo V para Anexo III (menor alíquota).');
  }
  if (sim.creditosPisCofins > 0) {
    opportunities.push(`Créditos de PIS/COFINS de ${fmtCurrency(sim.creditosPisCofins)} podem ser aproveitados no Lucro Real.`);
  }
  opportunities.push('Revisar periodicamente o enquadramento fiscal com base no crescimento da receita.');
  opportunities.push('Consultar contador para planejamento tributário anual.');

  engine.addNextSteps(opportunities);

  return engine;
}

// ─── 2. RELATÓRIO DE CUSTOS OPERACIONAIS ────────────────────────
export function gerarRelatorioCustos() {
  const data = loadAllData();
  const custos = data.custos;
  if (!custos.totalGeral && custos.totalGeral !== 0) return null;

  const empresa = getEmpresaInfo();
  const engine = new PDFEngine({
    title: 'Relatório de Custos Operacionais',
    subtitle: `Análise detalhada de custos — ${empresa.nome}`,
  });

  engine.addTitlePage();

  // KPIs
  engine.addSectionTitle('Indicadores de Custos');
  engine.addKPICards([
    { label: 'Custos Fixos', value: fmtCurrency(custos.totalFixos), color: '#ef4444' },
    { label: 'Custos Variáveis', value: fmtCurrency(custos.totalVariaveis), color: '#f59e0b' },
    { label: 'Folha Mensal', value: fmtCurrency(custos.custoFolha || custos.folhaMensal), color: '#8b5cf6' },
    { label: 'Total Geral', value: fmtCurrency(custos.totalGeral), color: '#4f46e5' },
  ]);

  // Executive Summary
  engine.addHighlightBox('Resumo da Estrutura de Custos', [
    `O custo operacional total da ${empresa.nome} é de ${fmtCurrency(custos.totalGeral)} por mês.`,
    `Custos fixos: ${fmtCurrency(custos.totalFixos)} | Custos variáveis: ${fmtCurrency(custos.totalVariaveis)}.`,
    `Anualmente, o custo total projetado é de ${fmtCurrency((custos.totalGeral || 0) * 12)}.`,
  ], 'brand');

  // Cost Breakdown Table
  engine.addSectionTitle('Detalhamento de Custos');
  engine.addTable(
    ['Categoria', 'Valor Mensal', 'Valor Anual', '% do Total'],
    [
      ['Custos Fixos', fmtCurrency(custos.totalFixos), fmtCurrency((custos.totalFixos || 0) * 12), 
       fmtPercent(custos.totalGeral ? ((custos.totalFixos || 0) / custos.totalGeral) * 100 : 0)],
      ['Custos Variáveis', fmtCurrency(custos.totalVariaveis), fmtCurrency((custos.totalVariaveis || 0) * 12),
       fmtPercent(custos.totalGeral ? ((custos.totalVariaveis || 0) / custos.totalGeral) * 100 : 0)],
      ['Folha + Pró-Labore', fmtCurrency(custos.custoFolha || custos.folhaMensal), fmtCurrency((custos.custoFolha || custos.folhaMensal || 0) * 12),
       fmtPercent(custos.totalGeral ? ((custos.custoFolha || custos.folhaMensal || 0) / custos.totalGeral) * 100 : 0)],
      ['TOTAL', fmtCurrency(custos.totalGeral), fmtCurrency((custos.totalGeral || 0) * 12), '100,00%'],
    ]
  );

  // Visual chart
  engine.addBarChart([
    { label: 'Fixos', value: custos.totalFixos || 0, color: '#ef4444' },
    { label: 'Variáveis', value: custos.totalVariaveis || 0, color: '#f59e0b' },
    { label: 'Folha', value: custos.custoFolha || custos.folhaMensal || 0, color: '#8b5cf6' },
  ], { title: 'Composição dos Custos', currency: true });

  // Detailed items if available
  if (custos.fixos && custos.fixos.length > 0) {
    engine.addSectionTitle('Custos Fixos Detalhados');
    engine.addTable(
      ['Item', 'Valor Mensal'],
      custos.fixos.map(item => [item.nome || item.descricao || 'Item', fmtCurrency(item.valor)])
    );
  }

  if (custos.variaveis && custos.variaveis.length > 0) {
    engine.addSectionTitle('Custos Variáveis Detalhados');
    engine.addTable(
      ['Item', 'Valor Mensal'],
      custos.variaveis.map(item => [item.nome || item.descricao || 'Item', fmtCurrency(item.valor)])
    );
  }

  // Recommendations
  engine.addNextSteps([
    'Identificar os 3 maiores custos fixos e avaliar possibilidade de renegociação.',
    'Monitorar custos variáveis em relação ao faturamento mensal.',
    'Avaliar terceirização de atividades com custo de folha elevado.',
    'Revisar contratos de fornecedores anualmente para melhores condições.',
    'Implementar controle de custos mensal com metas de redução.',
  ]);

  return engine;
}

// ─── 3. RELATÓRIO DE PRECIFICAÇÃO ───────────────────────────────
export function gerarRelatorioPrecificacao() {
  const data = loadAllData();
  const prec = data.precificacao;
  if (!prec.tipo && !prec.custoProduto) return null;

  const empresa = getEmpresaInfo();
  const engine = new PDFEngine({
    title: 'Análise de Precificação',
    subtitle: `Formação de preço de venda — ${empresa.nome}`,
  });

  engine.addTitlePage();

  // Summary
  engine.addSectionTitle('Resumo da Precificação');
  
  const custoTotal = (prec.custoProduto || 0) + (prec.despesasFixas || 0);
  const margemDecimal = (prec.margemDesejada || 30) / 100;
  const precoSugerido = custoTotal / (1 - margemDecimal - (prec.despesasVariaveisPercent || 0) / 100);
  
  engine.addKPICards([
    { label: 'Custo Base', value: fmtCurrency(prec.custoProduto), color: '#ef4444' },
    { label: 'Margem Desejada', value: fmtPercent(prec.margemDesejada || 30), color: '#10b981' },
    { label: 'Preço Sugerido', value: fmtCurrency(precoSugerido > 0 ? precoSugerido : 0), color: '#4f46e5' },
    { label: 'Tipo', value: prec.tipo === 'servico' ? 'Serviço' : 'Produto', color: '#8b5cf6' },
  ]);

  engine.addHighlightBox('Análise de Preço', [
    `O custo direto do ${prec.tipo === 'servico' ? 'serviço' : 'produto'} é de ${fmtCurrency(prec.custoProduto)}.`,
    `Considerando despesas fixas rateadas de ${fmtCurrency(prec.despesasFixas)}, despesas variáveis de ${fmtPercent(prec.despesasVariaveisPercent)}`,
    `e margem desejada de ${fmtPercent(prec.margemDesejada)}, o preço de venda sugerido é ${fmtCurrency(precoSugerido > 0 ? precoSugerido : 0)}.`,
  ], 'brand');

  // Parameters
  engine.addSectionTitle('Parâmetros de Cálculo');
  engine.addKeyValueTable([
    { key: 'Tipo', value: prec.tipo === 'servico' ? 'Serviço' : 'Produto' },
    { key: 'Custo do Produto/Serviço', value: fmtCurrency(prec.custoProduto) },
    { key: 'Despesas Fixas Rateadas', value: fmtCurrency(prec.despesasFixas) },
    { key: 'Despesas Variáveis (%)', value: fmtPercent(prec.despesasVariaveisPercent) },
    { key: 'Margem Desejada (%)', value: fmtPercent(prec.margemDesejada) },
    { key: 'Regime Tributário', value: REGIME_LABELS[prec.regime] || prec.regime || 'N/A' },
    { key: 'Quantidade Mensal', value: String(prec.quantidadeMensal || 0) },
    { key: 'Receita Mensal Projetada', value: fmtCurrency(prec.receitaMensal) },
  ]);

  // Price composition visual
  if (precoSugerido > 0) {
    engine.addPieChart([
      { label: 'Custo Direto', value: prec.custoProduto || 0, color: '#ef4444' },
      { label: 'Desp. Fixas', value: prec.despesasFixas || 0, color: '#f59e0b' },
      { label: 'Desp. Variáveis', value: precoSugerido * ((prec.despesasVariaveisPercent || 0) / 100), color: '#8b5cf6' },
      { label: 'Margem', value: precoSugerido * margemDecimal, color: '#10b981' },
    ], { title: 'Composição do Preço de Venda', currency: true });
  }

  engine.addNextSteps([
    'Validar o preço sugerido com pesquisa de mercado e concorrência.',
    'Testar preços com clientes-piloto antes de publicar tabela.',
    'Revisar margens trimestralmente conforme variação de custos.',
    'Considerar preços diferenciados por volume ou segmento de cliente.',
  ]);

  return engine;
}

// ─── 4. DRE SIMPLIFICADO ────────────────────────────────────────
export function gerarRelatorioDRE() {
  const data = loadAllData();
  const custos = data.custos;
  const sim = data.simulador;
  const dre = data.dre;
  
  if (!custos.totalGeral && !sim.receitaMensal && !dre.receitaBruta) return null;

  const empresa = getEmpresaInfo();
  const engine = new PDFEngine({
    title: 'Demonstrativo de Resultados (DRE)',
    subtitle: `Resultado financeiro simplificado — ${empresa.nome}`,
  });

  engine.addTitlePage();

  const receita = dre.receitaBruta || sim.receitaMensal || 0;
  const impostos = dre.impostosSobreVendas || receita * 0.08;
  const custoFixo = custos.totalFixos || 0;
  const custoVar = custos.totalVariaveis || 0;
  const folha = custos.custoFolha || custos.folhaMensal || dre.despPessoal || 0;
  const custoTotal = custos.totalGeral || (custoFixo + custoVar + folha);
  const lucro = receita - impostos - custoTotal;

  // KPIs
  engine.addSectionTitle('Resultado do Período');
  engine.addKPICards([
    { label: 'Receita Bruta', value: fmtCurrency(receita), color: '#10b981' },
    { label: 'Impostos', value: fmtCurrency(impostos), color: '#ef4444' },
    { label: 'Custos Totais', value: fmtCurrency(custoTotal), color: '#f59e0b' },
    { label: lucro >= 0 ? 'Lucro' : 'Prejuízo', value: fmtCurrency(Math.abs(lucro)), color: lucro >= 0 ? '#10b981' : '#ef4444' },
  ]);

  // Status highlight
  if (lucro >= 0) {
    engine.addHighlightBox('✅ Resultado Positivo', [
      `A empresa apresenta lucro de ${fmtCurrency(lucro)} (${fmtPercent((lucro / receita) * 100)} de margem líquida).`,
      `Faturamento anual projetado: ${fmtCurrency(receita * 12)} | Lucro anual: ${fmtCurrency(lucro * 12)}.`,
    ], 'success');
  } else {
    engine.addHighlightBox('⚠️ Resultado Negativo', [
      `A empresa apresenta prejuízo de ${fmtCurrency(Math.abs(lucro))} por mês.`,
      `É necessário revisar preços de venda ou reduzir custos operacionais urgentemente.`,
    ], 'danger');
  }

  // DRE Table
  engine.addSectionTitle('Demonstrativo Detalhado');
  engine.addTable(
    ['Conta', 'Valor Mensal', 'Valor Anual', '% da Receita'],
    [
      ['Receita Bruta', fmtCurrency(receita), fmtCurrency(receita * 12), '100,00%'],
      ['(-) Impostos sobre Vendas', fmtCurrency(impostos), fmtCurrency(impostos * 12),
       fmtPercent(receita ? (impostos / receita) * 100 : 0)],
      ['= Receita Líquida', fmtCurrency(receita - impostos), fmtCurrency((receita - impostos) * 12),
       fmtPercent(receita ? ((receita - impostos) / receita) * 100 : 0)],
      ['(-) Custos Fixos', fmtCurrency(custoFixo), fmtCurrency(custoFixo * 12),
       fmtPercent(receita ? (custoFixo / receita) * 100 : 0)],
      ['(-) Custos Variáveis', fmtCurrency(custoVar), fmtCurrency(custoVar * 12),
       fmtPercent(receita ? (custoVar / receita) * 100 : 0)],
      ['(-) Folha de Pagamento', fmtCurrency(folha), fmtCurrency(folha * 12),
       fmtPercent(receita ? (folha / receita) * 100 : 0)],
      ['TOTAL Resultado (Lucro/Prejuízo)', fmtCurrency(lucro), fmtCurrency(lucro * 12),
       fmtPercent(receita ? (lucro / receita) * 100 : 0)],
    ]
  );

  // Visual
  engine.addBarChart([
    { label: 'Receita', value: receita, color: '#10b981' },
    { label: 'Impostos', value: impostos, color: '#ef4444' },
    { label: 'Custos Fixos', value: custoFixo, color: '#f59e0b' },
    { label: 'Custos Var.', value: custoVar, color: '#8b5cf6' },
    { label: 'Folha', value: folha, color: '#06b6d4' },
  ], { title: 'Composição de Receitas e Despesas', currency: true });

  engine.addNextSteps([
    lucro < 0 ? 'URGENTE: Revisar precificação — o preço atual não cobre os custos.' : 'Manter monitoramento mensal do DRE para garantir consistência.',
    'Comparar resultado com meses anteriores para identificar tendências.',
    'Avaliar possibilidade de otimização tributária com o contador.',
    'Definir metas de margem líquida mínima para os próximos 6 meses.',
  ]);

  return engine;
}

// ─── 5. ANÁLISE DE VIABILIDADE ──────────────────────────────────
export function gerarRelatorioViabilidade() {
  const data = loadAllData();
  const viab = data.viabilidade;
  if (!viab.investimentoInicial && viab.investimentoInicial !== 0) return null;

  const empresa = getEmpresaInfo();
  const engine = new PDFEngine({
    title: 'Análise de Viabilidade Financeira',
    subtitle: `Estudo de ROI e Payback — ${empresa.nome}`,
  });

  engine.addTitlePage();

  const investimento = viab.investimentoInicial || 0;
  const receitaMensal = viab.receitaMensal || 0;
  const custosMensais = viab.custosMensais || 0;
  const lucroBruto = receitaMensal - custosMensais;
  const paybackMeses = lucroBruto > 0 ? Math.ceil(investimento / lucroBruto) : 0;
  const roiAnual = investimento > 0 ? ((lucroBruto * 12 - investimento) / investimento) * 100 : 0;

  engine.addSectionTitle('Indicadores de Viabilidade');
  engine.addKPICards([
    { label: 'Investimento', value: fmtCurrency(investimento), color: '#ef4444' },
    { label: 'Receita Mensal', value: fmtCurrency(receitaMensal), color: '#10b981' },
    { label: 'Payback', value: paybackMeses > 0 ? `${paybackMeses} meses` : 'N/A', color: '#4f46e5' },
    { label: 'ROI Anual', value: fmtPercent(roiAnual), color: roiAnual > 0 ? '#10b981' : '#ef4444' },
  ]);

  // Viability assessment
  const viable = lucroBruto > 0 && paybackMeses <= 36;
  engine.addHighlightBox(
    viable ? '✅ Negócio Viável' : '⚠️ Atenção Necessária',
    [
      `Investimento necessário: ${fmtCurrency(investimento)}.`,
      `Lucro bruto mensal projetado: ${fmtCurrency(lucroBruto)}.`,
      `Tempo de retorno: ${paybackMeses > 0 ? paybackMeses + ' meses' : 'Não determinado'}.`,
      `ROI no primeiro ano: ${fmtPercent(roiAnual)}.`,
      viable ? 'O projeto apresenta retorno compatível com as expectativas do mercado.' : 'Recomenda-se revisar o modelo de negócio ou reduzir o investimento inicial.',
    ],
    viable ? 'success' : 'warning'
  );

  // Projection table
  engine.addSectionTitle('Projeção de Fluxo de Caixa');
  const rows = [];
  let saldo = -investimento;
  for (let mes = 1; mes <= Math.min(paybackMeses + 6, 24); mes++) {
    saldo += lucroBruto;
    rows.push([
      `Mês ${mes}`,
      fmtCurrency(receitaMensal),
      fmtCurrency(custosMensais),
      fmtCurrency(lucroBruto),
      fmtCurrency(saldo),
    ]);
  }
  engine.addTable(
    ['Período', 'Receita', 'Custos', 'Lucro', 'Saldo Acumulado'],
    rows
  );

  engine.addNextSteps([
    'Validar premissas de receita com pesquisa de mercado.',
    'Incluir margem de segurança de 20% nos custos projetados.',
    'Considerar cenários pessimista e otimista além do base.',
    'Revisar mensalmente o real vs projetado nos primeiros 12 meses.',
  ]);

  return engine;
}

// ─── 6. PROPOSTA COMERCIAL (PDF EXECUTIVO) ──────────────────────
export function gerarPropostaComercialPDF() {
  const data = loadAllData();
  const prop = data.propostas;
  if (!prop.empresa && !prop.itens) return null;

  const empresaData = prop.empresa || {};
  const clienteData = prop.cliente || {};
  const itens = prop.itens || [];
  const desconto = prop.desconto || 0;
  const validade = prop.validade || 15;
  const condicaoPagamento = prop.condicaoPagamento || '30dias';
  const observacoes = prop.observacoes || '';

  const empresa = getEmpresaInfo();
  const nomeEmpresa = empresaData.nome || empresa.nome;

  const engine = new PDFEngine({
    title: 'Proposta Comercial',
    subtitle: `De ${nomeEmpresa} para ${clienteData.nome || 'Cliente'}`,
    empresa: { ...empresa, nome: nomeEmpresa },
  });

  engine.addTitlePage({
    extraLines: [
      `Destinatário: ${clienteData.nome || 'A definir'}`,
      clienteData.cnpj ? `CNPJ/CPF: ${clienteData.cnpj}` : '',
      `Validade: ${validade} dias`,
    ].filter(Boolean),
  });

  // Client info
  engine.addSectionTitle('Dados do Destinatário');
  engine.addKeyValueTable([
    { key: 'Razão Social', value: clienteData.nome || '___' },
    { key: 'CNPJ/CPF', value: clienteData.cnpj || '___' },
    { key: 'Contato', value: clienteData.contato || '___' },
    { key: 'E-mail', value: clienteData.email || '___' },
  ]);

  // Items table
  const subtotal = itens.reduce((s, i) => s + (i.quantidade * i.valorUnitario), 0);
  const descontoValor = subtotal * (desconto / 100);
  const totalFinal = subtotal - descontoValor;

  engine.addSectionTitle('Itens da Proposta');
  const itemRows = itens.map(item => [
    item.produto || 'Item',
    item.descricao || '',
    String(item.quantidade || 0),
    fmtCurrency(item.valorUnitario),
    fmtCurrency((item.quantidade || 0) * (item.valorUnitario || 0)),
  ]);

  if (desconto > 0) {
    itemRows.push(['', '', '', `Desconto (${desconto}%)`, `-${fmtCurrency(descontoValor)}`]);
  }
  itemRows.push(['', '', '', 'TOTAL', fmtCurrency(totalFinal)]);

  engine.addTable(
    ['Produto/Serviço', 'Descrição', 'Qtd', 'Valor Unit.', 'Total'],
    itemRows,
    {
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 50 },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'right', cellWidth: 30 },
        4: { halign: 'right', cellWidth: 35 },
      },
    }
  );

  // Summary highlight
  engine.addHighlightBox('Resumo Financeiro', [
    `Subtotal: ${fmtCurrency(subtotal)}`,
    desconto > 0 ? `Desconto: ${desconto}% (${fmtCurrency(descontoValor)})` : '',
    `Valor Total: ${fmtCurrency(totalFinal)}`,
  ].filter(Boolean), 'brand');

  // Commercial conditions
  const condLabels = { avista: 'À vista', '30dias': '30 dias', '30_60': '30/60 dias', '30_60_90': '30/60/90 dias' };
  engine.addSectionTitle('Condições Comerciais');
  engine.addKeyValueTable([
    { key: 'Condição de Pagamento', value: condLabels[condicaoPagamento] || condicaoPagamento },
    { key: 'Validade da Proposta', value: `${validade} dias` },
  ]);

  // Observations
  if (observacoes) {
    engine.addSectionTitle('Observações');
    engine.addParagraph(observacoes);
  }

  // Signatures
  engine.addSignatureArea([
    { nome: empresaData.responsavel || 'Responsável', cargo: nomeEmpresa },
    { nome: clienteData.contato || 'Cliente', cargo: clienteData.nome || 'Empresa' },
  ]);

  return engine;
}

// ─── 7. CERTIFICADO DE ANÁLISE TRIBUTÁRIA ───────────────────────
export function gerarCertificadoAnalise() {
  const data = loadAllData();
  const sim = data.simulador;
  const empresa = getEmpresaInfo();

  const engine = new PDFEngine({
    title: 'Certificado de Análise Tributária',
    subtitle: empresa.nome,
  });

  const doc = engine.doc;
  const { r, g: gColor, b } = engine.brandRgb;

  // Full cover design
  doc.setFillColor(r, gColor, b);
  doc.rect(0, 0, 210, 297, 'F');

  // Decorative elements
  const lighter = engine.brandLight;
  doc.setDrawColor(lighter.r, lighter.g, lighter.b);
  doc.setLineWidth(0.5);
  doc.rect(15, 15, 180, 267, 'S');
  doc.rect(18, 18, 174, 261, 'S');

  // Certificate content
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text('CERTIFICAMOS QUE', 105, 70, { align: 'center' });

  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(empresa.nome, 105, 95, { align: 'center' });

  if (empresa.cnpj) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`CNPJ: ${empresa.cnpj}`, 105, 108, { align: 'center' });
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const certText = `realizou Análise Tributária Completa utilizando a plataforma PrecifiCALC Enterprise, avaliando os parâmetros fiscais, regime tributário ${REGIME_LABELS[sim.regime] || 'selecionado'}, carga tributária e oportunidades de otimização fiscal.`;
  const certLines = doc.splitTextToSize(certText, 140);
  doc.text(certLines, 105, 130, { align: 'center' });

  // Details box
  doc.setFillColor(255, 255, 255, 20);
  doc.roundedRect(35, 160, 140, 50, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setTextColor(200, 200, 240);
  const details = [
    `Regime Analisado: ${REGIME_LABELS[sim.regime] || 'N/A'}`,
    `Receita Mensal: ${fmtCurrency(sim.receitaMensal)}`,
    `Faturamento Anual: ${fmtCurrency((sim.receitaMensal || 0) * 12)}`,
    `Folha de Pagamento: ${fmtCurrency(sim.folhaMensal)}`,
    `Data da Análise: ${fmtDate(new Date())}`,
  ];
  details.forEach((d, i) => {
    doc.text(d, 105, 175 + i * 8, { align: 'center' });
  });

  // ID/Serial
  const certId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 210);
  doc.text(`Certificado: ${certId}`, 105, 230, { align: 'center' });

  // Signature line
  doc.setDrawColor(200, 200, 230);
  doc.setLineWidth(0.3);
  doc.line(55, 250, 155, 250);
  doc.setFontSize(9);
  doc.setTextColor(220, 220, 240);
  doc.text('PrecifiCALC Enterprise', 105, 257, { align: 'center' });
  doc.setFontSize(7);
  doc.text('Plataforma de Análise Tributária e Precificação', 105, 262, { align: 'center' });

  // Don't add content page - certificate is single page
  return engine;
}

// ─── 8. COMPARATIVO DE REGIMES ──────────────────────────────────
export function gerarComparativoRegimesPDF() {
  const data = loadAllData();
  const comp = data.comparativo;
  const sim = data.simulador;
  
  const receitaMensal = comp.receitaMensal || sim.receitaMensal || 0;
  if (!receitaMensal) return null;

  const empresa = getEmpresaInfo();
  const engine = new PDFEngine({
    title: 'Comparativo de Regimes Tributários',
    subtitle: `Estudo comparativo para ${empresa.nome}`,
  });

  engine.addTitlePage({
    extraLines: [
      `Receita Base: ${fmtCurrency(receitaMensal)}/mês`,
    ],
  });

  engine.addSectionTitle('Cenário Analisado');
  engine.addHighlightBox('Base de Comparação', [
    `Receita mensal: ${fmtCurrency(receitaMensal)}`,
    `Receita anual: ${fmtCurrency(receitaMensal * 12)}`,
    `Este comparativo simula a carga tributária nos 4 principais regimes brasileiros.`,
  ], 'brand');

  // Simple estimates for comparison
  const simples = receitaMensal * 0.06;
  const presumido = receitaMensal * 0.1133;
  const real = receitaMensal * 0.0925;
  const meiValor = 71.60;

  const regimes = [
    { nome: 'MEI', valor: meiValor, cor: '#10b981', obs: receitaMensal * 12 > 81000 ? 'Não elegível (faturamento)' : 'Elegível' },
    { nome: 'Simples Nacional', valor: simples, cor: '#3b82f6', obs: 'Alíquota estimada' },
    { nome: 'Lucro Presumido', valor: presumido, cor: '#8b5cf6', obs: 'Presunção de serviços' },
    { nome: 'Lucro Real', valor: real, cor: '#f59e0b', obs: 'Estimado s/ créditos' },
  ];

  engine.addSectionTitle('Comparativo Visual');
  engine.addBarChart(
    regimes.map(r => ({ label: r.nome, value: r.valor, color: r.cor })),
    { title: 'Imposto Mensal por Regime', currency: true }
  );

  engine.addSectionTitle('Tabela Comparativa');
  engine.addTable(
    ['Regime', 'Imposto Mensal', 'Imposto Anual', '% da Receita', 'Observação'],
    regimes.map(r => [
      r.nome,
      fmtCurrency(r.valor),
      fmtCurrency(r.valor * 12),
      fmtPercent(receitaMensal ? (r.valor / receitaMensal) * 100 : 0),
      r.obs,
    ])
  );

  // Best regime highlight
  const melhor = [...regimes].sort((a, b) => a.valor - b.valor)[0];
  const pior = [...regimes].sort((a, b) => b.valor - a.valor)[0];
  const economia = pior.valor - melhor.valor;

  engine.addHighlightBox('💰 Melhor Opção', [
    `O regime mais econômico para este cenário é o ${melhor.nome}: ${fmtCurrency(melhor.valor)}/mês.`,
    `Comparado ao ${pior.nome} (${fmtCurrency(pior.valor)}/mês), a economia é de ${fmtCurrency(economia)}/mês ou ${fmtCurrency(economia * 12)}/ano.`,
  ], 'success');

  engine.addNextSteps([
    `Avaliar requisitos legais para enquadramento no ${melhor.nome}.`,
    'Considerar custos de obrigações acessórias de cada regime.',
    'Consultar contador para simulação detalhada com dados reais.',
    'Revisar comparativo semestralmente conforme evolução do faturamento.',
  ]);

  return engine;
}

// ─── SEGMENT-SPECIFIC TEMPLATES ─────────────────────────────────

// 9. COMÉRCIO / PADARIA
export function gerarRelatorioComercio() {
  const data = loadAllData();
  const empresa = getEmpresaInfo();
  const prec = data.precificacao;
  const custos = data.custos;

  const engine = new PDFEngine({
    title: 'Análise de Precificação — Comércio',
    subtitle: `Custos de produtos, margens e precificação — ${empresa.nome}`,
  });

  engine.addTitlePage({ extraLines: ['Segmento: Comércio / Varejo'] });

  engine.addSectionTitle('Custos de Produto e Margem');
  engine.addHighlightBox('Estratégia de Precificação para Comércio', [
    'No comércio, o preço de venda deve cobrir: custo do produto (CMV), despesas operacionais,',
    'impostos sobre venda, comissões e ainda gerar margem líquida adequada.',
    'A margem de referência para o varejo é de 30-40% sobre o preço de venda.',
  ], 'brand');

  engine.addKPICards([
    { label: 'CMV (Custo)', value: fmtCurrency(prec.custoProduto), color: '#ef4444' },
    { label: 'Margem Alvo', value: fmtPercent(prec.margemDesejada || 35), color: '#10b981' },
    { label: 'Custos Fixos', value: fmtCurrency(custos.totalFixos), color: '#f59e0b' },
    { label: 'Total Mensal', value: fmtCurrency(prec.receitaMensal), color: '#4f46e5' },
  ]);

  // Typical commerce cost structure
  engine.addSectionTitle('Estrutura de Custos Típica');
  engine.addTable(
    ['Componente', 'Descrição', 'Referência'],
    [
      ['Custo de Mercadoria (CMV)', 'Preço pago ao fornecedor', '40-60% do preço'],
      ['Frete e Logística', 'Custo de entrega e armazenamento', '3-8% do preço'],
      ['Embalagem', 'Sacolas, caixas, etiquetas', '1-3% do preço'],
      ['Comissão de Vendas', 'Comissão dos vendedores', '3-10% do preço'],
      ['Impostos', 'ICMS, PIS, COFINS, etc.', '6-18% do preço'],
      ['Despesas Operacionais', 'Aluguel, luz, funcionários', '10-20% do preço'],
      ['Margem Líquida', 'Lucro real do comerciante', '5-15% do preço'],
    ]
  );

  engine.addNextSteps([
    'Negociar melhores condições com fornecedores para reduzir CMV.',
    'Criar política de markup por categoria de produto.',
    'Implementar controle de giro de estoque (produtos parados = dinheiro parado).',
    'Analisar rentabilidade por produto para focar nos mais lucrativos.',
    'Avaliar canal online para aumentar volume sem proporcionalmente aumentar custos fixos.',
  ]);

  return engine;
}

// 10. SERVIÇOS / CONSULTORIA
export function gerarRelatorioServicos() {
  const data = loadAllData();
  const empresa = getEmpresaInfo();
  const prec = data.precificacao;

  const engine = new PDFEngine({
    title: 'Análise de Precificação — Serviços',
    subtitle: `Precificação por hora e projetos — ${empresa.nome}`,
  });

  engine.addTitlePage({ extraLines: ['Segmento: Consultoria / Prestação de Serviços'] });

  const custoHora = (prec.custoProduto || 0) / 160; // 160h/mês
  const precoHora = custoHora * 2.5;

  engine.addSectionTitle('Precificação por Hora');
  engine.addKPICards([
    { label: 'Custo/Hora', value: fmtCurrency(custoHora), color: '#ef4444' },
    { label: 'Preço/Hora Sugerido', value: fmtCurrency(precoHora), color: '#10b981' },
    { label: 'Horas/Mês', value: '160h', color: '#8b5cf6' },
    { label: 'Receita Potencial', value: fmtCurrency(precoHora * 160), color: '#4f46e5' },
  ]);

  engine.addHighlightBox('Modelo de Precificação para Serviços', [
    'Em serviços, o valor entregue importa mais que o tempo investido.',
    `Custo por hora calculado: ${fmtCurrency(custoHora)} (custos totais / 160h).`,
    `Preço sugerido: ${fmtCurrency(precoHora)} (multiplicador de 2.5x sobre custo).`,
    'Considere cobrar por projeto/valor quando o impacto no cliente for mensurável.',
  ], 'brand');

  engine.addSectionTitle('Modelos de Precificação Comparados');
  engine.addTable(
    ['Modelo', 'Vantagem', 'Desvantagem', 'Melhor Para'],
    [
      ['Por Hora', 'Simples, previsível', 'Limita ganhos', 'Suporte, manutenção'],
      ['Por Projeto', 'Previsibilidade p/ cliente', 'Risco de escopo', 'Projetos definidos'],
      ['Por Valor', 'Maior rentabilidade', 'Difícil mensurar', 'Consultoria estratégica'],
      ['Retainer (Mensalidade)', 'Receita recorrente', 'Compromisso de entrega', 'Assessoria contínua'],
    ]
  );

  engine.addNextSteps([
    'Definir catálogo de serviços com preços fixos para os mais comuns.',
    'Implementar time-tracking para medir produtividade real.',
    'Migrar clientes de hora para projetos/valor quando possível.',
    'Criar pacotes de serviços com desconto por volume.',
  ]);

  return engine;
}

// 11. SAÚDE / CLÍNICA
export function gerarRelatorioSaude() {
  const data = loadAllData();
  const empresa = getEmpresaInfo();

  const engine = new PDFEngine({
    title: 'Análise de Precificação — Saúde',
    subtitle: `Consultas, procedimentos e convênios — ${empresa.nome}`,
  });

  engine.addTitlePage({ extraLines: ['Segmento: Clínica / Consultório / Saúde'] });

  engine.addSectionTitle('Análise do Segmento Saúde');
  engine.addHighlightBox('Precificação em Saúde', [
    'A precificação na saúde envolve três pilares: consultas, procedimentos e convênios.',
    'É essencial equilibrar atendimento particular (maior margem) com convênios (maior volume).',
    'Custos fixos elevados (aluguel, equipamentos, seguros) exigem taxa de ocupação mínima.',
  ], 'brand');

  engine.addSectionTitle('Consultas e Procedimentos');
  engine.addTable(
    ['Tipo', 'Custo Estimado', 'Preço Particular', 'Preço Convênio', 'Margem Part.'],
    [
      ['Consulta Padrão', 'R$ 50', 'R$ 250-400', 'R$ 80-150', '60-80%'],
      ['Retorno', 'R$ 30', 'R$ 150-250', 'R$ 50-80', '50-70%'],
      ['Procedimento Simples', 'R$ 100', 'R$ 400-800', 'R$ 150-300', '55-75%'],
      ['Procedimento Complexo', 'R$ 300', 'R$ 1.000-3.000', 'R$ 400-1.000', '50-70%'],
      ['Exame Complementar', 'R$ 80', 'R$ 200-500', 'R$ 100-200', '50-65%'],
    ]
  );

  engine.addSectionTitle('Particular vs. Convênio');
  engine.addBarChart([
    { label: 'Particular', value: 70, color: '#10b981' },
    { label: 'Convênio A', value: 35, color: '#3b82f6' },
    { label: 'Convênio B', value: 28, color: '#8b5cf6' },
    { label: 'Convênio C', value: 22, color: '#f59e0b' },
  ], { title: 'Margem Líquida por Canal (%)', percent: true });

  engine.addNextSteps([
    'Calcular taxa de ocupação mínima para cobrir custos fixos.',
    'Renegociar tabelas com operadoras de convênio anualmente.',
    'Aumentar proporção de atendimentos particulares (marketing digital).',
    'Avaliar novos procedimentos com maior margem.',
    'Monitorar custo por atendimento mensalmente.',
  ]);

  return engine;
}

// 12. TI / SOFTWARE
export function gerarRelatorioTI() {
  const data = loadAllData();
  const empresa = getEmpresaInfo();
  const prec = data.precificacao;

  const engine = new PDFEngine({
    title: 'Análise de Precificação — TI/Software',
    subtitle: `Projetos, licenças e suporte — ${empresa.nome}`,
  });

  engine.addTitlePage({ extraLines: ['Segmento: Tecnologia da Informação / Software'] });

  engine.addSectionTitle('Modelo de Receita em TI');
  engine.addHighlightBox('Precificação de Serviços de TI', [
    'TI combina projetos (receita pontual) com recorrência (licenças, suporte, SaaS).',
    'A chave é maximizar receita recorrente para previsibilidade financeira.',
    'Margem de referência: 40-60% para software, 25-35% para serviços.',
  ], 'brand');

  engine.addSectionTitle('Componentes de Receita');
  engine.addTable(
    ['Componente', 'Modelo', 'Margem Típica', 'Recorrência'],
    [
      ['Desenvolvimento de Software', 'Projeto / Sprint', '35-50%', 'Pontual'],
      ['Licenciamento / SaaS', 'Assinatura mensal/anual', '70-90%', 'Recorrente'],
      ['Suporte Técnico', 'Mensalidade', '50-70%', 'Recorrente'],
      ['Consultoria Técnica', 'Hora / Projeto', '40-60%', 'Pontual'],
      ['Infraestrutura / Cloud', 'Revenda + gestão', '20-35%', 'Recorrente'],
      ['Treinamentos', 'Por turma / aluno', '60-80%', 'Eventual'],
    ]
  );

  engine.addPieChart([
    { label: 'Projetos', value: 40, color: '#4f46e5' },
    { label: 'SaaS / Licenças', value: 30, color: '#10b981' },
    { label: 'Suporte', value: 20, color: '#f59e0b' },
    { label: 'Consultoria', value: 10, color: '#8b5cf6' },
  ], { title: 'Mix de Receita Ideal' });

  engine.addSectionTitle('Cálculo de Valor-Hora para TI');
  const custoDevHora = 80;
  const precoDevHora = 200;
  engine.addKPICards([
    { label: 'Custo/Hora Dev', value: `R$ ${custoDevHora}`, color: '#ef4444' },
    { label: 'Preço/Hora', value: `R$ ${precoDevHora}`, color: '#10b981' },
    { label: 'Margem', value: `${((1 - custoDevHora/precoDevHora) * 100).toFixed(0)}%`, color: '#4f46e5' },
    { label: 'Sprint (2 sem)', value: fmtCurrency(precoDevHora * 160), color: '#8b5cf6' },
  ]);

  engine.addNextSteps([
    'Migrar 60%+ da receita para modelos recorrentes (SaaS, suporte).',
    'Precificar projetos por valor entregue, não por hora trabalhada.',
    'Criar tiers de suporte (básico, premium, enterprise) com margens crescentes.',
    'Automatizar processos para reduzir custo-hora e aumentar margem.',
    'Revisar pricing a cada 6 meses conforme evolução do mercado.',
  ]);

  return engine;
}

// ─── REGISTRY: All available PDF generators ─────────────────────
export const PDF_GENERATORS = {
  tributario: {
    label: 'Análise Tributária Completa',
    icon: '📊',
    description: 'Relatório executivo com parâmetros fiscais, gráficos e recomendações',
    generator: gerarAnalisesTributarias,
    requiresData: 'precificalc_simulador',
  },
  custos: {
    label: 'Relatório de Custos Operacionais',
    icon: '💰',
    description: 'Detalhamento de custos fixos, variáveis e folha de pagamento',
    generator: gerarRelatorioCustos,
    requiresData: 'precificalc_custos',
  },
  precificacao: {
    label: 'Análise de Precificação',
    icon: '🏷️',
    description: 'Formação de preço com margens, custos e composição visual',
    generator: gerarRelatorioPrecificacao,
    requiresData: 'precificalc_precificacao',
  },
  dre: {
    label: 'DRE Simplificado',
    icon: '📈',
    description: 'Demonstrativo de resultados com receitas, custos e lucro',
    generator: gerarRelatorioDRE,
    requiresData: 'precificalc_custos',
  },
  viabilidade: {
    label: 'Análise de Viabilidade',
    icon: '🎯',
    description: 'ROI, payback e projeção de fluxo de caixa',
    generator: gerarRelatorioViabilidade,
    requiresData: 'precificalc_viabilidade',
  },
  comparativo: {
    label: 'Comparativo de Regimes',
    icon: '⚖️',
    description: 'Comparação visual entre MEI, Simples, Presumido e Real',
    generator: gerarComparativoRegimesPDF,
    requiresData: 'precificalc_simulador',
  },
  proposta: {
    label: 'Proposta Comercial',
    icon: '📝',
    description: 'Proposta profissional para enviar a clientes',
    generator: gerarPropostaComercialPDF,
    requiresData: 'precificalc_propostas',
  },
  certificado: {
    label: 'Certificado de Análise',
    icon: '🏅',
    description: 'Certificado visual de análise tributária completa',
    generator: gerarCertificadoAnalise,
    requiresData: 'precificalc_simulador',
  },
  comercio: {
    label: 'Template: Comércio/Padaria',
    icon: '🏪',
    description: 'Custos de produtos, margens, precificação para varejo',
    generator: gerarRelatorioComercio,
    segment: true,
  },
  servicos: {
    label: 'Template: Consultoria/Serviços',
    icon: '💼',
    description: 'Precificação por hora, projetos e modelos de cobrança',
    generator: gerarRelatorioServicos,
    segment: true,
  },
  saude: {
    label: 'Template: Clínica/Saúde',
    icon: '🏥',
    description: 'Consultas, procedimentos, convênios vs particular',
    generator: gerarRelatorioSaude,
    segment: true,
  },
  ti: {
    label: 'Template: TI/Software',
    icon: '💻',
    description: 'Projetos, licenças, SaaS, horas e suporte',
    generator: gerarRelatorioTI,
    segment: true,
  },
};

export default PDF_GENERATORS;
