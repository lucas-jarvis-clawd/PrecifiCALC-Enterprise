// ============================================================
// BANCO DE DADOS TRIBUTÁRIO BRASILEIRO - COMPLETO
// Atualizado para 2024/2025
// ============================================================

// --- SIMPLES NACIONAL ---
export const simplesNacional = {
  limiteAnual: 4800000,
  anexos: {
    I: {
      nome: 'Anexo I - Comércio',
      descricao: 'Comércio em geral',
      faixas: [
        { de: 0, ate: 180000, aliquota: 0.04, deducao: 0 },
        { de: 180000.01, ate: 360000, aliquota: 0.073, deducao: 5940 },
        { de: 360000.01, ate: 720000, aliquota: 0.095, deducao: 13860 },
        { de: 720000.01, ate: 1800000, aliquota: 0.107, deducao: 22500 },
        { de: 1800000.01, ate: 3600000, aliquota: 0.143, deducao: 87300 },
        { de: 3600000.01, ate: 4800000, aliquota: 0.19, deducao: 378000 },
      ],
      distribuicao: {
        // % da alíquota efetiva destinada a cada imposto (faixa 1 como referência)
        IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1286, PIS: 0.0279, CPP: 0.4170, ICMS: 0.34,
      }
    },
    II: {
      nome: 'Anexo II - Indústria',
      descricao: 'Indústria em geral',
      faixas: [
        { de: 0, ate: 180000, aliquota: 0.045, deducao: 0 },
        { de: 180000.01, ate: 360000, aliquota: 0.078, deducao: 5940 },
        { de: 360000.01, ate: 720000, aliquota: 0.10, deducao: 13860 },
        { de: 720000.01, ate: 1800000, aliquota: 0.112, deducao: 22500 },
        { de: 1800000.01, ate: 3600000, aliquota: 0.147, deducao: 85500 },
        { de: 3600000.01, ate: 4800000, aliquota: 0.30, deducao: 720000 },
      ],
      distribuicao: {
        IRPJ: 0.055, CSLL: 0.035, COFINS: 0.1286, PIS: 0.0279, CPP: 0.4170, IPI: 0.05, ICMS: 0.32,
      }
    },
    III: {
      nome: 'Anexo III - Serviços',
      descricao: 'Serviços diversos (contabilidade, advocacia, medicina, etc.)',
      faixas: [
        { de: 0, ate: 180000, aliquota: 0.06, deducao: 0 },
        { de: 180000.01, ate: 360000, aliquota: 0.112, deducao: 9360 },
        { de: 360000.01, ate: 720000, aliquota: 0.135, deducao: 17640 },
        { de: 720000.01, ate: 1800000, aliquota: 0.16, deducao: 35640 },
        { de: 1800000.01, ate: 3600000, aliquota: 0.21, deducao: 125640 },
        { de: 3600000.01, ate: 4800000, aliquota: 0.33, deducao: 648000 },
      ],
      distribuicao: {
        IRPJ: 0.04, CSLL: 0.035, COFINS: 0.1282, PIS: 0.0278, CPP: 0.4340, ISS: 0.335,
      }
    },
    IV: {
      nome: 'Anexo IV - Serviços',
      descricao: 'Limpeza, vigilância, obras, construção civil',
      faixas: [
        { de: 0, ate: 180000, aliquota: 0.045, deducao: 0 },
        { de: 180000.01, ate: 360000, aliquota: 0.09, deducao: 8100 },
        { de: 360000.01, ate: 720000, aliquota: 0.102, deducao: 12420 },
        { de: 720000.01, ate: 1800000, aliquota: 0.14, deducao: 39780 },
        { de: 1800000.01, ate: 3600000, aliquota: 0.22, deducao: 183780 },
        { de: 3600000.01, ate: 4800000, aliquota: 0.33, deducao: 828000 },
      ],
      distribuicao: {
        IRPJ: 0.1850, CSLL: 0.15, COFINS: 0.2050, PIS: 0.0450, ISS: 0.415,
      },
      observacao: 'CPP não incluso - recolhido à parte via GPS (20% sobre folha)'
    },
    V: {
      nome: 'Anexo V - Serviços',
      descricao: 'TI, engenharia, publicidade, auditoria, jornalismo',
      faixas: [
        { de: 0, ate: 180000, aliquota: 0.155, deducao: 0 },
        { de: 180000.01, ate: 360000, aliquota: 0.18, deducao: 4500 },
        { de: 360000.01, ate: 720000, aliquota: 0.195, deducao: 9900 },
        { de: 720000.01, ate: 1800000, aliquota: 0.205, deducao: 17100 },
        { de: 1800000.01, ate: 3600000, aliquota: 0.23, deducao: 62100 },
        { de: 3600000.01, ate: 4800000, aliquota: 0.305, deducao: 540000 },
      ],
      distribuicao: {
        IRPJ: 0.14, CSLL: 0.12, COFINS: 0.1282, PIS: 0.0278, CPP: 0.2850, ISS: 0.14,
      },
      observacao: 'Fator R ≥ 28% pode migrar para Anexo III (alíquotas menores)'
    },
  },
};

