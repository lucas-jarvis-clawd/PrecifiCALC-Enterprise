// ============================================================
// BANCO DE DADOS TRIBUTÁRIO BRASILEIRO - COMPLETO E ATUALIZADO
// Versão 3.0 - Atualizado para 2026
// Auditoria: Especialista Tributário Senior (CRC + 10 anos)
// Data: 03/02/2026
// Atualizado conforme Lei 14.973/2024, salário mínimo 2026
// ============================================================

// ==============================================
// CONSTANTES E VALORES ATUALIZADOS 2026
// ==============================================

export const constantesTributarias2026 = {
  salarioMinimo: 1621.00, // 2026
  tetoINSS: 8475.55, // 2026
  faixasINSS: [
    { de: 0, ate: 1621.00, aliquota: 0.075 },
    { de: 1621.01, ate: 2902.84, aliquota: 0.09 },
    { de: 2902.85, ate: 4354.27, aliquota: 0.12 },
    { de: 4354.28, ate: 8475.55, aliquota: 0.14 }
  ],
  valorMeiInss: 81.05, // 5% do salário mínimo 2026 (R$ 1.621)
  limiteMEI: 81000,
  limiteMEICaminhoneiro: 251600,
  limiteSimples: 4800000
};

// ==============================================
// MEI - MICROEMPREENDEDOR INDIVIDUAL
// ==============================================

export const mei = {
  limiteAnual: 81000,
  limiteMensal: 6750,
  limiteAnualCaminhoneiro: 251600,
  limiteMensalCaminhoneiro: 20966.67,
  
  das: {
    inss: 81.05, // 5% do salário mínimo 2026 (R$ 1.621)
    issServicos: 5.00,
    icmsComercio: 1.00,
  },

  atividades: {
    comercio: {
      das: 82.05, // 81.05 + 1.00 ICMS
      descricao: 'Comércio e Indústria (INSS + ICMS)',
      tributos: ['INSS', 'ICMS']
    },
    servicos: {
      das: 86.05, // 81.05 + 5.00 ISS
      descricao: 'Prestação de Serviços (INSS + ISS)',
      tributos: ['INSS', 'ISS']
    },
    misto: {
      das: 87.05, // 81.05 + 1.00 ICMS + 5.00 ISS
      descricao: 'Comércio + Serviços (INSS + ICMS + ISS)',
      tributos: ['INSS', 'ICMS', 'ISS']
    },
    caminhoneiro: {
      das: 195.52, // 12% de R$ 1.621 = R$ 194.52 + R$ 1.00 ICMS
      descricao: 'MEI Caminhoneiro (INSS + ICMS)',
      tributos: ['INSS', 'ICMS'],
      observacao: 'Limite especial de R$ 251.600/ano'
    }
  },

  atividadesProibidas: [
    'Bancos e financeiras',
    'Factoring',
    'Administração de consórcios',
    'Corretagem de valores',
    'Advocacia',
    'Medicina veterinária',
    'Engenharia',
    'Arquitetura',
    'Psicologia',
    'Fisioterapia',
    'Medicina',
    'Odontologia'
  ],

  impedimentos: [
    'Participar como sócio de outra empresa',
    'Exercer atividade em desacordo com o CNAE',
    'Ter funcionário (exceto 1 funcionário)',
    'Faturar acima do limite anual'
  ]
};

export function calcMEI(receitaMensal, atividade = 'servicos', isCaminhoneiro = false) {
  const limite = isCaminhoneiro ? mei.limiteAnualCaminhoneiro : mei.limiteAnual;
  const tipoAtividade = isCaminhoneiro ? 'caminhoneiro' : atividade;
  const receitaAnual = receitaMensal * 12;

  if (!mei.atividades[tipoAtividade]) {
    return {
      erro: true,
      observacao: `Tipo de atividade "${tipoAtividade}" não reconhecido para MEI`,
    };
  }

  if (receitaAnual > limite) {
    return { 
      excedeLimite: true, 
      dasFixo: 0, 
      aliquotaEfetiva: 0,
      proximoRegime: 'Simples Nacional',
      observacao: `Receita Bruta (Faturamento) de R$ ${receitaAnual.toLocaleString('pt-BR')} excede o limite do MEI de R$ ${limite.toLocaleString('pt-BR')}/ano`
    };
  }
  
  const dasFixo = mei.atividades[tipoAtividade]?.das || mei.atividades.servicos.das;
  
  return {
    dasFixo,
    dasAnual: dasFixo * 12,
    aliquotaEfetiva: dasFixo / receitaMensal,
    receitaMensal,
    receitaAnual,
    tipoMei: isCaminhoneiro ? 'MEI Caminhoneiro' : 'MEI Tradicional',
    proximaRevisao: receitaAnual > (limite * 0.8) ? 'Atenção: próximo ao limite de faturamento.' : null
  };
}

// ==============================================
// SIMPLES NACIONAL - EXPANDIDO E ATUALIZADO
// ==============================================

