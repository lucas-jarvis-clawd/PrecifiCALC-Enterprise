/**
 * ============================================
 * CALCULADORA MEI - MICROEMPREENDEDOR INDIVIDUAL
 * ============================================
 * 
 * Cálculos precisos para MEI conforme LC 123/2006 e alterações
 * Valores atualizados para 2026
 * 
 * @author Backend Architect - PrecifiCALC Masterpiece
 * @version 4.0
 * @date 05/02/2026
 */

import { VALORES_2026, ALIQUOTAS } from '../constants.js';
import { validarLimiteRegime, formatCurrency, formatPercent } from '../utils.js';

/**
 * ================================
 * CONFIGURAÇÕES MEI 2026
 * ================================
 */

/**
 * Tipos de atividades MEI disponíveis
 */
const TIPOS_MEI = Object.freeze({
  comercio: {
    das: 82.05, // 81.05 INSS + 1.00 ICMS
    descricao: 'Comércio e Indústria (INSS + ICMS)',
    tributos: ['INSS', 'ICMS'],
    codigo: '001'
  },
  servicos: {
    das: 86.05, // 81.05 INSS + 5.00 ISS
    descricao: 'Prestação de Serviços (INSS + ISS)',
    tributos: ['INSS', 'ISS'],
    codigo: '002'
  },
  misto: {
    das: 87.05, // 81.05 INSS + 1.00 ICMS + 5.00 ISS
    descricao: 'Comércio + Serviços (INSS + ICMS + ISS)',
    tributos: ['INSS', 'ICMS', 'ISS'],
    codigo: '003'
  },
  caminhoneiro: {
    das: 195.52, // 12% de R$ 1.621 + 1.00 ICMS
    descricao: 'MEI Caminhoneiro (INSS + ICMS)',
    tributos: ['INSS', 'ICMS'],
    codigo: '004',
    limiteEspecial: VALORES_2026.limiteMEICaminhoneiro
  }
});

/**
 * ================================
 * VALIDAÇÕES E VERIFICAÇÕES
 * ================================
 */

/**
 * Valida se pode ser MEI baseado na atividade e parâmetros
 * @param {string} atividade - Tipo de atividade
 * @param {boolean} isCaminhoneiro - Se é MEI Caminhoneiro
 * @param {number} receitaMensal - Receita mensal
 * @returns {object} Resultado da validação
 */
const validarElegibilidadeMEI = (atividade, isCaminhoneiro, receitaMensal) => {
  // Verifica se o tipo de atividade existe
  const tipoMei = isCaminhoneiro ? TIPOS_MEI.caminhoneiro : TIPOS_MEI[atividade];
  if (!tipoMei) {
    return {
      elegivel: false,
      erro: `Tipo de atividade '${atividade}' não permitido para MEI`,
      sugestao: 'Verificar lista de atividades permitidas para MEI'
    };
  }

  // Verifica limite de receita
  const limite = isCaminhoneiro ? VALORES_2026.limiteMEICaminhoneiro : VALORES_2026.limiteMEI;
  const receitaAnual = receitaMensal * 12;
  
  if (receitaAnual > limite) {
    return {
      elegivel: false,
      excedeLimite: true,
      receitaAnual,
      limite,
      percentualExcesso: ((receitaAnual - limite) / limite) * 100,
      proximoRegime: 'Simples Nacional'
    };
  }

  return { elegivel: true, tipoMei, limite, receitaAnual };
};

/**
 * Gera alertas baseados na proximidade do limite
 * @param {number} receitaAnual - Receita anual calculada
 * @param {number} limite - Limite aplicável (tradicional ou caminhoneiro)
 * @returns {Array} Lista de alertas
 */
