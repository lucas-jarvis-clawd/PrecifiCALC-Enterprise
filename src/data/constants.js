/**
 * ============================================
 * CONSTANTES TRIBUTÁRIAS BRASILEIRAS - 2026
 * ============================================
 * 
 * Valores oficiais atualizados conforme legislação vigente
 * Última atualização: 05/02/2026
 * 
 * @author Backend Architect - PrecifiCALC Masterpiece
 * @version 4.0
 */

/**
 * Valores base para cálculos tributários em 2026
 */
export const VALORES_2026 = Object.freeze({
  salarioMinimo: 1621.00,
  tetoINSS: 8475.55,
  valorMeiInss: 81.05,
  
  // Limites por regime
  limiteMEI: 81_000,
  limiteMEICaminhoneiro: 251_600,
  limiteSimples: 4_800_000,
  limiteLucroPresumido: 78_000_000,
  
  // Faixas INSS Pessoa Física 2026
  faixasINSS: [
    { de: 0, ate: 1621.00, aliquota: 0.075, deducao: 0 },
    { de: 1621.01, ate: 2902.84, aliquota: 0.09, deducao: 121.58 },
    { de: 2902.85, ate: 4354.27, aliquota: 0.12, deducao: 208.86 },
    { de: 4354.28, ate: 8475.55, aliquota: 0.14, deducao: 296.20 }
  ]
});

/**
 * Alíquotas padrão por regime tributário
 */
export const ALIQUOTAS = Object.freeze({
  mei: {
    inss: 81.05,
    issServicos: 5.00,
    icmsComercio: 1.00
  },
  
  lucroPresumido: {
    irpj: 0.15,
    irpjAdicional: 0.10,
    csll: 0.09,
    csllFinanceiras: 0.15,
    pis: 0.0065,
    cofins: 0.03
  },
  
  lucroReal: {
    irpj: 0.15,
    irpjAdicional: 0.10,
    csll: 0.09,
    csllFinanceiras: 0.20,
    csllSeguradoras: 0.15,
    pis: 0.0165,
    cofins: 0.076 // CORRIGIDO: era 0.0765
  },
  
  encargos: {
    inssPatronal: 0.20,
    fgts: 0.08,
    sistemaS: 0.058,
    salarioEducacao: 0.025,
    ratMinimo: 0.01,
    ratMedio: 0.02,
    ratMaximo: 0.03
  },
  
  proLabore: {
    inss: 0.11,
    inssPatronal: 0.20,
    inssPatronalSimples: 0 // No Simples não há INSS patronal sobre pró-labore
  }
});

/**
 * Presunções de lucro por atividade (Lucro Presumido)
 */
export const PRESUNCOES_LUCRO = Object.freeze({
  servicos: { irpj: 0.32, csll: 0.32, descricao: 'Serviços em geral' },
  comercio: { irpj: 0.08, csll: 0.12, descricao: 'Comércio e indústria' },
  industria: { irpj: 0.08, csll: 0.12, descricao: 'Atividade industrial' },
  transporteCarga: { irpj: 0.08, csll: 0.12, descricao: 'Transporte de carga' },
  transportePassageiros: { irpj: 0.16, csll: 0.12, descricao: 'Transporte de passageiros' },
  servHospitalares: { irpj: 0.08, csll: 0.12, descricao: 'Serviços hospitalares' },
  revendaCombustiveis: { irpj: 0.016, csll: 0.12, descricao: 'Revenda de combustíveis' },
  intermediacaoNegocios: { irpj: 0.32, csll: 0.32, descricao: 'Intermediação de negócios' },
  construcaoCivil: { irpj: 0.32, csll: 0.32, descricao: 'Construção civil (serviços)' },
  factoring: { irpj: 0.32, csll: 0.32, descricao: 'Factoring' }
});

/**
 * Reoneração gradual CPRB - Lei 14.973/2024
 * Cronograma de transição 2025-2028
 */
export const CRONOGRAMA_REONERACAO = Object.freeze({
  2025: { fatorCPRB: 0.80, cppFolha: 0.05, descricao: '80% CPRB + 5% CPP' },
  2026: { fatorCPRB: 0.60, cppFolha: 0.10, descricao: '60% CPRB + 10% CPP' },
  2027: { fatorCPRB: 0.40, cppFolha: 0.15, descricao: '40% CPRB + 15% CPP' },
  2028: { fatorCPRB: 0.00, cppFolha: 0.20, descricao: 'CPRB extinta, 20% CPP' }
});

/**
 * Limites para adicional de IRPJ
 */
export const LIMITES_IRPJ = Object.freeze({
  adicionalMensal: 20_000,
  adicionalTrimestral: 60_000,
  adicionalAnual: 240_000
});