export const simplesNacional = {
  limiteAnual: 4800000,
  limiteMensal: 400000,
  
  anexos: {
    I: {
      nome: 'Anexo I - Comércio',
      descricao: 'Comércio em geral, indústria com receita de revenda > 80%',
      faixas: [
        { de: 0, ate: 180000, aliquota: 0.04, deducao: 0 },
        { de: 180000.01, ate: 360000, aliquota: 0.073, deducao: 5940 },
        { de: 360000.01, ate: 720000, aliquota: 0.095, deducao: 13860 },
        { de: 720000.01, ate: 1800000, aliquota: 0.107, deducao: 22500 },
        { de: 1800000.01, ate: 3600000, aliquota: 0.143, deducao: 87300 },
        { de: 3600000.01, ate: 4800000, aliquota: 0.19, deducao: 378000 },
      ],
      // LC 123/2006, Anexo I - Distribuição por faixa (LC 155/2016)
      distribuicaoPorFaixa: [
        { IRPJ: 0.0550, CSLL: 0.0350, COFINS: 0.1274, PIS: 0.0276, CPP: 0.4150, ICMS: 0.3400 },
        { IRPJ: 0.0550, CSLL: 0.0350, COFINS: 0.1274, PIS: 0.0276, CPP: 0.4150, ICMS: 0.3400 },
        { IRPJ: 0.0550, CSLL: 0.0350, COFINS: 0.1274, PIS: 0.0276, CPP: 0.4200, ICMS: 0.3350 },
        { IRPJ: 0.0550, CSLL: 0.0350, COFINS: 0.1274, PIS: 0.0276, CPP: 0.4200, ICMS: 0.3350 },
        { IRPJ: 0.0550, CSLL: 0.0350, COFINS: 0.1274, PIS: 0.0276, CPP: 0.4200, ICMS: 0.3350 },
        { IRPJ: 0.1350, CSLL: 0.1000, COFINS: 0.2827, PIS: 0.0613, CPP: 0.4210 },
      ],
      atividadesPrincipais: ['Comércio varejista', 'Comércio atacadista', 'Indústria com revenda predominante']
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
      // LC 123/2006, Anexo II - Distribuição por faixa (LC 155/2016)
      distribuicaoPorFaixa: [
        { IRPJ: 0.0550, CSLL: 0.0350, COFINS: 0.1151, PIS: 0.0249, CPP: 0.3750, IPI: 0.0750, ICMS: 0.3200 },
        { IRPJ: 0.0550, CSLL: 0.0350, COFINS: 0.1151, PIS: 0.0249, CPP: 0.3750, IPI: 0.0750, ICMS: 0.3200 },
        { IRPJ: 0.0550, CSLL: 0.0350, COFINS: 0.1151, PIS: 0.0249, CPP: 0.3750, IPI: 0.0750, ICMS: 0.3200 },
        { IRPJ: 0.0550, CSLL: 0.0350, COFINS: 0.1151, PIS: 0.0249, CPP: 0.3750, IPI: 0.0750, ICMS: 0.3200 },
        { IRPJ: 0.0550, CSLL: 0.0350, COFINS: 0.1151, PIS: 0.0249, CPP: 0.3750, IPI: 0.0750, ICMS: 0.3200 },
        { IRPJ: 0.0850, CSLL: 0.0750, COFINS: 0.2096, PIS: 0.0454, CPP: 0.2350, IPI: 0.3500 },
      ],
      atividadesPrincipais: ['Fabricação em geral', 'Produção industrial', 'Beneficiamento']
    },
    
    III: {
      nome: 'Anexo III - Serviços',
      descricao: 'Locação de bens móveis, serviços diversos sem retenção de ISS',
      faixas: [
        { de: 0, ate: 180000, aliquota: 0.06, deducao: 0 },
        { de: 180000.01, ate: 360000, aliquota: 0.112, deducao: 9360 },
        { de: 360000.01, ate: 720000, aliquota: 0.135, deducao: 17640 },
        { de: 720000.01, ate: 1800000, aliquota: 0.16, deducao: 35640 },
        { de: 1800000.01, ate: 3600000, aliquota: 0.21, deducao: 125640 },
        { de: 3600000.01, ate: 4800000, aliquota: 0.33, deducao: 648000 },
      ],
      // LC 123/2006, Anexo III - Distribuição por faixa (LC 155/2016)
      distribuicaoPorFaixa: [
        { IRPJ: 0.0400, CSLL: 0.0350, COFINS: 0.1282, PIS: 0.0278, CPP: 0.4340, ISS: 0.3350 },
        { IRPJ: 0.0400, CSLL: 0.0350, COFINS: 0.1405, PIS: 0.0305, CPP: 0.4340, ISS: 0.3200 },
        { IRPJ: 0.0400, CSLL: 0.0350, COFINS: 0.1364, PIS: 0.0296, CPP: 0.4340, ISS: 0.3250 },
        { IRPJ: 0.0400, CSLL: 0.0350, COFINS: 0.1364, PIS: 0.0296, CPP: 0.4340, ISS: 0.3250 },
        { IRPJ: 0.0400, CSLL: 0.0350, COFINS: 0.1282, PIS: 0.0278, CPP: 0.4340, ISS: 0.3350 },
        { IRPJ: 0.3500, CSLL: 0.1500, COFINS: 0.1603, PIS: 0.0347, CPP: 0.3050 },
      ],
      atividadesPrincipais: ['Locação de bens móveis', 'Serviços diversos'],
      condicaoFatorR: 'Fator R ≥ 28% da receita bruta (folha de pagamento)'
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
      // LC 123/2006, Anexo IV - Distribuição por faixa (LC 155/2016)
      distribuicaoPorFaixa: [
        { IRPJ: 0.1880, CSLL: 0.1520, COFINS: 0.1767, PIS: 0.0383, ISS: 0.4450 },
        { IRPJ: 0.1980, CSLL: 0.1520, COFINS: 0.2055, PIS: 0.0445, ISS: 0.4000 },
        { IRPJ: 0.2080, CSLL: 0.1520, COFINS: 0.1973, PIS: 0.0427, ISS: 0.4000 },
        { IRPJ: 0.1780, CSLL: 0.1920, COFINS: 0.1890, PIS: 0.0410, ISS: 0.4000 },
        { IRPJ: 0.1880, CSLL: 0.1920, COFINS: 0.1808, PIS: 0.0392, ISS: 0.4000 },
        { IRPJ: 0.5350, CSLL: 0.2150, COFINS: 0.2055, PIS: 0.0445 },
      ],
      observacao: 'CPP não incluso - recolhido à parte via GPS (20% sobre folha)',
      atividadesPrincipais: ['Construção civil', 'Limpeza', 'Vigilância', 'Obras']
    },
    
    V: {
      nome: 'Anexo V - Serviços',
      descricao: 'Serviços intelectuais: TI, engenharia, publicidade, auditoria',
      faixas: [
        { de: 0, ate: 180000, aliquota: 0.155, deducao: 0 },
        { de: 180000.01, ate: 360000, aliquota: 0.18, deducao: 4500 },
        { de: 360000.01, ate: 720000, aliquota: 0.195, deducao: 9900 },
        { de: 720000.01, ate: 1800000, aliquota: 0.205, deducao: 17100 },
        { de: 1800000.01, ate: 3600000, aliquota: 0.23, deducao: 62100 },
        { de: 3600000.01, ate: 4800000, aliquota: 0.305, deducao: 540000 },
      ],
      // LC 123/2006, Anexo V - Distribuição por faixa (LC 155/2016)
      distribuicaoPorFaixa: [
        { IRPJ: 0.2500, CSLL: 0.1500, COFINS: 0.1410, PIS: 0.0305, CPP: 0.2885, ISS: 0.1400 },
        { IRPJ: 0.2300, CSLL: 0.1500, COFINS: 0.1410, PIS: 0.0305, CPP: 0.2785, ISS: 0.1700 },
        { IRPJ: 0.2400, CSLL: 0.1500, COFINS: 0.1492, PIS: 0.0323, CPP: 0.2385, ISS: 0.1900 },
        { IRPJ: 0.2100, CSLL: 0.1500, COFINS: 0.1574, PIS: 0.0341, CPP: 0.2385, ISS: 0.2100 },
        { IRPJ: 0.2300, CSLL: 0.1250, COFINS: 0.1410, PIS: 0.0305, CPP: 0.2385, ISS: 0.2350 },
        { IRPJ: 0.3500, CSLL: 0.1550, COFINS: 0.1644, PIS: 0.0356, CPP: 0.2950 },
      ],
      observacao: 'Fator R ≥ 28% pode migrar para Anexo III (alíquotas menores)',
      atividadesPrincipais: ['TI e software', 'Engenharia', 'Publicidade', 'Auditoria', 'Consultoria'],
      condicaoFatorR: 'Fator R < 28% da receita bruta (folha de pagamento)'
    },
  },

  impedimentos: [
    'Participação de pessoa jurídica no capital social',
    'Sócio domiciliado no exterior',
    'Capital social superior a R$ 48.000.000',
    'Atividades de bancos, factoring, administração de consórcios',
    'Cooperativas de crédito',
    'Loteamento e incorporação de imóveis'
  ],

  obrigacoes: [
    'DEFIS (Declaração de Informações Socioeconômicas e Fiscais)',
    'PGDAS-D (DAS)',
    'Livro Caixa (para alguns casos)',
    'Relatório Mensal das Receitas Brutas'
  ]
};

export function calcSimplesTax(receitaBruta12m, anexo, fatorR = null) {
  const faixas = simplesNacional.anexos[anexo]?.faixas;
  if (!faixas) return { erro: 'Anexo inválido' };

  if (receitaBruta12m > simplesNacional.limiteAnual) {
    return { 
      excedeLimite: true, 
      aliquotaEfetiva: 0, 
      valorMensal: 0,
      proximoRegime: 'Lucro Presumido ou Real',
      observacao: `Receita Bruta (Faturamento) de R$ ${receitaBruta12m.toLocaleString('pt-BR')} excede o limite do Simples Nacional de R$ 4.800.000/ano`
    };
  }

  // Verificação do Fator R para Anexo V
  if (anexo === 'V' && fatorR !== null) {
    if (fatorR >= 0.28) {
      return {
        migracao: true,
        anexoRecomendado: 'III',
        observacao: 'Fator R ≥ 28% - Migração obrigatória para Anexo III',
        fatorR
      };
    }
  }

  const faixa = faixas.find(f => receitaBruta12m >= f.de && receitaBruta12m <= f.ate);
  if (!faixa) return { erro: 'Faixa não encontrada' };

  const faixaIndex = faixas.indexOf(faixa);
  const aliquotaEfetiva = (receitaBruta12m * faixa.aliquota - faixa.deducao) / receitaBruta12m;
  const receitaMensal = receitaBruta12m / 12;
  const valorMensal = receitaMensal * aliquotaEfetiva;

  return {
    faixa: faixaIndex + 1,
    anexo,
    aliquotaNominal: faixa.aliquota,
    deducao: faixa.deducao,
    aliquotaEfetiva,
    receitaMensal,
    valorMensal,
    valorAnual: valorMensal * 12,
    distribuicaoTributos: simplesNacional.anexos[anexo].distribuicaoPorFaixa[faixaIndex],
    proximaFaixa: faixas[faixaIndex + 1] || null,
    fatorR
  };
}

// ==============================================
// CPRB - CONTRIBUIÇÃO PREVIDENCIÁRIA SOBRE RECEITA BRUTA
// ==============================================