// Cálculo da alíquota efetiva do Simples Nacional
export function calcSimplesTax(receitaBruta12m, anexo) {
  const faixas = simplesNacional.anexos[anexo]?.faixas;
  if (!faixas) return null;

  if (receitaBruta12m > simplesNacional.limiteAnual) {
    return { excedeLimite: true, aliquotaEfetiva: 0, valorMensal: 0 };
  }

  const faixa = faixas.find(f => receitaBruta12m >= f.de && receitaBruta12m <= f.ate);
  if (!faixa) return null;

  const aliquotaEfetiva = (receitaBruta12m * faixa.aliquota - faixa.deducao) / receitaBruta12m;
  const receitaMensal = receitaBruta12m / 12;
  const valorMensal = receitaMensal * aliquotaEfetiva;

  return {
    faixa: faixas.indexOf(faixa) + 1,
    aliquotaNominal: faixa.aliquota,
    deducao: faixa.deducao,
    aliquotaEfetiva,
    receitaMensal,
    valorMensal,
    valorAnual: valorMensal * 12,
  };
}

// --- MEI ---
export const mei = {
  limiteAnual: 81000,
  limiteMensal: 6750,
  das: {
    inss: 75.60, // 5% do salário mínimo (R$ 1.412 em 2024 -> 70.60, 2025 -> 75.60 estimado)
    issServicos: 5.00,
    icmsComercio: 1.00,
  },
  atividades: {
    comercio: { das: 76.60, descricao: 'Comércio e Indústria (INSS + ICMS)' },
    servicos: { das: 80.60, descricao: 'Prestação de Serviços (INSS + ISS)' },
    misto: { das: 81.60, descricao: 'Comércio + Serviços (INSS + ICMS + ISS)' },
  },
};

export function calcMEI(receitaMensal, atividade = 'servicos') {
  const receitaAnual = receitaMensal * 12;
  if (receitaAnual > mei.limiteAnual) {
    return { excedeLimite: true, dasFixo: 0, aliquotaEfetiva: 0 };
  }
  const dasFixo = mei.atividades[atividade]?.das || mei.atividades.servicos.das;
  return {
    dasFixo,
    dasAnual: dasFixo * 12,
    aliquotaEfetiva: dasFixo / receitaMensal,
    receitaMensal,
    receitaAnual,
  };
}

// --- LUCRO PRESUMIDO ---
export const lucroPresumido = {
  presuncao: {
    servicos: { irpj: 0.32, csll: 0.32 },
    comercio: { irpj: 0.08, csll: 0.12 },
    industria: { irpj: 0.08, csll: 0.12 },
    transporteCarga: { irpj: 0.08, csll: 0.12 },
    transportePassageiros: { irpj: 0.16, csll: 0.12 },
    servHospitalares: { irpj: 0.08, csll: 0.12 },
    revendaCombustiveis: { irpj: 0.016, csll: 0.12 },
  },
  irpj: {
    aliquota: 0.15,
    adicional: 0.10,
    limiteAdicionalMensal: 20000,
  },
  csll: { aliquota: 0.09 },
  pis: { aliquota: 0.0065 }, // cumulativo
  cofins: { aliquota: 0.03 }, // cumulativo
};

export function calcLucroPresumido(receitaMensal, tipoAtividade = 'servicos', issAliquota = 0.05) {
  const presuncao = lucroPresumido.presuncao[tipoAtividade] || lucroPresumido.presuncao.servicos;
  const receitaTrimestral = receitaMensal * 3;
  const receitaAnual = receitaMensal * 12;

  // Base de cálculo
  const baseIRPJ = receitaTrimestral * presuncao.irpj;
  const baseCSLL = receitaTrimestral * presuncao.csll;

  // IRPJ
  let irpjTrimestral = baseIRPJ * lucroPresumido.irpj.aliquota;
  const limiteAdicionalTrimestral = lucroPresumido.irpj.limiteAdicionalMensal * 3;
  if (baseIRPJ > limiteAdicionalTrimestral) {
    irpjTrimestral += (baseIRPJ - limiteAdicionalTrimestral) * lucroPresumido.irpj.adicional;
  }

  // CSLL
  const csllTrimestral = baseCSLL * lucroPresumido.csll.aliquota;

  // PIS e COFINS (mensal)
  const pisMensal = receitaMensal * lucroPresumido.pis.aliquota;
  const cofinsMensal = receitaMensal * lucroPresumido.cofins.aliquota;

  // ISS
  const issMensal = receitaMensal * issAliquota;

  const totalMensal = (irpjTrimestral / 3) + (csllTrimestral / 3) + pisMensal + cofinsMensal + issMensal;

  return {
    irpj: { baseTrimestral: baseIRPJ, valorTrimestral: irpjTrimestral, valorMensal: irpjTrimestral / 3 },
    csll: { baseTrimestral: baseCSLL, valorTrimestral: csllTrimestral, valorMensal: csllTrimestral / 3 },
    pis: { valorMensal: pisMensal },
    cofins: { valorMensal: cofinsMensal },
    iss: { aliquota: issAliquota, valorMensal: issMensal },
    totalMensal,
    totalAnual: totalMensal * 12,
    aliquotaEfetiva: totalMensal / receitaMensal,
    receitaMensal,
  };
}