const gerarAlertas = (receitaAnual, limite) => {
  const alertas = [];
  const percentualLimite = receitaAnual / limite;

  if (percentualLimite > 0.9) {
    alertas.push({
      tipo: 'critico',
      titulo: 'Muito próximo ao limite MEI',
      mensagem: `Receita representa ${(percentualLimite * 100).toFixed(1)}% do limite anual`,
      acao: 'Considere migração urgente para Simples Nacional',
      cor: 'red'
    });
  } else if (percentualLimite > 0.8) {
    alertas.push({
      tipo: 'alerta',
      titulo: 'Proximidade ao limite MEI',
      mensagem: `Receita representa ${(percentualLimite * 100).toFixed(1)}% do limite anual`,
      acao: 'Planeje migração para Simples Nacional',
      cor: 'orange'
    });
  } else if (percentualLimite > 0.7) {
    alertas.push({
      tipo: 'atencao',
      titulo: 'Monitorar crescimento',
      mensagem: 'Receita crescendo em direção ao limite MEI',
      acao: 'Acompanhe mensalmente o faturamento',
      cor: 'yellow'
    });
  }

  return alertas;
};

/**
 * ================================
 * CALCULADORA PRINCIPAL MEI
 * ================================
 */

/**
 * Calcula tributos e informações completas para MEI
 * @param {number} receitaMensal - Receita bruta mensal em reais
 * @param {string} atividade - Tipo de atividade ('comercio', 'servicos', 'misto')
 * @param {boolean} isCaminhoneiro - Se é MEI Caminhoneiro
 * @returns {object} Resultado completo do cálculo MEI
 * 
 * @example
 * // MEI Serviços tradicional
 * const resultado = calcularMEI(5000, 'servicos', false);
 * console.log(resultado.dasFixo); // 86.05
 * 
 * // MEI Caminhoneiro
 * const caminhoneiro = calcularMEI(20000, 'servicos', true);
 * console.log(caminhoneiro.dasFixo); // 195.52
 */
export const calcularMEI = (receitaMensal, atividade = 'servicos', isCaminhoneiro = false) => {
  // Validação de entrada
  if (!receitaMensal || receitaMensal <= 0) {
    return {
      erro: 'Receita mensal deve ser maior que zero',
      codigo: 'RECEITA_INVALIDA'
    };
  }

  // Validação de elegibilidade
  const validacao = validarElegibilidadeMEI(atividade, isCaminhoneiro, receitaMensal);
  
  if (!validacao.elegivel) {
    return {
      erro: validacao.erro || 'Não elegível para MEI',
      excedeLimite: validacao.excedeLimite,
      proximoRegime: validacao.proximoRegime,
      receitaAnual: validacao.receitaAnual,
      limite: validacao.limite,
      observacao: validacao.excedeLimite 
        ? `Receita anual (${formatCurrency(validacao.receitaAnual)}) excede limite MEI`
        : validacao.erro,
      codigo: validacao.excedeLimite ? 'LIMITE_EXCEDIDO' : 'ATIVIDADE_INVALIDA'
    };
  }

  // Dados base para cálculo
  const { tipoMei, limite } = validacao;
  const receitaAnual = receitaMensal * 12;
  const dasFixo = tipoMei.das;
  const dasAnual = dasFixo * 12;

  // Cálculo da alíquota efetiva
  const aliquotaEfetiva = dasFixo / receitaMensal;

  // Geração de alertas
  const alertas = gerarAlertas(receitaAnual, limite);

  // Decomposição do DAS
  const decomposicao = {
    inss: VALORES_2026.valorMeiInss,
    icms: tipoMei.tributos.includes('ICMS') ? 1.00 : 0,
    iss: tipoMei.tributos.includes('ISS') ? 5.00 : 0
  };

  // Se é caminhoneiro, INSS é diferente (12% do salário mínimo)
  if (isCaminhoneiro) {
    decomposicao.inss = 194.52; // 12% de R$ 1.621
  }

  // Estatísticas e análises
  const estatisticas = {
    tributosAnoAtual: dasAnual,
    tributosProximoAno: dasAnual, // MEI tem valor fixo
    economiaVsSimples: null, // Calculado se solicitado
    margemSegurancaLimite: ((limite - receitaAnual) / limite) * 100
  };

  // Projeções mensais
  const projecoesMensais = Array.from({ length: 12 }, (_, mes) => ({
    mes: mes + 1,
    receita: receitaMensal,
    das: dasFixo,
    receitaAcumulada: receitaMensal * (mes + 1),
    tributoAcumulado: dasFixo * (mes + 1),
    percentualLimiteAcumulado: ((receitaMensal * (mes + 1)) / limite) * 100
  }));

  // Resultado completo
  return {
    // Informações básicas
    regime: 'MEI',
    tipoMei: isCaminhoneiro ? 'MEI Caminhoneiro' : 'MEI Tradicional',
    atividade: tipoMei.descricao,
    codigoAtividade: tipoMei.codigo,
    
    // Valores financeiros
    receitaMensal,
    receitaAnual,
    dasFixo,
    dasAnual,
    aliquotaEfetiva,
    
    // Decomposição do DAS
    decomposicao,
    tributosInclusos: tipoMei.tributos,
    
    // Controle de limites
    limite,
    excedeLimite: false,
    percentualLimite: (receitaAnual / limite) * 100,
    margemSeguranca: limite - receitaAnual,
    
    // Alertas e observações
    alertas,
    proximaRevisao: alertas.length > 0 ? 'Revisar regime tributário' : null,
    
    // Estatísticas e análises
    estatisticas,
    projecoesMensais,
    
    // Metadados
    calculadoEm: new Date().toISOString(),
    versaoCalculo: '4.0',
    
    // Formatação para exibição
    formatado: {
      receitaMensal: formatCurrency(receitaMensal),
      receitaAnual: formatCurrency(receitaAnual),
      dasFixo: formatCurrency(dasFixo),
      dasAnual: formatCurrency(dasAnual),
      aliquotaEfetiva: formatPercent(aliquotaEfetiva),
      limite: formatCurrency(limite),
      margemSeguranca: formatCurrency(limite - receitaAnual)
    }
  };
};