export const cprb = {
  // Lei 12.546/2011 - Desoneração da folha
  // Lei 14.973/2024 - Reoneração gradual da folha de pagamento:
  //   2025: 80% CPRB + 5% CPP folha
  //   2026: 60% CPRB + 10% CPP folha
  //   2027: 40% CPRB + 15% CPP folha
  //   2028+: 0% CPRB + 20% CPP folha (extinto)

  reoneracaoGradual: {
    2025: { fatorCPRB: 0.80, cppFolha: 0.05 },
    2026: { fatorCPRB: 0.60, cppFolha: 0.10 },
    2027: { fatorCPRB: 0.40, cppFolha: 0.15 },
    2028: { fatorCPRB: 0.00, cppFolha: 0.20 },
  },

  atividades: {
    ti: { aliquota: 0.045, efetivo2026: 0.045 * 0.60, descricao: 'Tecnologia da Informação' },
    call_center: { aliquota: 0.02, efetivo2026: 0.02 * 0.60, descricao: 'Call Center' },
    projeto_circuito: { aliquota: 0.02, efetivo2026: 0.02 * 0.60, descricao: 'Projeto de circuitos integrados' },
    industria_calcados: { aliquota: 0.015, efetivo2026: 0.015 * 0.60, descricao: 'Indústria de calçados' },
    industria_textil: { aliquota: 0.015, efetivo2026: 0.015 * 0.60, descricao: 'Indústria têxtil' },
    industria_confeccao: { aliquota: 0.015, efetivo2026: 0.015 * 0.60, descricao: 'Indústria de confecção' },
    industria_couro: { aliquota: 0.015, efetivo2026: 0.015 * 0.60, descricao: 'Indústria de couro' },
    construcao_naval: { aliquota: 0.02, efetivo2026: 0.02 * 0.60, descricao: 'Construção naval' },
    construcao_obra: { aliquota: 0.02, efetivo2026: 0.02 * 0.60, descricao: 'Construção de obras' },
    servicos_ti: { aliquota: 0.045, efetivo2026: 0.045 * 0.60, descricao: 'Serviços de TI' },
    comunicacao: { aliquota: 0.02, efetivo2026: 0.02 * 0.60, descricao: 'Comunicação' },
    hoteis: { aliquota: 0.02, efetivo2026: 0.02 * 0.60, descricao: 'Hotéis' }
  },

  calcular(receitaBruta, tipoAtividade, folhaMensal = 0) {
    const atividade = this.atividades[tipoAtividade];
    if (!atividade) {
      return { erro: 'Atividade não encontrada para CPRB' };
    }

    // Lei 14.973/2024: em 2026, aplica fator de 60% sobre a CPRB + 10% CPP sobre folha
    const fator2026 = this.reoneracaoGradual[2026];
    const aliquotaEfetiva = atividade.aliquota * fator2026.fatorCPRB;
    const valorCPRB = receitaBruta * aliquotaEfetiva;
    const valorCPPFolha = folhaMensal * fator2026.cppFolha;

    return {
      baseCalculo: receitaBruta,
      aliquotaOriginal: atividade.aliquota,
      aliquotaEfetiva,
      fatorReoneracao: fator2026.fatorCPRB,
      valorCPRB,
      valorCPPFolha,
      valorTotal: valorCPRB + valorCPPFolha,
      descricao: atividade.descricao,
      observacao: 'Lei 14.973/2024: 2026 = 60% CPRB + 10% CPP folha (reoneração gradual)'
    };
  }
};

// ==============================================
// IRRF - IMPOSTO DE RENDA RETIDO NA FONTE
// ==============================================

export const irrf = {
  servicos: {
    // IRRF - Imposto de Renda Retido na Fonte (Decreto 9.580/2018, Art. 714)
    '1.5%': {
      atividades: ['Limpeza', 'Conservação', 'Manutenção', 'Segurança', 'Vigilância', 'Advocacia', 'Engenharia', 'Arquitetura', 'Auditoria', 'Consultoria', 'Medicina', 'Odontologia', 'Psicologia', 'Fisioterapia'],
      aliquota: 0.015,
      tipo: 'IRRF',
      base_legal: 'Decreto 9.580/2018, Art. 714'
    }
  },

  // CSRF - Contribuições Sociais Retidas na Fonte (Lei 10.833/2003, Art. 30)
  // CSLL (1%) + PIS (0,65%) + COFINS (3%) = 4,65% — retida SEPARADAMENTE do IRRF
  csrf: {
    aliquota: 0.0465,
    csll: 0.01,
    pis: 0.0065,
    cofins: 0.03,
    base_legal: 'Lei 10.833/2003, Art. 30',
    dispensaAte: 5000, // Dispensada para pagamentos até R$ 5.000 (IN RFB 1.234/2012)
  },

  pessoaFisica: {
    // Tabela progressiva mensal 2026 (Lei 15.270/2025)
    faixas: [
      { de: 0, ate: 2259.20, aliquota: 0, deducao: 0 },
      { de: 2259.21, ate: 2826.65, aliquota: 0.075, deducao: 169.44 },
      { de: 2826.66, ate: 3751.05, aliquota: 0.15, deducao: 381.44 },
      { de: 3751.06, ate: 4664.68, aliquota: 0.225, deducao: 662.77 },
      { de: 4664.69, ate: 999999999, aliquota: 0.275, deducao: 896.00 }
    ],
    dependentes: 189.59,
    // Lei 15.270/2025 - Sistema de redução progressiva
    // Renda até R$ 5.000: imposto ZERO (isenção total)
    // Renda R$ 5.000,01 a R$ 7.350: redução parcial via fórmula
    // Renda acima R$ 7.350: tabela normal sem redução
    reducaoLei15270: {
      limiteIsencao: 5000.00,
      limiteFaseout: 7350.00,
      valorBase: 978.62,
      fator: 0.133145
    }
  },

  calcularServicos(valorServico, tipoServico) {
    // IRRF para serviços PJ: alíquota de 1,5% (Decreto 9.580/2018, Art. 714)
    const aliquotaIRRF = 0.015;
    const valorRetidoIRRF = valorServico * aliquotaIRRF;

    // CSRF (4,65%) aplicada separadamente quando pagamento > R$ 5.000
    const aplicaCsrf = valorServico > this.csrf.dispensaAte;
    const valorRetidoCsrf = aplicaCsrf ? valorServico * this.csrf.aliquota : 0;

    return {
      valorServico,
      irrf: { aliquota: aliquotaIRRF, valor: valorRetidoIRRF },
      csrf: { aliquota: aplicaCsrf ? this.csrf.aliquota : 0, valor: valorRetidoCsrf, aplicada: aplicaCsrf },
      totalRetido: valorRetidoIRRF + valorRetidoCsrf,
      valorLiquido: valorServico - valorRetidoIRRF - valorRetidoCsrf,
      tipoServico,
      base_legal: 'IRRF: Decreto 9.580/2018, Art. 714 | CSRF: Lei 10.833/2003, Art. 30',
      observacao: 'IRRF e CSRF são retenções distintas com vencimentos diferentes'
    };
  },

  calcularPF(rendimento, numDependentes = 0) {
    const deducaoDependentes = numDependentes * this.pessoaFisica.dependentes;
    const baseCalculo = Math.max(0, rendimento - deducaoDependentes);

    const faixa = this.pessoaFisica.faixas.find(f =>
      baseCalculo >= f.de && baseCalculo <= f.ate
    );

    if (!faixa) return { erro: 'Faixa não encontrada' };

    let irDevido = Math.max(0, (baseCalculo * faixa.aliquota) - faixa.deducao);

    // Lei 15.270/2025 - Redução progressiva (vigente a partir de 01/01/2026)
    const red = this.pessoaFisica.reducaoLei15270;
    if (baseCalculo <= red.limiteIsencao) {
      irDevido = 0;
    } else if (baseCalculo <= red.limiteFaseout) {
      const desconto = red.valorBase - (red.fator * baseCalculo);
      irDevido = Math.max(0, irDevido - Math.max(0, desconto));
    }

    return {
      rendimento,
      deducaoDependentes,
      baseCalculo,
      faixaUtilizada: this.pessoaFisica.faixas.indexOf(faixa) + 1,
      aliquota: faixa.aliquota,
      deducaoFaixa: faixa.deducao,
      irDevido,
      aliquotaEfetiva: rendimento > 0 ? irDevido / rendimento : 0,
      aliquotaEfetivaSobreBase: baseCalculo > 0 ? irDevido / baseCalculo : 0,
      leiAplicada: 'Lei 15.270/2025'
    };
  }
};

export function calcRetencoes(valorServico, tipoServico = 'servicos_pj') {
  // IRRF: 1.5% (Decreto 9.580/2018, Art. 714)
  const irrfAliquota = 0.015;
  const irrfValor = valorServico * irrfAliquota;

  // CSRF: 4.65% (Lei 10.833/2003, Art. 30) - dispensada até R$ 5.000
  const csrfAplicavel = valorServico > 5000;
  const csllRetido = csrfAplicavel ? valorServico * 0.01 : 0;
  const pisRetido = csrfAplicavel ? valorServico * 0.0065 : 0;
  const cofinsRetido = csrfAplicavel ? valorServico * 0.03 : 0;
  const csrfTotal = csllRetido + pisRetido + cofinsRetido;

  // ISS retido (quando serviço prestado fora do município do prestador)
  // Alíquota depende do município - usar 5% como padrão
  const issRetido = valorServico * 0.05;

  const totalRetencoes = irrfValor + csrfTotal + issRetido;

  return {
    valorBruto: valorServico,
    retencoes: {
      irrf: { aliquota: irrfAliquota, valor: irrfValor, baseLegal: 'Decreto 9.580/2018, Art. 714' },
      csrf: {
        aplicavel: csrfAplicavel,
        csll: csllRetido,
        pis: pisRetido,
        cofins: cofinsRetido,
        total: csrfTotal,
        baseLegal: 'Lei 10.833/2003, Art. 30'
      },
      issRetido: { valor: issRetido, baseLegal: 'LC 116/2003' },
    },
    totalRetencoes,
    valorLiquido: valorServico - totalRetencoes,
    observacao: !csrfAplicavel ? 'CSRF dispensada para pagamentos até R$ 5.000 (IN RFB 1.234/2012)' : null,
  };
}

// ==============================================
// SUBSTITUIÇÃO TRIBUTÁRIA
// ==============================================

