/**
 * ============================================
 * UTILITÁRIOS TRIBUTÁRIOS - FUNÇÕES AUXILIARES
 * ============================================
 * 
 * Funções puras e reutilizáveis para cálculos tributários
 * 
 * @author Backend Architect - PrecifiCALC Masterpiece
 * @version 4.0
 * @date 05/02/2026
 */

import { VALORES_2026, FATOR_R, SUBLIMITES_SIMPLES } from './constants.js';

/**
 * ================================
 * FORMATAÇÃO E VALIDAÇÃO
 * ================================
 */

/**
 * Formata valor monetário para padrão brasileiro
 * @param {number} value - Valor numérico
 * @returns {string} Valor formatado (R$ 1.234,56)
 * 
 * @example
 * formatCurrency(1234.56) // "R$ 1.234,56"
 */
export const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formata percentual para padrão brasileiro
 * @param {number} value - Valor decimal (0.15 = 15%)
 * @returns {string} Percentual formatado
 * 
 * @example
 * formatPercent(0.1543) // "15,43%"
 */
export const formatPercent = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0,00%';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(value);
};

/**
 * Formata número para padrão brasileiro
 * @param {number} value - Valor numérico
 * @returns {string} Número formatado
 */
export const formatNumber = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Valida CNPJ com algoritmo oficial
 * @param {string} cnpj - CNPJ a ser validado
 * @returns {boolean} True se válido
 * 
 * @example
 * validarCNPJ('11.222.333/0001-81') // true
 * validarCNPJ('11111111111111') // false
 */