// --- LUCRO REAL ---
export const lucroReal = {
  irpj: {
    aliquota: 0.15,
    adicional: 0.10,
    limiteAdicionalMensal: 20000,
  },
  csll: { aliquota: 0.09 },
  pis: { aliquota: 0.0165 }, // não-cumulativo
  cofins: { aliquota: 0.076 }, // não-cumulativo
};

export function calcLucroReal(receitaMensal, despesasDedutiveis, creditosPisCofins = 0, issAliquota = 0.05) {
  const lucroMensal = receitaMensal - despesasDedutiveis;
  const lucroTrimestral = lucroMensal * 3;

  // IRPJ sobre lucro real
  let irpjTrimestral = Math.max(0, lucroTrimestral * lucroReal.irpj.aliquota);
  const limiteAdicionalTrimestral = lucroReal.irpj.limiteAdicionalMensal * 3;
  if (lucroTrimestral > limiteAdicionalTrimestral) {
    irpjTrimestral += (lucroTrimestral - limiteAdicionalTrimestral) * lucroReal.irpj.adicional;
  }

  // CSLL sobre lucro real
  const csllTrimestral = Math.max(0, lucroTrimestral * lucroReal.csll.aliquota);

  // PIS e COFINS não-cumulativo (com créditos)
  const pisBruto = receitaMensal * lucroReal.pis.aliquota;
  const cofinsBruto = receitaMensal * lucroReal.cofins.aliquota;
  const pisMensal = Math.max(0, pisBruto - (creditosPisCofins * lucroReal.pis.aliquota));
  const cofinsMensal = Math.max(0, cofinsBruto - (creditosPisCofins * lucroReal.cofins.aliquota));

  // ISS
  const issMensal = receitaMensal * issAliquota;

  const totalMensal = (irpjTrimestral / 3) + (csllTrimestral / 3) + pisMensal + cofinsMensal + issMensal;

  return {
    lucroMensal,
    irpj: { valorTrimestral: irpjTrimestral, valorMensal: irpjTrimestral / 3 },
    csll: { valorTrimestral: csllTrimestral, valorMensal: csllTrimestral / 3 },
    pis: { bruto: pisBruto, creditos: creditosPisCofins * lucroReal.pis.aliquota, valorMensal: pisMensal },
    cofins: { bruto: cofinsBruto, creditos: creditosPisCofins * lucroReal.cofins.aliquota, valorMensal: cofinsMensal },
    iss: { aliquota: issAliquota, valorMensal: issMensal },
    totalMensal,
    totalAnual: totalMensal * 12,
    aliquotaEfetiva: receitaMensal > 0 ? totalMensal / receitaMensal : 0,
    receitaMensal,
  };
}

// --- ENCARGOS TRABALHISTAS ---
export const encargosTrabalhistas = {
  clt: {
    inss_patronal: 0.20,
    rat: 0.03, // varia de 1% a 3%
    sistemaS: 0.058, // SESI/SENAI/SEBRAE etc
    fgts: 0.08,
    provisao13: 1 / 12,
    provisaoFerias: 1 / 12 + (1 / 12) / 3, // férias + 1/3
    provisaoMultaFGTS: 0.04, // 40% sobre FGTS (estimativa de turnover)
  },
  proLabore: {
    inss: 0.11, // teto: R$ 908,85 em 2024
    tetoInss: 908.85,
    inssPatronal: 0.20, // se Lucro Presumido/Real
  },
};