export const substituicaoTributaria = {
  produtos: {
    combustiveis: {
      gasolina: { mva: 0.46, aliquotaInterna: 0.17 },
      etanol: { mva: 0.64, aliquotaInterna: 0.13 },
      diesel: { mva: 0.21, aliquotaInterna: 0.12 }
    },
    
    cigarros: {
      nacional: { mva: 1.15, aliquotaInterna: 0.25 },
      importado: { mva: 1.35, aliquotaInterna: 0.25 }
    },
    
    bebidas: {
      cerveja: { mva: 0.35, aliquotaInterna: 0.17 },
      refrigerante: { mva: 0.42, aliquotaInterna: 0.17 },
      agua: { mva: 0.30, aliquotaInterna: 0.12 }
    },
    
    medicamentos: {
      generico: { mva: 0.36, aliquotaInterna: 0.18 },
      referencia: { mva: 0.36, aliquotaInterna: 0.18 },
      similar: { mva: 0.36, aliquotaInterna: 0.18 }
    },

    automotivo: {
      automovel: { mva: 0.40, aliquotaInterna: 0.12 },
      motocicleta: { mva: 0.35, aliquotaInterna: 0.17 },
      pneumatico: { mva: 0.30, aliquotaInterna: 0.17 }
    },

    eletronicos: {
      smartphone: { mva: 0.415, aliquotaInterna: 0.17 },
      computador: { mva: 0.30, aliquotaInterna: 0.17 },
      televisor: { mva: 0.35, aliquotaInterna: 0.17 }
    }
  },

  calcular(valorVenda, produto, categoria, estadoDestino = 'SP') {
    const config = this.produtos[categoria]?.[produto];
    if (!config) {
      return { erro: 'Produto não encontrado na tabela ST' };
    }

    const valorBase = valorVenda;
    const valorComMVA = valorBase * (1 + config.mva);
    const icmsNormal = valorBase * config.aliquotaInterna;
    const icmsST = (valorComMVA * config.aliquotaInterna) - icmsNormal;

    return {
      produto,
      categoria,
      valorBase,
      mva: config.mva,
      valorComMVA,
      aliquotaInterna: config.aliquotaInterna,
      icmsNormal,
      icmsST,
      icmsTotal: icmsNormal + icmsST,
      estadoDestino,
      observacao: 'Valores sujeitos a alteração conforme convênios ICMS'
    };
  }
};

// ==============================================
// ICMS INTERESTADUAL E DIFAL
// ==============================================

export const icmsInterestadual = {
  // Alíquotas interestaduais (CONFAZ - Convênios ICMS)
  sul_sudeste_para_sul_sudeste: 0.12,  // SP, RJ, MG, PR, SC, RS → SP, RJ, MG, PR, SC, RS
  sul_sudeste_para_norte_nordeste_co_es: 0.07, // SP, RJ, MG, PR, SC, RS → N, NE, CO, ES
  demais_para_qualquer: 0.12, // N, NE, CO, ES → qualquer estado
  importados: 0.04, // Produtos importados (Resolução SF 13/2012)

  estadosSulSudeste: ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS'],

  getAliquotaInterestadual(ufOrigem, ufDestino) {
    if (ufOrigem === ufDestino) return null; // Operação interna
    const isSulSudesteOrigem = this.estadosSulSudeste.includes(ufOrigem);
    const isSulSudesteDestino = this.estadosSulSudeste.includes(ufDestino);
    if (isSulSudesteOrigem && isSulSudesteDestino) return this.sul_sudeste_para_sul_sudeste;
    if (isSulSudesteOrigem && !isSulSudesteDestino) return this.sul_sudeste_para_norte_nordeste_co_es;
    return this.demais_para_qualquer;
  }
};

// Alíquotas internas de ICMS por estado (2026)
export const icmsInternoPorEstado = {
  AC: 0.19, AL: 0.19, AM: 0.20, AP: 0.18, BA: 0.205,
  CE: 0.20, DF: 0.20, ES: 0.17, GO: 0.19, MA: 0.22,
  MG: 0.18, MS: 0.17, MT: 0.17, PA: 0.19, PB: 0.20,
  PE: 0.205, PI: 0.21, PR: 0.195, RJ: 0.22, RN: 0.20,
  RO: 0.195, RR: 0.20, RS: 0.17, SC: 0.17, SE: 0.19,
  SP: 0.18, TO: 0.20,
};

export function calcDIFAL(valorOperacao, ufOrigem, ufDestino) {
  if (ufOrigem === ufDestino) return { aplicavel: false, motivo: 'Operação interna' };

  const aliqInterestadual = icmsInterestadual.getAliquotaInterestadual(ufOrigem, ufDestino);
  const aliqInterna = icmsInternoPorEstado[ufDestino] || 0.18;

  const icmsOrigem = valorOperacao * aliqInterestadual;
  const icmsDestino = valorOperacao * aliqInterna;
  const difal = Math.max(0, icmsDestino - icmsOrigem);

  return {
    aplicavel: true,
    valorOperacao,
    ufOrigem,
    ufDestino,
    aliquotaInterestadual: aliqInterestadual,
    aliquotaInterna: aliqInterna,
    icmsOrigem,
    difal,
    // EC 87/2015 + LC 190/2022: desde 2019, 100% do DIFAL vai para o destino
    partidaDestino: difal,
    baseLegal: 'EC 87/2015, LC 190/2022'
  };
}

// ==============================================
// PIS/COFINS MONOFÁSICO
// ==============================================

export const produtosMonofasicos = {
  descricao: 'Produtos com tributação monofásica de PIS/COFINS - revendedores não pagam PIS/COFINS',
  baseLegal: 'Lei 10.147/2000, Lei 10.485/2002, Lei 10.865/2004',
  categorias: [
    { nome: 'Combustíveis e lubrificantes', exemplos: ['Gasolina', 'Diesel', 'Etanol', 'GLP', 'Óleos lubrificantes'] },
    { nome: 'Medicamentos e perfumaria', exemplos: ['Medicamentos', 'Cosméticos', 'Produtos de higiene pessoal'] },
    { nome: 'Veículos e autopeças', exemplos: ['Veículos automotores', 'Autopeças', 'Pneus'] },
    { nome: 'Bebidas frias', exemplos: ['Água mineral', 'Refrigerante', 'Cerveja', 'Energéticos'] },
    { nome: 'Máquinas e equipamentos', exemplos: ['Máquinas agrícolas', 'Equipamentos industriais'] },
  ],
  verificarMonofasico(categoriaProduto) {
    return this.categorias.some(c =>
      c.nome.toLowerCase().includes(categoriaProduto.toLowerCase()) ||
      c.exemplos.some(e => e.toLowerCase().includes(categoriaProduto.toLowerCase()))
    );
  },
};

// ==============================================
// LUCRO PRESUMIDO - EXPANDIDO
// ==============================================

export const lucroPresumido = {
  presuncao: {
    servicos: { irpj: 0.32, csll: 0.32, descricao: 'Serviços em geral' },
    comercio: { irpj: 0.08, csll: 0.12, descricao: 'Comércio e indústria' },
    industria: { irpj: 0.08, csll: 0.12, descricao: 'Atividade industrial' },
    transporteCarga: { irpj: 0.08, csll: 0.12, descricao: 'Transporte de carga' },
    transportePassageiros: { irpj: 0.16, csll: 0.12, descricao: 'Transporte de passageiros' },
    servHospitalares: { irpj: 0.08, csll: 0.12, descricao: 'Serviços hospitalares (sociedade empresária com ANVISA - Lei 11.727/2008)', alerta: 'Presunção de 8% válida APENAS para sociedade empresária com registro ANVISA. PF e sociedade simples usam 32%.' },
    revendaCombustiveis: { irpj: 0.016, csll: 0.12, descricao: 'Revenda de combustíveis' },
    intermediacaoNegocios: { irpj: 0.32, csll: 0.32, descricao: 'Intermediação de negócios' },
    administracaoBens: { irpj: 0.32, csll: 0.32, descricao: 'Administração de bens' },
    locacaoMoveis: { irpj: 0.32, csll: 0.32, descricao: 'Locação de bens móveis' },
    construcaoCivil: { irpj: 0.32, csll: 0.32, descricao: 'Construção civil (serviços)' },
    // Factoring: NÃO pode optar pelo Lucro Presumido (Lei 9.718/1998, Art. 14, VI) - obrigatório Lucro Real
  },
  
  irpj: {
    aliquota: 0.15,
    adicional: 0.10,
    limiteAdicionalMensal: 20000,
  },
  
  csll: { 
    aliquota: 0.09,
    // Alíquotas diferenciadas por atividade (Lei 7.689/1988, alterada por Lei 13.169/2015)
    aliquotasEspeciais: {
      instituicoesFinanceiras: 0.15,
      seguradoras: 0.15,
      entidadesPrevidencia: 0.15
    }
  },
  
  pis: { aliquota: 0.0065 }, // cumulativo
  cofins: { aliquota: 0.03 }, // cumulativo
  
  // CPRB - quando aplicável (substitui contrib. patronal)
  aplicaCPRB: false,

  impedimentos: [
    'Receita bruta anual superior a R$ 78.000.000',
    'Atividades de bancos comerciais, de investimento e de desenvolvimento',
    'Caixas econômicas, sociedades de crédito',
    'Empresas de arrendamento mercantil',
    'Factoring (obrigatório Lucro Real - Lei 9.718/98, Art. 14, VI)',
    'Seguradoras e entidades de previdência privada',
    'Empresas imobiliárias (quando compra para revenda)'
  ]
};