/**
 * Faixas ISS por município (principais capitais)
 */
export const ISS_MUNICIPIOS = Object.freeze({
  'São Paulo/SP': { aliquota: 0.02, obs: 'Maioria dos serviços' },
  'Rio de Janeiro/RJ': { aliquota: 0.05, obs: 'Alíquota máxima' },
  'Brasília/DF': { aliquota: 0.05, obs: 'Alíquota máxima' },
  'Salvador/BA': { aliquota: 0.05, obs: 'Alíquota máxima' },
  'Belo Horizonte/MG': { aliquota: 0.05, obs: 'Alíquota máxima' },
  'Curitiba/PR': { aliquota: 0.05, obs: 'Maioria dos serviços' },
  'Porto Alegre/RS': { aliquota: 0.05, obs: 'Alíquota máxima' }
});

/**
 * Alíquotas IRRF por tipo de serviço
 */
export const IRRF_SERVICOS = Object.freeze({
  baixa: {
    aliquota: 0.015,
    atividades: ['limpeza', 'conservacao', 'manutencao', 'seguranca', 'vigilancia']
  },
  media: {
    aliquota: 0.03,
    atividades: ['advocacia', 'engenharia', 'arquitetura', 'auditoria', 'consultoria']
  },
  alta: {
    aliquota: 0.0465,
    atividades: ['medicina', 'odontologia', 'psicologia', 'fisioterapia']
  }
});

/**
 * Sublimites do Simples Nacional
 */
export const SUBLIMITES_SIMPLES = Object.freeze({
  issIcms: 3_600_000,
  geral: 4_800_000,
  mensalMedio: 400_000
});

/**
 * Benefícios trabalhistas médios
 */
export const BENEFICIOS_MEDIOS = Object.freeze({
  valeTransporte: { percentual: 0.06, limite: 0.06 },
  valeRefeicao: { valor: 25.00, desconto: 0.20 },
  valeAlimentacao: { valor: 350.00, desconto: 0.20 },
  assistenciaMedica: { valor: 200.00, desconto: false },
  seguroVida: { valor: 15.00, desconto: false }
});

/**
 * Atividades vedadas por regime
 */
export const ATIVIDADES_VEDADAS = Object.freeze({
  mei: [
    'bancos e financeiras',
    'factoring',
    'corretagem de valores',
    'advocacia',
    'medicina',
    'engenharia',
    'arquitetura'
  ],
  
  simples: [
    'bancos comerciais',
    'factoring',
    'administração de consórcios',
    'cooperativas de crédito',
    'loteamento e incorporação'
  ],
  
  lucroPresumido: [
    'bancos comerciais',
    'caixas econômicas',
    'seguradoras',
    'entidades de previdência',
    'empresas imobiliárias (compra para revenda)'
  ]
});

/**
 * Intervalos de Fator R para classificação
 */
export const FATOR_R = Object.freeze({
  limiteAnexoV: 0.28, // ≥ 28% migra para Anexo III
  limiteAnexoIII: 0.28,
  classificacoes: {
    baixo: { min: 0, max: 0.15, descricao: 'Baixa participação da folha' },
    medio: { min: 0.15, max: 0.35, descricao: 'Participação média da folha' },
    alto: { min: 0.35, max: 1.0, descricao: 'Alta participação da folha' }
  }
});

/**
 * Multiplicadores de encargos por tipo
 */
export const MULTIPLICADORES = Object.freeze({
  cltCompleto: 1.8, // CLT com todos os encargos
  cltBasico: 1.6,   // CLT sem benefícios
  terceirizado: 1.8, // Incluindo margem da terceirizada
  proLabore: 1.11,   // Apenas INSS do sócio
  autonomo: 1.275    // INSS + ISS médio
});

/**
 * Versões e compatibilidade
 */
export const VERSIONING = Object.freeze({
  versaoAtual: '4.0',
  dataAtualizacao: '2026-02-05',
  compatibilidade: {
    taxDataV3: true,
    sistemaAlertas: true,
    novoCodigo: true
  },
  proximaRevisao: '2026-03-01'
});

// Exportação default para compatibilidade
export default {
  VALORES_2026,
  ALIQUOTAS,
  PRESUNCOES_LUCRO,
  CRONOGRAMA_REONERACAO,
  LIMITES_IRPJ,
  ISS_MUNICIPIOS,
  IRRF_SERVICOS,
  SUBLIMITES_SIMPLES,
  BENEFICIOS_MEDIOS,
  ATIVIDADES_VEDADAS,
  FATOR_R,
  MULTIPLICADORES,
  VERSIONING
};