export function calcEncargoCLT(salarioBruto) {
  const enc = encargosTrabalhistas.clt;
  const inssPatronal = salarioBruto * enc.inss_patronal;
  const rat = salarioBruto * enc.rat;
  const sistemaS = salarioBruto * enc.sistemaS;
  const fgts = salarioBruto * enc.fgts;
  const prov13 = salarioBruto * enc.provisao13;
  const provFerias = salarioBruto * enc.provisaoFerias;
  const multaFGTS = fgts * 0.5 * 0.10; // estimativa

  const totalEncargos = inssPatronal + rat + sistemaS + fgts + prov13 + provFerias + multaFGTS;
  const custoTotal = salarioBruto + totalEncargos;
  const multiplicador = custoTotal / salarioBruto;

  return {
    salarioBruto,
    inssPatronal,
    rat,
    sistemaS,
    fgts,
    prov13,
    provFerias,
    multaFGTS,
    totalEncargos,
    custoTotal,
    multiplicador,
    percentualEncargos: totalEncargos / salarioBruto,
  };
}

// --- CUSTOS PADRÃO DE ESCRITÓRIO CONTÁBIL ---
export const custosDefaultContabilidade = {
  fixos: [
    { id: 'aluguel', nome: 'Aluguel + Condomínio', valor: 3000, categoria: 'Infraestrutura' },
    { id: 'energia', nome: 'Energia Elétrica', valor: 500, categoria: 'Infraestrutura' },
    { id: 'internet', nome: 'Internet + Telefone', valor: 300, categoria: 'Infraestrutura' },
    { id: 'contabil_sw', nome: 'Software Contábil (Domínio/Fortes/etc)', valor: 800, categoria: 'Tecnologia' },
    { id: 'certificado', nome: 'Certificados Digitais (rateio mensal)', valor: 150, categoria: 'Tecnologia' },
    { id: 'erp', nome: 'ERP / Gestão Interna', valor: 200, categoria: 'Tecnologia' },
    { id: 'seguro', nome: 'Seguro RC Profissional', valor: 250, categoria: 'Operacional' },
    { id: 'contabilidade', nome: 'Contador (própria contabilidade)', valor: 500, categoria: 'Operacional' },
    { id: 'material', nome: 'Material de Escritório', valor: 200, categoria: 'Operacional' },
    { id: 'marketing', nome: 'Marketing / Site / Redes', valor: 500, categoria: 'Comercial' },
    { id: 'crc', nome: 'Anuidade CRC + Associações', valor: 100, categoria: 'Regulatório' },
    { id: 'treinamento', nome: 'Capacitação / Cursos', valor: 300, categoria: 'Pessoal' },
  ],
  variavelPorCliente: [
    { id: 'certif_cliente', nome: 'Certificado Digital do Cliente', valor: 15, categoria: 'Tecnologia' },
    { id: 'impressao', nome: 'Impressão / Papel / Envio', valor: 10, categoria: 'Operacional' },
    { id: 'horas', nome: 'Horas técnicas por cliente (média)', valor: 0, categoria: 'Mão de Obra', tipo: 'horas', horasPadrao: 8 },
  ],
};

// --- SERVIÇOS PADRÃO CONTÁBEIS ---
export const servicosContabeis = [
  {
    id: 'abertura',
    nome: 'Abertura de Empresa',
    descricao: 'Constituição societária completa',
    tipo: 'pontual',
    horasEstimadas: 12,
    complexidade: 'media',
  },
  {
    id: 'contabil_mensal',
    nome: 'Escrituração Contábil Mensal',
    descricao: 'Classificação, conciliação, balancete',
    tipo: 'recorrente',
    horasEstimadas: 6,
    complexidade: 'media',
  },
  {
    id: 'fiscal_mensal',
    nome: 'Escrituração Fiscal Mensal',
    descricao: 'Apuração de impostos, SPED, declarações',
    tipo: 'recorrente',
    horasEstimadas: 8,
    complexidade: 'alta',
  },
  {
    id: 'folha',
    nome: 'Folha de Pagamento',
    descricao: 'Processamento mensal de folha',
    tipo: 'recorrente',
    horasEstimadas: 4,
    complexidade: 'media',
    porFuncionario: true,
  },
  {
    id: 'irpf',
    nome: 'Declaração IRPF',
    descricao: 'Imposto de Renda Pessoa Física',
    tipo: 'pontual',
    horasEstimadas: 4,
    complexidade: 'media',
  },
  {
    id: 'planejamento',
    nome: 'Planejamento Tributário',
    descricao: 'Análise e escolha do melhor regime',
    tipo: 'pontual',
    horasEstimadas: 16,
    complexidade: 'alta',
  },
  {
    id: 'consultoria',
    nome: 'Consultoria Contábil/Tributária',
    descricao: 'Consultoria sob demanda (hora)',
    tipo: 'avulso',
    horasEstimadas: 1,
    complexidade: 'variavel',
  },
  {
    id: 'balanco',
    nome: 'Balanço Patrimonial Anual',
    descricao: 'Fechamento contábil e demonstrações',
    tipo: 'pontual',
    horasEstimadas: 20,
    complexidade: 'alta',
  },
];

// --- HELPERS ---
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPercent(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