export function calcLucroPresumido(receitaMensal, tipoAtividade = 'servicos', issAliquota = 0.05, temCPRB = false) {
  const presuncaoOriginal = lucroPresumido.presuncao[tipoAtividade] || lucroPresumido.presuncao.servicos;
  const receitaTrimestral = receitaMensal * 3;
  const receitaAnual = receitaMensal * 12;

  // Verifica limite
  if (receitaAnual > 78000000) {
    return {
      erro: 'Receita excede limite para Lucro Presumido',
      receitaAnual,
      proximoRegime: 'Lucro Real obrigatório'
    };
  }

  const presuncao = presuncaoOriginal;

  // Base de cálculo
  const baseIRPJ = receitaTrimestral * presuncao.irpj;
  const baseCSLL = receitaTrimestral * presuncao.csll;

  // IRPJ
  let irpjTrimestral = baseIRPJ * lucroPresumido.irpj.aliquota;
  const limiteAdicionalTrimestral = lucroPresumido.irpj.limiteAdicionalMensal * 3;
  if (baseIRPJ > limiteAdicionalTrimestral) {
    irpjTrimestral += (baseIRPJ - limiteAdicionalTrimestral) * lucroPresumido.irpj.adicional;
  }

  // CSLL - verifica se é atividade com alíquota especial
  let aliquotaCSLL = lucroPresumido.csll.aliquota;
  if (lucroPresumido.csll.aliquotasEspeciais[tipoAtividade]) {
    aliquotaCSLL = lucroPresumido.csll.aliquotasEspeciais[tipoAtividade];
  }
  const csllTrimestral = baseCSLL * aliquotaCSLL;

  // PIS e COFINS (mensal)
  const pisMensal = receitaMensal * lucroPresumido.pis.aliquota;
  const cofinsMensal = receitaMensal * lucroPresumido.cofins.aliquota;

  // ISS
  // ISS somente para serviços (LC 116/2003) - comércio/indústria pagam ICMS, não ISS
  const isServico = ['servicos', 'servHospitalares', 'intermediacaoNegocios', 'administracaoBens', 'locacaoMoveis', 'construcaoCivil'].includes(tipoAtividade);
  const issMensal = isServico ? receitaMensal * issAliquota : 0;

  // CPRB (se aplicável - substitui contrib. patronal)
  // Lei 14.973/2024: em 2026, aplica fator de 60% sobre a alíquota CPRB
  let cprbValor = 0;
  if (temCPRB && cprb.atividades && cprb.atividades[tipoAtividade]) {
    cprbValor = receitaMensal * cprb.atividades[tipoAtividade].efetivo2026;
  }

  const totalMensal = (irpjTrimestral / 3) + (csllTrimestral / 3) + pisMensal + cofinsMensal + issMensal + cprbValor;

  return {
    regime: 'Lucro Presumido',
    tipoAtividade,
    presuncao,
    irpj: { 
      baseTrimestral: baseIRPJ, 
      valorTrimestral: irpjTrimestral, 
      valorMensal: irpjTrimestral / 3,
      temAdicional: baseIRPJ > limiteAdicionalTrimestral
    },
    csll: { 
      baseTrimestral: baseCSLL, 
      valorTrimestral: csllTrimestral, 
      valorMensal: csllTrimestral / 3,
      aliquotaUtilizada: aliquotaCSLL
    },
    pis: { valorMensal: pisMensal },
    cofins: { valorMensal: cofinsMensal },
    iss: { aliquota: issAliquota, valorMensal: issMensal },
    cprb: { valorMensal: cprbValor },
    totalMensal,
    totalAnual: totalMensal * 12,
    aliquotaEfetiva: totalMensal / receitaMensal,
    receitaMensal,
    proximaRevisao: receitaAnual > 60000000 ? 'Atenção: próximo ao limite de faturamento.' : null
  };
}

// ==============================================
// LUCRO REAL - EXPANDIDO E ATUALIZADO
// ==============================================

export const lucroReal = {
  irpj: {
    aliquota: 0.15,
    adicional: 0.10,
    limiteAdicionalMensal: 20000,
    limiteAdicionalTrimestral: 60000
  },
  
  csll: { 
    aliquota: 0.09,
    aliquotasEspeciais: {
      instituicoesFinanceiras: 0.20, // Bancos - Lei 7.689/1989 (verificar prorrogações anuais)
      seguradoras: 0.15,
      factoring: 0.15,
      cooperativasCredito: 0.15
    }
  },
  
  pis: { 
    aliquota: 0.0165, // não-cumulativo
    isento: ['vendas para exterior', 'vendas para zona franca']
  },
  
  cofins: {
    aliquota: 0.076, // não-cumulativo (7,6%)
    isento: ['vendas para exterior', 'vendas para zona franca']
  },

  obrigatoriedade: {
    receitaBrutaAnual: 78000000, // Acima deste valor é obrigatório
    atividades: [
      'Bancos comerciais, de investimento e desenvolvimento',
      'Caixas econômicas',
      'Sociedades de crédito, financiamento e investimento',
      'Sociedades de arrendamento mercantil',
      'Seguradoras',
      'Entidades de previdência privada aberta',
      'Empresas de factoring'
    ]
  },

  adicionesLalur: [
    'Multas de trânsito e infrações em geral',
    'Provisão para férias e 13º (exceto se pago até março)',
    'Resultado negativo de equivalência patrimonial',
    'Perdas de créditos não dedutíveis',
    'Despesas com alimentação de sócios',
    'Despesas não comprovadas',
    'Excesso de juros sobre capital próprio',
    'Depreciação acelerada não aceita fiscalmente'
  ],

  exclusoesLalur: [
    'Resultado positivo de equivalência patrimonial',
    'Reversão de provisões tributadas',
    'Dividendos recebidos de investimentos no país',
    'Receita de juros sobre capital próprio',
    'Depreciação acelerada autorizada',
    'Lucros de controladas no exterior (regime de transparência)'
  ],

  incentivosFiscais: [
    'Atividade de exportação',
    'Programa de Alimentação do Trabalhador (PAT)',
    'Programa Nacional de Apoio à Atenção da Saúde da Pessoa com Deficiência (PRONAS/PCD)',
    'Programa Nacional de Apoio à Atenção Oncológica (PRONON)',
    'Doações aos Fundos dos Direitos da Criança e do Adolescente',
    'Atividade audiovisual brasileira',
    'Atividade desportiva',
    'Atividade cultural'
  ]
};

export function calcLucroReal(receitaMensal, despesasDedutiveis, creditosPisCofins = 0, issAliquota = 0.05, adicoesLalur = 0, exclusoesLalur = 0, tipoAtividade = 'geral') {
  const lucroContabil = receitaMensal - despesasDedutiveis;
  const lucroTributavel = lucroContabil + adicoesLalur - exclusoesLalur;
  const lucroTrimestral = lucroTributavel * 3;

  // IRPJ sobre lucro tributável
  let irpjTrimestral = Math.max(0, lucroTrimestral * lucroReal.irpj.aliquota);
  if (lucroTrimestral > lucroReal.irpj.limiteAdicionalTrimestral) {
    irpjTrimestral += (lucroTrimestral - lucroReal.irpj.limiteAdicionalTrimestral) * lucroReal.irpj.adicional;
  }

  // CSLL - verifica alíquota especial
  let aliquotaCSLL = lucroReal.csll.aliquota;
  if (lucroReal.csll.aliquotasEspeciais[tipoAtividade]) {
    aliquotaCSLL = lucroReal.csll.aliquotasEspeciais[tipoAtividade];
  }
  const csllTrimestral = Math.max(0, lucroTrimestral * aliquotaCSLL);

  // PIS e COFINS não-cumulativo (com créditos)
  const pisBruto = receitaMensal * lucroReal.pis.aliquota;
  const cofinsBruto = receitaMensal * lucroReal.cofins.aliquota;
  const creditoPis = creditosPisCofins * lucroReal.pis.aliquota;
  const creditoCofins = creditosPisCofins * lucroReal.cofins.aliquota;
  const pisMensal = Math.max(0, pisBruto - creditoPis);
  const cofinsMensal = Math.max(0, cofinsBruto - creditoCofins);

  // ISS somente para serviços (LC 116/2003) - comércio/indústria pagam ICMS, não ISS
  const isServico = !['comercio', 'industria', 'transporteCarga', 'revendaCombustiveis'].includes(tipoAtividade);
  const issMensal = isServico ? receitaMensal * issAliquota : 0;

  const totalMensal = (irpjTrimestral / 3) + (csllTrimestral / 3) + pisMensal + cofinsMensal + issMensal;

  return {
    regime: 'Lucro Real',
    tipoAtividade,
    lucroContabil,
    adicoesLalur,
    exclusoesLalur,
    lucroMensal: lucroTributavel,
    lucroTrimestral,
    irpj: {
      baseTrimestral: lucroTrimestral,
      valorTrimestral: irpjTrimestral,
      valorMensal: irpjTrimestral / 3,
      temAdicional: lucroTrimestral > lucroReal.irpj.limiteAdicionalTrimestral
    },
    csll: {
      baseTrimestral: lucroTrimestral,
      valorTrimestral: csllTrimestral,
      valorMensal: csllTrimestral / 3,
      aliquotaUtilizada: aliquotaCSLL
    },
    pis: {
      bruto: pisBruto,
      creditos: creditoPis,
      valorMensal: pisMensal
    },
    cofins: {
      bruto: cofinsBruto,
      creditos: creditoCofins,
      valorMensal: cofinsMensal
    },
    iss: {
      aliquota: issAliquota,
      valorMensal: issMensal
    },
    totalMensal,
    totalAnual: totalMensal * 12,
    aliquotaEfetiva: receitaMensal > 0 ? totalMensal / receitaMensal : 0,
    receitaMensal,
    observacoes: lucroTributavel < 0 ? 'Prejuízo fiscal - pode compensar em exercícios futuros' : null
  };
}