/**
 * ================================
 * UTILITÁRIOS ESPECÍFICOS MEI
 * ================================
 */

/**
 * Compara MEI com Simples Nacional (primeira faixa)
 * @param {number} receitaMensal - Receita mensal
 * @param {string} atividade - Tipo de atividade
 * @returns {object} Comparação entre regimes
 */
export const compararMEIComSimples = (receitaMensal, atividade = 'servicos') => {
  const resultadoMEI = calcularMEI(receitaMensal, atividade, false);
  
  if (resultadoMEI.erro) {
    return { erro: 'Não foi possível calcular MEI: ' + resultadoMEI.erro };
  }

  // Cálculo básico Simples (primeira faixa)
  // Anexo III (serviços) = 6% | Anexo I (comércio) = 4%
  const aliquotaSimples = atividade === 'comercio' ? 0.04 : 0.06;
  const tributosSimples = receitaMensal * aliquotaSimples;
  
  const economia = tributosSimples - resultadoMEI.dasFixo;
  const economiaPercentual = (economia / tributosSimples) * 100;

  return {
    mei: {
      tributo: resultadoMEI.dasFixo,
      aliquota: resultadoMEI.aliquotaEfetiva,
      formatado: resultadoMEI.formatado.dasFixo
    },
    simples: {
      tributo: tributosSimples,
      aliquota: aliquotaSimples,
      formatado: formatCurrency(tributosSimples)
    },
    economia: {
      valor: Math.abs(economia),
      percentual: Math.abs(economiaPercentual),
      vantajoso: economia > 0 ? 'MEI' : 'Simples',
      formatado: formatCurrency(Math.abs(economia))
    },
    recomendacao: economia > 0 
      ? `MEI é mais vantajoso: economia de ${formatCurrency(economia)}/mês`
      : `Simples pode ser mais vantajoso: ${formatCurrency(Math.abs(economia))} a mais/mês no MEI`
  };
};

/**
 * Simula projeção de receita e momento ideal para migração
 * @param {number} receitaAtual - Receita mensal atual
 * @param {number} crescimentoMensal - Percentual de crescimento mensal (0.05 = 5%)
 * @param {string} atividade - Tipo de atividade
 * @returns {object} Simulação de 12 meses
 */