export const validarCNPJ = (cnpj) => {
  if (!cnpj || typeof cnpj !== 'string') return false;
  
  // Remove caracteres especiais
  const digits = cnpj.replace(/[^\d]+/g, '');
  
  // Verifica tamanho
  if (digits.length !== 14) return false;
  
  // Verifica sequência repetida
  if (/^(\d)\1+$/.test(digits)) return false;
  
  // Cálculo dos dígitos verificadores
  const calculateDigit = (base, weights) => {
    const sum = base
      .split('')
      .reduce((acc, digit, index) => acc + parseInt(digit) * weights[index], 0);
    
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  
  const base = digits.substring(0, 12);
  const firstDigit = calculateDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calculateDigit(base + firstDigit, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  
  return digits === base + firstDigit + secondDigit;
};

/**
 * Valida CPF com algoritmo oficial
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} True se válido
 */
export const validarCPF = (cpf) => {
  if (!cpf || typeof cpf !== 'string') return false;
  
  const digits = cpf.replace(/[^\d]+/g, '');
  
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
  
  const calculateDigit = (base, startWeight) => {
    const sum = base
      .split('')
      .reduce((acc, digit, index) => acc + parseInt(digit) * (startWeight - index), 0);
    
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  
  const base = digits.substring(0, 9);
  const firstDigit = calculateDigit(base, 10);
  const secondDigit = calculateDigit(base + firstDigit, 11);
  
  return digits === base + firstDigit + secondDigit;
};

/**
 * ================================
 * CÁLCULOS TRIBUTÁRIOS BASE
 * ================================
 */

/**
 * Calcula Fator R (folha / receita bruta)
 * @param {number} folha12Meses - Folha de pagamento últimos 12 meses
 * @param {number} receitaBruta12Meses - Receita bruta últimos 12 meses
 * @returns {number} Fator R (0 a 1)
 * 
 * @example
 * calcularFatorR(120000, 600000) // 0.2 (20%)
 */
export const calcularFatorR = (folha12Meses, receitaBruta12Meses) => {
  if (!receitaBruta12Meses || receitaBruta12Meses <= 0) {
    return 0;
  }
  
  const fatorR = folha12Meses / receitaBruta12Meses;
  return Math.min(fatorR, 1); // Máximo 100%
};

/**
 * Determina anexo do Simples Nacional baseado na atividade e Fator R
 * @param {string} tipoAtividade - Tipo da atividade
 * @param {number|null} fatorR - Fator R calculado (opcional)
 * @param {number} receitaComercio - Receita de comércio (para indústria mista)
 * @param {number} receitaTotal - Receita total
 * @returns {string} Anexo recomendado (I, II, III, IV, V)
 * 
 * @example
 * determinarAnexoSimples('servicos', 0.30) // 'III' (Fator R ≥ 28%)
 * determinarAnexoSimples('servicos', 0.25) // 'V' (Fator R < 28%)
 */
export const determinarAnexoSimples = (tipoAtividade, fatorR = null, receitaComercio = 0, receitaTotal = 1) => {
  const percComercio = receitaTotal > 0 ? receitaComercio / receitaTotal : 0;
  
  // Mapeamento principal por atividade
  const mapeamento = {
    comercio: 'I',
    industria: percComercio > 0.8 ? 'I' : 'II', // >80% revenda = Anexo I
    construcao: 'IV',
    limpeza: 'IV',
    vigilancia: 'IV',
    servicos: fatorR !== null && fatorR < FATOR_R.limiteAnexoV ? 'V' : 'III'
  };
  
  return mapeamento[tipoAtividade] || 'III'; // Default: Anexo III
};

/**
 * Verifica se receita excede sublimites do Simples Nacional
 * @param {number} rbt12 - Receita bruta total últimos 12 meses
 * @returns {object} Status dos sublimites
 */
export const verificarSublimitesSimples = (rbt12) => {
  const { issIcms, geral } = SUBLIMITES_SIMPLES;
  
  return {
    dentroSimples: rbt12 <= geral,
    dentroSublimite: rbt12 <= issIcms,
    excedeuSublimite: rbt12 > issIcms && rbt12 <= geral,
    excedeuLimiteGeral: rbt12 > geral,
    rbt12,
    limites: { sublimiteISSICMS: issIcms, limiteGeral: geral },
    observacao: rbt12 > geral 
      ? 'Receita excede limite do Simples Nacional'
      : rbt12 > issIcms 
        ? 'ISS/ICMS devem ser recolhidos separadamente'
        : null
  };
};

/**
 * ================================
 * UTILITÁRIOS DE CLASSIFICAÇÃO
 * ================================
 */

/**
 * Classifica empresa por porte baseado na receita anual
 * @param {number} receitaAnual - Receita bruta anual
 * @returns {object} Classificação do porte
 */
export const classificarPorteEmpresa = (receitaAnual) => {
  if (receitaAnual <= VALORES_2026.limiteMEI) {
    return {
      porte: 'MEI',
      descricao: 'Microempreendedor Individual',
      limite: VALORES_2026.limiteMEI
    };
  }
  
  if (receitaAnual <= 360000) {
    return {
      porte: 'Microempresa',
      descricao: 'Microempresa',
      limite: 360000
    };
  }
  
  if (receitaAnual <= VALORES_2026.limiteSimples) {
    return {
      porte: 'Pequena Empresa',
      descricao: 'Empresa de Pequeno Porte',
      limite: VALORES_2026.limiteSimples
    };
  }
  
  if (receitaAnual <= VALORES_2026.limiteLucroPresumido) {
    return {
      porte: 'Média Empresa',
      descricao: 'Empresa de Médio Porte',
      limite: VALORES_2026.limiteLucroPresumido
    };
  }
  
  return {
    porte: 'Grande Empresa',
    descricao: 'Empresa de Grande Porte',
    limite: Infinity
  };
};

/**
 * Classifica Fator R em categorias
 * @param {number} fatorR - Valor do Fator R (0 a 1)
 * @returns {object} Classificação do Fator R
 */
export const classificarFatorR = (fatorR) => {
  const { classificacoes } = FATOR_R;
  
  if (fatorR < classificacoes.baixo.max) {
    return { categoria: 'baixo', ...classificacoes.baixo };
  }
  
  if (fatorR < classificacoes.medio.max) {
    return { categoria: 'medio', ...classificacoes.medio };
  }
  
  return { categoria: 'alto', ...classificacoes.alto };
};

/**
 * ================================
 * UTILITÁRIOS DE ANÁLISE
 * ================================
 */

/**
 * Calcula a diferença percentual entre dois valores
 * @param {number} valorAtual - Valor atual
 * @param {number} valorAnterior - Valor anterior
 * @returns {number} Diferença percentual (-1 a +∞)
 */
export const calcularDiferencaPercentual = (valorAtual, valorAnterior) => {
  if (valorAnterior === 0) {
    return valorAtual > 0 ? Infinity : 0;
  }
  
  return (valorAtual - valorAnterior) / valorAnterior;
};

/**
 * Encontra a faixa de tributação baseada na receita
 * @param {number} receita - Receita a ser classificada
 * @param {Array} faixas - Array de faixas {de, ate, aliquota, deducao}
 * @returns {object|null} Faixa encontrada
 */
export const encontrarFaixaTributaria = (receita, faixas) => {
  if (!Array.isArray(faixas) || !receita) {
    return null;
  }
  
  return faixas.find(faixa => receita >= faixa.de && receita <= faixa.ate) || null;
};

/**
 * Calcula alíquota efetiva a partir da nominal e dedução
 * @param {number} receita - Receita base
 * @param {number} aliquotaNominal - Alíquota nominal da faixa
 * @param {number} deducao - Dedução da faixa
 * @returns {number} Alíquota efetiva
 */
export const calcularAliquotaEfetiva = (receita, aliquotaNominal, deducao = 0) => {
  if (receita <= 0) return 0;
  
  const tributoDevido = (receita * aliquotaNominal) - deducao;
  return Math.max(0, tributoDevido / receita);
};

/**
 * ================================
 * UTILITÁRIOS DE DATA
 * ================================
 */

/**
 * Verifica se uma data está dentro do período fiscal atual
 * @param {Date|string} data - Data a verificar
 * @returns {boolean} True se está no período atual
 */
export const isDataPeriodoFiscalAtual = (data) => {
  const dataObj = new Date(data);
  const agora = new Date();
  const inicioAno = new Date(agora.getFullYear(), 0, 1);
  const fimAno = new Date(agora.getFullYear(), 11, 31);
  
  return dataObj >= inicioAno && dataObj <= fimAno;
};

/**
 * Calcula meses entre duas datas
 * @param {Date} dataInicio - Data inicial
 * @param {Date} dataFim - Data final
 * @returns {number} Número de meses
 */
export const calcularMesesEntreDatas = (dataInicio, dataFim) => {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  
  let meses = (fim.getFullYear() - inicio.getFullYear()) * 12;
  meses += fim.getMonth() - inicio.getMonth();
  
  return Math.max(0, meses);
};

/**
 * ================================
 * UTILITÁRIOS DE VALIDAÇÃO FISCAL
 * ================================
 */

/**
 * Valida se uma receita está dentro dos limites de um regime
 * @param {number} receita - Receita anual
 * @param {string} regime - Regime tributário (mei, simples, presumido, real)
 * @returns {object} Resultado da validação
 */
export const validarLimiteRegime = (receita, regime) => {
  const limites = {
    mei: VALORES_2026.limiteMEI,
    simples: VALORES_2026.limiteSimples,
    presumido: VALORES_2026.limiteLucroPresumido,
    real: Infinity
  };
  
  const limite = limites[regime];
  if (!limite) {
    return { valido: false, erro: 'Regime não reconhecido' };
  }
  
  const valido = receita <= limite;
  const percentualLimite = limite !== Infinity ? (receita / limite) : 0;
  
  return {
    valido,
    receita,
    limite,
    percentualLimite,
    proximoAoLimite: percentualLimite > 0.8,
    observacao: !valido 
      ? `Receita excede limite do regime ${regime.toUpperCase()}` 
      : percentualLimite > 0.8 
        ? 'Próximo ao limite do regime'
        : null
  };
};

/**
 * ================================
 * UTILITÁRIOS DE DEBUG
 * ================================
 */

/**
 * Cria um objeto de debug com informações de cálculo
 * @param {string} funcao - Nome da função que está calculando
 * @param {object} entrada - Parâmetros de entrada
 * @param {object} resultado - Resultado calculado
 * @returns {object} Objeto de debug
 */
export const criarDebugInfo = (funcao, entrada, resultado) => {
  return {
    funcao,
    timestamp: new Date().toISOString(),
    entrada: { ...entrada },
    resultado: typeof resultado === 'object' ? { ...resultado } : resultado,
    versao: '4.0'
  };
};

/**
 * ================================
 * EXPORTAÇÕES PARA COMPATIBILIDADE
 * ================================
 */

// Aliases para compatibilidade com código existente
export const formatarMoeda = formatCurrency;
export const formatarPercentual = formatPercent;
export const formatarNumero = formatNumber;

// Exportação default
export default {
  formatCurrency,
  formatPercent,
  formatNumber,
  validarCNPJ,
  validarCPF,
  calcularFatorR,
  determinarAnexoSimples,
  verificarSublimitesSimples,
  classificarPorteEmpresa,
  classificarFatorR,
  calcularDiferencaPercentual,
  encontrarFaixaTributaria,
  calcularAliquotaEfetiva,
  isDataPeriodoFiscalAtual,
  calcularMesesEntreDatas,
  validarLimiteRegime,
  criarDebugInfo
};