// ==============================================
// ISS - IMPOSTO SOBRE SERVIÇOS POR MUNICÍPIO
// ==============================================

export const issData = {
  aliquotasMinMaxNacional: { min: 0.02, max: 0.05 },
  
  municipiosPopulares: {
    'São Paulo/SP': { aliquota: 0.05, obs: 'Padrão 5% (2% apenas para TI e setores específicos - Lei 13.701/2003)' },
    'Rio de Janeiro/RJ': { aliquota: 0.05, obs: 'Alíquota máxima' },
    'Brasília/DF': { aliquota: 0.05, obs: 'Alíquota máxima' },
    'Salvador/BA': { aliquota: 0.05, obs: 'Alíquota máxima' },
    'Fortaleza/CE': { aliquota: 0.05, obs: 'Alíquota máxima' },
    'Belo Horizonte/MG': { aliquota: 0.05, obs: 'Alíquota máxima' },
    'Curitiba/PR': { aliquota: 0.05, obs: 'Maioria dos serviços' },
    'Recife/PE': { aliquota: 0.05, obs: 'Alíquota máxima' },
    'Porto Alegre/RS': { aliquota: 0.05, obs: 'Alíquota máxima' },
    'Manaus/AM': { aliquota: 0.05, obs: 'Alíquota máxima' }
  },

  servicosAliquotaMinima: [
    'Educação infantil, ensino fundamental, médio, superior',
    'Transporte coletivo municipal',
    'Serviços postais'
  ],

  calcular(valor, municipio = 'São Paulo/SP') {
    const config = this.municipiosPopulares[municipio] || 
                  { aliquota: 0.05, obs: 'Alíquota padrão máxima' };
    
    return {
      valor,
      municipio,
      aliquota: config.aliquota,
      valorISS: valor * config.aliquota,
      observacao: config.obs
    };
  }
};

// ==============================================
// ENCARGOS TRABALHISTAS EXPANDIDOS
// ==============================================

export const encargosTrabalhistas = {
  clt: {
    inss_patronal: 0.20,
    rat: { grau1: 0.01, grau2: 0.02, grau3: 0.03 },
    ratDefault: 0.03,
    sistemaS: 0.058, // SESI/SENAI/SEBRAE/SENAT/SEST/SESCOOP/INCRA
    fgts: 0.08,
    salarioEducacao: 0.025,
    provisao13: 1 / 12,
    provisaoFerias: 1 / 12 + (1 / 12) / 3, // férias + 1/3
    provisaoMultaFGTS: 0.04, // 40% sobre FGTS (estimativa de turnover)
    ferias13Inss: 0.20, // INSS patronal sobre férias e 13º
    ferias13Fgts: 0.08, // FGTS sobre férias e 13º
  },
  
  proLabore: {
    inss: 0.11, // 11% para o sócio
    tetoInss2026: 932.31, // 11% sobre teto INSS 2026
    inssPatronal: 0.20, // se Lucro Presumido/Real (20% sobre pró-labore)
    inssPatronalSimples: 0, // No Simples, não há INSS patronal sobre pró-labore
  },

  terceirizados: {
    encargo_medio: 1.8, // Multiplicador médio para terceirizados
    observacao: 'Inclui margem da empresa terceirizada'
  },

  beneficios: {
    valeTransporte: { percentual: 0.06, limite_desconto: 0.06 },
    valeRefeicao: { valor_medio: 25.00, desconto_permitido: 0.20 },
    valeAlimentacao: { valor_medio: 350.00, desconto_permitido: 0.20 },
    assistenciaMedica: { valor_medio: 200.00, desconto_permitido: false },
    seguroVida: { valor_medio: 15.00, desconto_permitido: false }
  }
};

export function calcRAT(grauRisco = 3, fap = 1.0) {
  const ratBase = grauRisco === 1 ? 0.01 : grauRisco === 2 ? 0.02 : 0.03;
  const ratAjustado = ratBase * fap;
  return {
    grauRisco,
    fap,
    ratBase,
    ratAjustado: Math.min(Math.max(ratAjustado, 0.005), 0.06), // FAP limites: 0.5x a 2.0x
    baseLegal: 'Lei 8.212/1991, Art. 22 + Decreto 6.957/2009',
  };
}

export function calcEncargoCLT(salarioBruto, ratClass = 3, comBeneficios = false, fap = 1.0) {
  const enc = encargosTrabalhistas.clt;
  
  // Encargos básicos
  const inssPatronal = salarioBruto * enc.inss_patronal;
  const ratInfo = calcRAT(ratClass, fap);
  const rat = salarioBruto * ratInfo.ratAjustado;
  const sistemaS = salarioBruto * enc.sistemaS;
  const fgts = salarioBruto * enc.fgts;
  const salarioEducacao = salarioBruto * enc.salarioEducacao;
  
  // Provisões
  const prov13 = salarioBruto * enc.provisao13;
  const provFerias = salarioBruto * enc.provisaoFerias;
  
  // Encargos sobre 13º e férias
  const encargos13Ferias = (prov13 + provFerias) * (enc.inss_patronal + enc.fgts + ratInfo.ratAjustado + enc.sistemaS);
  
  const multaFGTS = fgts * 0.5 * 0.10; // estimativa de 10% de turnover

  // Benefícios (opcional)
  let beneficios = 0;
  if (comBeneficios) {
    const ben = encargosTrabalhistas.beneficios;
    beneficios = ben.valeRefeicao.valor_medio + ben.valeAlimentacao.valor_medio + 
                ben.assistenciaMedica.valor_medio + ben.seguroVida.valor_medio;
  }

  const totalEncargos = inssPatronal + rat + sistemaS + fgts + salarioEducacao + 
                       prov13 + provFerias + encargos13Ferias + multaFGTS + beneficios;
  
  const custoTotal = salarioBruto + totalEncargos;
  const multiplicador = custoTotal / salarioBruto;

  return {
    salarioBruto,
    encargosDetalhados: {
      inssPatronal,
      rat,
      sistemaS,
      fgts,
      salarioEducacao,
      prov13,
      provFerias,
      encargos13Ferias,
      multaFGTS,
      beneficios
    },
    totalEncargos,
    custoTotal,
    multiplicador,
    percentualEncargos: totalEncargos / salarioBruto,
    ratClassificacao: ratClass
  };
}

// ==============================================
// CUSTOS OPERACIONAIS EXPANDIDOS
// ==============================================