export const simularCrescimentoMEI = (receitaAtual, crescimentoMensal = 0.02, atividade = 'servicos') => {
  const simulacao = [];
  const limite = VALORES_2026.limiteMEI;
  let receitaProjetada = receitaAtual;
  let mesIdealMigracao = null;

  for (let mes = 1; mes <= 12; mes++) {
    receitaProjetada *= (1 + crescimentoMensal);
    const receitaAcumulada = receitaProjetada * mes;
    const percentualLimite = (receitaAcumulada / limite) * 100;
    
    // Identifica mês ideal para migração (80% do limite)
    if (!mesIdealMigracao && percentualLimite > 80) {
      mesIdealMigracao = mes;
    }

    simulacao.push({
      mes,
      receitaMensal: receitaProjetada,
      receitaAcumulada,
      percentualLimite,
      excedeLimite: receitaAcumulada > limite,
      alerta: percentualLimite > 80 ? 'Considerar migração' : null,
      formatado: {
        receitaMensal: formatCurrency(receitaProjetada),
        receitaAcumulada: formatCurrency(receitaAcumulada)
      }
    });
  }

  return {
    parametros: {
      receitaInicial: receitaAtual,
      crescimentoMensal: crescimentoMensal * 100,
      atividade
    },
    simulacao,
    mesIdealMigracao,
    recomendacao: mesIdealMigracao 
      ? `Planejar migração para o ${mesIdealMigracao}º mês`
      : 'Crescimento está dentro dos limites para os próximos 12 meses',
    alertas: simulacao.filter(s => s.alerta).length
  };
};

/**
 * ================================
 * INFORMAÇÕES COMPLEMENTARES
 * ================================
 */

/**
 * Retorna informações sobre obrigações e benefícios do MEI
 * @returns {object} Informações legais e práticas do MEI
 */
export const obterInformacoesMEI = () => ({
  obrigacoes: {
    mensais: [
      'Recolhimento do DAS até o dia 20 de cada mês',
      'Emissão de nota fiscal quando vendas para pessoa jurídica',
      'Controle de receitas (pode ser simplificado)'
    ],
    anuais: [
      'Declaração Anual do Simples Nacional (DASN-SIMEI)',
      'Declaração de Imposto de Renda (se receita > R$ 28.559,70)'
    ]
  },
  
  beneficios: [
    'Aposentadoria por idade ou invalidez',
    'Auxílio-doença',
    'Salário-maternidade',
    'Pensão por morte para a família',
    'Auxílio-reclusão para a família'
  ],
  
  limitacoes: [
    'Máximo de 1 funcionário',
    'Não pode ser sócio de outra empresa',
    'Não pode ter filial',
    'Atividade deve estar na lista permitida'
  ],
  
  dicas: [
    'Guarde todas as notas fiscais de compras',
    'Mantenha controle das receitas mensais',
    'Acompanhe a proximidade do limite anual',
    'Planeje antecipadamente a migração de regime'
  ],
  
  documentacao: {
    abertura: ['CPF', 'RG', 'Comprovante de residência'],
    funcionamento: ['Licenças municipais quando exigidas'],
    encerramento: ['Quitação de débitos', 'Entrega de declarações']
  }
});

/**
 * ================================
 * EXPORTAÇÕES
 * ================================
 */

// Exportação principal
export { calcularMEI as default };

// Exportações nomeadas para compatibilidade
export const calcMEI = calcularMEI;
export const tiposMEI = TIPOS_MEI;

// Exportação completa do módulo
export const mei = {
  calcular: calcularMEI,
  compararComSimples: compararMEIComSimples,
  simularCrescimento: simularCrescimentoMEI,
  obterInformacoes: obterInformacoesMEI,
  tipos: TIPOS_MEI,
  limites: {
    tradicional: VALORES_2026.limiteMEI,
    caminhoneiro: VALORES_2026.limiteMEICaminhoneiro
  }
};