export const custosOperacionais = {
  escritorioContabil: {
    // Custos fixos mensais
    fixos: [
      { id: 'aluguel', nome: 'Aluguel + Condomínio + IPTU', valor: 3500, categoria: 'Infraestrutura', obrigatorio: true },
      { id: 'energia', nome: 'Energia Elétrica', valor: 600, categoria: 'Infraestrutura', obrigatorio: true },
      { id: 'internet', nome: 'Internet + Telefone + Celular', valor: 400, categoria: 'Infraestrutura', obrigatorio: true },
      
      // Software e tecnologia
      { id: 'contabil_sw', nome: 'Software Contábil Principal', valor: 1200, categoria: 'Tecnologia', obrigatorio: true },
      { id: 'fiscal_sw', nome: 'Software Fiscal/SPED', valor: 600, categoria: 'Tecnologia', obrigatorio: true },
      { id: 'folha_sw', nome: 'Software de Folha', valor: 400, categoria: 'Tecnologia', obrigatorio: true },
      { id: 'certificado', nome: 'Certificados Digitais (rateio)', valor: 200, categoria: 'Tecnologia', obrigatorio: true },
      { id: 'erp', nome: 'ERP/CRM Interno', valor: 300, categoria: 'Tecnologia', obrigatorio: false },
      { id: 'backup', nome: 'Backup/Nuvem', valor: 150, categoria: 'Tecnologia', obrigatorio: true },
      
      // Operacional
      { id: 'seguro', nome: 'Seguro RC Profissional', valor: 350, categoria: 'Operacional', obrigatorio: true },
      { id: 'contabilidade', nome: 'Contador (própria contab.)', valor: 800, categoria: 'Operacional', obrigatorio: true },
      { id: 'juridico', nome: 'Assessoria Jurídica', valor: 500, categoria: 'Operacional', obrigatorio: false },
      { id: 'material', nome: 'Material de Escritório', valor: 250, categoria: 'Operacional', obrigatorio: true },
      { id: 'limpeza', nome: 'Limpeza e Conservação', valor: 300, categoria: 'Operacional', obrigatorio: true },
      
      // Marketing e relacionamento
      { id: 'marketing', nome: 'Marketing Digital', valor: 800, categoria: 'Comercial', obrigatorio: false },
      { id: 'site', nome: 'Site + Hospedagem', valor: 200, categoria: 'Comercial', obrigatorio: true },
      { id: 'networking', nome: 'Eventos + Networking', valor: 400, categoria: 'Comercial', obrigatorio: false },
      
      // Regulatório e capacitação
      { id: 'crc', nome: 'Anuidade CRC + Sindcont', valor: 150, categoria: 'Regulatório', obrigatorio: true },
      { id: 'treinamento', nome: 'Capacitação/Cursos', valor: 500, categoria: 'Pessoal', obrigatorio: true },
      { id: 'consultoria', nome: 'Consultoria Especializada', valor: 600, categoria: 'Pessoal', obrigatorio: false }
    ],

    // Custos variáveis por cliente
    variavelPorCliente: [
      { id: 'cert_cliente', nome: 'Certificado Digital Cliente', valor: 20, categoria: 'Tecnologia', obrigatorio: true },
      { id: 'impressao', nome: 'Impressão/Correios', valor: 15, categoria: 'Operacional', obrigatorio: true },
      { id: 'deslocamento', nome: 'Visitas/Deslocamento', valor: 25, categoria: 'Operacional', obrigatorio: false },
      { id: 'comunicacao', nome: 'WhatsApp Business/Tel', valor: 5, categoria: 'Tecnologia', obrigatorio: false }
    ],

    // Custos por tipo de serviço (horas técnicas)
    horasTecnicasPorServico: {
      mei: { horas: 2, descricao: 'MEI - Declaração anual' },
      simples_comercio: { horas: 4, descricao: 'Simples - Comércio' },
      simples_servicos: { horas: 6, descricao: 'Simples - Serviços' },
      presumido: { horas: 8, descricao: 'Lucro Presumido' },
      real: { horas: 16, descricao: 'Lucro Real' },
      folha_5func: { horas: 4, descricao: 'Folha até 5 funcionários' },
      folha_20func: { horas: 8, descricao: 'Folha até 20 funcionários' },
      balanco: { horas: 24, descricao: 'Balanço Patrimonial' },
      abertura: { horas: 12, descricao: 'Abertura de empresa' },
      alteracao: { horas: 6, descricao: 'Alteração contratual' },
      consultoria: { horas: 1, descricao: 'Consultoria (por hora)' }
    }
  },

  calcularCustoHora(salarioContador = 8000, encargos = 1.8) {
    const custoMensalContador = salarioContador * encargos;
    const horasUteismes = 22 * 8; // 22 dias úteis x 8 horas
    const custoHora = custoMensalContador / horasUteismes;
    
    return {
      salarioBase: salarioContador,
      multiplicadorEncargos: encargos,
      custoMensal: custoMensalContador,
      horasUteis: horasUteismes,
      custoHora,
      observacao: 'Custo da hora técnica do contador'
    };
  }
};

// ==============================================
// SIMULADORES AVANÇADOS
// ==============================================

export const simuladores = {
  mudancaRegime: {
    simular(receitaAnual, despesasAnuais, folhaAnual, tipoAtividade = 'servicos') {
      const receitaMensal = receitaAnual / 12;
      const despesasMensais = despesasAnuais / 12;
      const folhaMensal = folhaAnual / 12;
      
      // Calcula cada regime
      const mei = calcMEI(receitaMensal, tipoAtividade);
      const simples = calcSimplesTax(receitaAnual, 'III'); // Assumindo Anexo III para serviços
      const presumido = calcLucroPresumido(receitaMensal, tipoAtividade);
      const real = calcLucroReal(receitaMensal, despesasMensais);
      
      const resultados = [
        { regime: 'MEI', resultado: mei, aplicavel: !mei.excedeLimite },
        { regime: 'Simples Nacional', resultado: simples, aplicavel: !simples.excedeLimite },
        { regime: 'Lucro Presumido', resultado: presumido, aplicavel: !presumido.erro },
        { regime: 'Lucro Real', resultado: real, aplicavel: true }
      ].filter(r => r.aplicavel);
      
      // Ordena por menor tributo
      resultados.sort((a, b) => {
        const valorA = a.resultado.totalMensal || a.resultado.dasFixo || 0;
        const valorB = b.resultado.totalMensal || b.resultado.dasFixo || 0;
        return valorA - valorB;
      });
      
      return {
        parametros: { receitaAnual, despesasAnuais, folhaAnual, tipoAtividade },
        resultados,
        recomendacao: resultados[0],
        economia: resultados.length > 1 ? 
          (resultados[1].resultado.totalMensal || 0) - (resultados[0].resultado.totalMensal || 0) : 0
      };
    }
  },

  planejamentoAnual: {
    simular(receitaProjetada, crescimentoMensal = 0, tipoAtividade = 'servicos') {
      const projecoes = [];
      let receitaAcumulada = 0;
      
      for (let mes = 1; mes <= 12; mes++) {
        const receitaMes = receitaProjetada * (1 + (crescimentoMensal * (mes - 1)));
        receitaAcumulada += receitaMes;
        
        // Simula regime no ponto atual
        const simulacao = this.mudancaRegime.simular(
          receitaAcumulada, 
          receitaAcumulada * 0.3, // Assume 30% de despesas
          receitaAcumulada * 0.2, // Assume 20% de folha
          tipoAtividade
        );
        
        projecoes.push({
          mes,
          receitaMensal: receitaMes,
          receitaAcumulada,
          regimeRecomendado: simulacao.recomendacao.regime,
          tributosAcumulados: simulacao.recomendacao.resultado.totalMensal * mes
        });
      }
      
      return {
        parametros: { receitaProjetada, crescimentoMensal, tipoAtividade },
        projecoes,
        alertas: this.identificarAlertas(projecoes)
      };
    },

    identificarAlertas(projecoes) {
      const alertas = [];
      
      projecoes.forEach(p => {
        // Alerta proximidade limite MEI
        if (p.receitaAcumulada > 60000) {
          alertas.push({
            mes: p.mes,
            tipo: 'limite_mei',
            mensagem: 'Próximo ao limite do MEI (R$ 81.000)'
          });
        }
        
        // Alerta mudança de regime
        if (p.mes > 1 && projecoes[p.mes - 2].regimeRecomendado !== p.regimeRecomendado) {
          alertas.push({
            mes: p.mes,
            tipo: 'mudanca_regime',
            mensagem: `Recomendada mudança para ${p.regimeRecomendado}`
          });
        }
      });
      
      return alertas;
    }
  },

  impactoMudancas: {
    analisarNovaLegislacao(parametrosAtuais, novasRegras) {
      // Simula impacto de mudanças na legislação
      const cenarioAtual = simuladores.mudancaRegime.simular(
        parametrosAtuais.receita,
        parametrosAtuais.despesas,
        parametrosAtuais.folha,
        parametrosAtuais.atividade
      );
      
      // Aqui seria aplicada a nova legislação
      const cenarioNovo = cenarioAtual; // Placeholder
      
      return {
        cenarioAtual,
        cenarioNovo,
        impacto: {
          financeiro: 0, // Diferença em valores
          percentual: 0, // Diferença em %
          recomendacoes: []
        }
      };
    }
  }
};

// ==============================================
// COMPARATIVO COM MERCADO
// ==============================================

export const benchmarkMercado = {
  honariosReferencia: {
    mei: { min: 80, max: 150, media: 115 },
    simples_comercio: { min: 150, max: 300, media: 225 },
    simples_servicos: { min: 200, max: 400, media: 300 },
    presumido: { min: 300, max: 600, media: 450 },
    real: { min: 800, max: 1500, media: 1150 },
    folha_funcionario: { min: 25, max: 50, media: 37.5 },
    consultoria_hora: { min: 100, max: 300, media: 200 }
  },

  comparar(servicoTipo, valorCobrado, regiao = 'sudeste') {
    const ref = this.honariosReferencia[servicoTipo];
    if (!ref) return { erro: 'Tipo de serviço não encontrado' };

    const multiplicadorRegiao = {
      norte: 0.8,
      nordeste: 0.85,
      centrooeste: 0.9,
      sudeste: 1.0,
      sul: 1.1
    };

    const fator = multiplicadorRegiao[regiao] || 1.0;
    const refAjustada = {
      min: ref.min * fator,
      max: ref.max * fator,
      media: ref.media * fator
    };

    let posicionamento = '';
    if (valorCobrado < refAjustada.min) posicionamento = 'Abaixo do mercado';
    else if (valorCobrado > refAjustada.max) posicionamento = 'Acima do mercado';
    else posicionamento = 'Dentro da faixa';

    return {
      servicoTipo,
      valorCobrado,
      referenciaRegional: refAjustada,
      posicionamento,
      percentilAproximado: ((valorCobrado - refAjustada.min) / (refAjustada.max - refAjustada.min)) * 100,
      regiao
    };
  }
};

// ==============================================
// HELPERS E UTILITÁRIOS
// ==============================================

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
    maximumFractionDigits: 4,
  }).format(value);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj.length !== 14) return false;
  
  // Validação básica do CNPJ
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  // Cálculo dos dígitos verificadores
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado != digitos.charAt(0)) return false;
  
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  return resultado == digitos.charAt(1);
}

export function calcularFatorR(folhaAnual, receitaBrutaAnual) {
  if (receitaBrutaAnual === 0) return 0;
  return folhaAnual / receitaBrutaAnual;
}

export const fatorRComponentes = {
  incluir: [
    { item: 'Salários e remunerações', descricao: 'Salários brutos de todos os funcionários CLT' },
    { item: '13º salário', descricao: 'Gratificação natalina paga ou provisionada' },
    { item: 'Férias e 1/3 constitucional', descricao: 'Valor das férias mais adicional de 1/3' },
    { item: 'Pró-labore', descricao: 'Retirada dos sócios com incidência de INSS' },
    { item: 'INSS patronal (CPP)', descricao: '20% sobre a folha de pagamento' },
    { item: 'FGTS', descricao: '8% sobre remunerações (inclusive 13º e férias)' },
  ],
  excluir: [
    { item: 'Autônomos (RPA)', descricao: 'Pagamentos a trabalhadores autônomos sem vínculo' },
    { item: 'Terceirizados', descricao: 'Serviços prestados por outras empresas' },
    { item: 'Estagiários', descricao: 'Bolsa-auxílio de estagiários não entra na folha' },
    { item: 'Distribuição de lucros', descricao: 'Lucros distribuídos não são folha de pagamento' },
    { item: 'Verbas indenizatórias', descricao: 'Multa FGTS, aviso prévio indenizado, etc.' },
  ],
  formula: 'Fator R = Folha de Pagamento (12 meses) / Receita Bruta (12 meses)',
  limiar: 0.28,
  efeito: 'Fator R >= 28%: atividades do Anexo V migram para o Anexo III (alíquotas menores)',
  baseLegal: 'LC 123/2006, Art. 18, §5º-J e §5º-M (alterado pela LC 155/2016)',
};

export function determinarAnexoSimples(tipoAtividade, fatorR = null, receitaComercio = 0, receitaTotal = 1) {
  const percComercio = receitaComercio / receitaTotal;
  
  // Indústria com mais de 80% de revenda -> Anexo I
  if (tipoAtividade === 'industria' && percComercio > 0.8) {
    return 'I';
  }
  
  // Indústria pura -> Anexo II
  if (tipoAtividade === 'industria') {
    return 'II';
  }
  
  // Comércio -> Anexo I
  if (tipoAtividade === 'comercio') {
    return 'I';
  }
  
  // Serviços - verifica Fator R
  if (tipoAtividade === 'servicos') {
    // Atividades intelectuais com Fator R < 28% -> Anexo V
    if (fatorR !== null && fatorR < 0.28) {
      return 'V';
    }
    // Demais serviços -> Anexo III
    return 'III';
  }
  
  // Construção civil, limpeza -> Anexo IV
  if (['construcao', 'limpeza', 'vigilancia'].includes(tipoAtividade)) {
    return 'IV';
  }
  
  // Default: Anexo III
  return 'III';
}

// ==============================================
// EXPORTAÇÕES PARA COMPATIBILIDADE
// ==============================================

// Mantém compatibilidade com código existente
export const custosDefaultContabilidade = {
  fixos: custosOperacionais.escritorioContabil.fixos,
  variavelPorCliente: custosOperacionais.escritorioContabil.variavelPorCliente,
};

export const servicosContabeis = [
  { id: 'abertura', nome: 'Abertura de Empresa', tipo: 'pontual', horasEstimadas: 12, complexidade: 'media' },
  { id: 'contabil_mensal', nome: 'Escrituração Contábil', tipo: 'recorrente', horasEstimadas: 6, complexidade: 'media' },
  { id: 'fiscal_mensal', nome: 'Escrituração Fiscal', tipo: 'recorrente', horasEstimadas: 8, complexidade: 'alta' },
  { id: 'folha', nome: 'Folha de Pagamento', tipo: 'recorrente', horasEstimadas: 4, complexidade: 'media', porFuncionario: true },
  { id: 'irpf', nome: 'Declaração IRPF', tipo: 'pontual', horasEstimadas: 4, complexidade: 'media' },
  { id: 'planejamento', nome: 'Planejamento Tributário', tipo: 'pontual', horasEstimadas: 16, complexidade: 'alta' },
  { id: 'consultoria', nome: 'Consultoria Tributária', tipo: 'avulso', horasEstimadas: 1, complexidade: 'variavel' },
  { id: 'balanco', nome: 'Balanço Patrimonial', tipo: 'pontual', horasEstimadas: 20, complexidade: 'alta' }
];

// ==============================================
// SISTEMA DE ALERTAS TRIBUTÁRIOS
// ==============================================

export const sistemaAlertas = {
  verificarLimites(dados) {
    const alertas = [];
    
    // MEI próximo ao limite
    if (dados.regime === 'mei' && dados.receitaAnual > 60000) {
      alertas.push({
        tipo: 'limite',
        urgencia: 'alta',
        mensagem: 'MEI próximo ao limite anual (R$ 81.000)',
        acao: 'Considerar migração para Simples Nacional'
      });
    }
    
    // Simples próximo ao limite
    if (dados.regime === 'simples' && dados.receitaAnual > 4000000) {
      alertas.push({
        tipo: 'limite',
        urgencia: 'alta',
        mensagem: 'Simples Nacional próximo ao limite (R$ 4.800.000)',
        acao: 'Preparar migração para Lucro Presumido ou Real'
      });
    }
    
    return alertas;
  },

  monitorarLegislacao() {
    // Em implementação futura: integração com APIs da Receita Federal
    return {
      ultimaVerificacao: new Date().toISOString(),
      mudancasRecentes: [],
      proximasAlteracoes: []
    };
  }
};

// ===== NOVAS FUNÇÕES DE APOIO =====

export function calcEncargos(rat = 0.02) {
  const inssPatronal = 0.20;
  const terceiros = 0.058;
  const fgts = 0.08;
  const diretos = inssPatronal + rat + terceiros + fgts;
  const provisao13 = 1 / 12;
  const provisaoFerias = (1 / 12) * (4 / 3);
  const provisoes = provisao13 + provisaoFerias;
  const encargosProvisoes = diretos * provisoes;
  return {
    inssPatronal, rat, terceiros, fgts,
    subtotalDiretos: diretos,
    provisao13, provisaoFerias,
    subtotalProvisoes: provisoes,
    encargosProvisoes,
    total: diretos + provisoes + encargosProvisoes,
    multiplicador: 1 + diretos + provisoes + encargosProvisoes,
    detalhamento: [
      { nome: 'INSS Patronal', percentual: inssPatronal },
      { nome: 'RAT/GILRAT', percentual: rat },
      { nome: 'Terceiros (Sistema S)', percentual: terceiros },
      { nome: 'FGTS', percentual: fgts },
      { nome: 'Provisão 13º Salário', percentual: provisao13 },
      { nome: 'Provisão Férias + 1/3', percentual: provisaoFerias },
      { nome: 'Encargos s/ Provisões', percentual: encargosProvisoes },
    ],
  };
}

export function calcCPPAnexoIV(folhaMensal) {
  return folhaMensal * 0.20;
}

export function calcFatorR(folha12Meses, rbt12) {
  if (!rbt12 || rbt12 <= 0) return 0;
  return folha12Meses / rbt12;
}

export function getAnexoPorFatorR(fatorR, anexoOriginal, atividadeSujeitaFatorR = false) {
  // LC 123/2006, Art. 18, §5º-J e §5º-M
  // Atividades do Anexo V com Fator R >= 28%: tributadas pelo Anexo III
  if (anexoOriginal === 'V' && fatorR >= 0.28) return 'III';
  // Atividades sujeitas ao Fator R no Anexo III com FR < 28%: tributadas pelo Anexo V
  if (anexoOriginal === 'III' && atividadeSujeitaFatorR && fatorR < 0.28) return 'V';
  return anexoOriginal;
}

export function checkSublimiteSimples(rbt12) {
  const sublimiteISSICMS = 3600000;
  const limiteSimples = 4800000;
  return {
    dentroSimples: rbt12 <= limiteSimples,
    dentroSublimite: rbt12 <= sublimiteISSICMS,
    rbt12,
    sublimiteISSICMS,
    limiteSimples,
    mensagem: rbt12 > limiteSimples
      ? 'Receita excede o limite do Simples Nacional (R$ 4.800.000)'
      : rbt12 > sublimiteISSICMS
        ? 'Receita excede o sublimite (R$ 3.600.000). ISS/ICMS recolhidos separadamente.'
        : null,
  };
}

