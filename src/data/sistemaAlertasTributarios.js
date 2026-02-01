// ============================================================
// SISTEMA DE ALERTAS TRIBUTÁRIOS INTELIGENTE
// Versão 1.0 - Especialista Tributário Senior
// Data: 01/02/2025
// ============================================================

import { calcMEI, calcSimplesTax, calcLucroPresumido, calcLucroReal } from './taxData_EXPANDIDO.js';

// ==============================================
// CONSTANTES DO SISTEMA
// ==============================================

const URGENCIA = {
  CRITICA: 'critica',
  ALTA: 'alta',
  MEDIA: 'media',
  BAIXA: 'baixa'
};

const TIPO_ALERTA = {
  LIMITE: 'limite',
  PRAZO: 'prazo',
  LEGISLACAO: 'legislacao',
  OPORTUNIDADE: 'oportunidade',
  COMPLIANCE: 'compliance',
  ECONOMIA: 'economia'
};

// ==============================================
// SISTEMA PRINCIPAL DE ALERTAS
// ==============================================

export class SistemaAlertasTributarios {
  constructor() {
    this.alertasAtivos = [];
    this.configuracao = {
      alertasLimite: {
        meiPercentual: 0.80, // Alerta quando atingir 80% do limite
        simplesPercentual: 0.85, // Alerta quando atingir 85% do limite
        presumidoLimite: 66000000 // R$ 66MM (85% de R$ 78MM)
      },
      prazosAntecedencia: {
        criticos: 5, // 5 dias
        importantes: 15, // 15 dias
        normais: 30 // 30 dias
      }
    };
  }

  // ==============================================
  // ALERTAS DE LIMITE
  // ==============================================

  verificarLimites(dadosEmpresa) {
    const alertasLimite = [];
    const { receitaAnual, receitaMensal, regime } = dadosEmpresa;

    // Verifica limite MEI
    if (regime === 'mei' || receitaAnual <= 81000) {
      const percentualUsado = receitaAnual / 81000;
      
      if (percentualUsado >= 0.95) {
        alertasLimite.push({
          id: 'mei_limite_critico',
          tipo: TIPO_ALERTA.LIMITE,
          urgencia: URGENCIA.CRITICA,
          titulo: '🚨 MEI LIMITE CRÍTICO',
          mensagem: `Receita anual: R$ ${receitaAnual.toLocaleString()} (${(percentualUsado*100).toFixed(1)}% do limite)`,
          acao: 'MIGRAÇÃO URGENTE para Simples Nacional',
          prazo: 'Até 31/12 para comunicar opção',
          impactoFinanceiro: this.calcularImpactoMigracao(receitaMensal, 'mei', 'simples'),
          dataAlerta: new Date(),
          prioridade: 1
        });
      } else if (percentualUsado >= this.configuracao.alertasLimite.meiPercentual) {
        alertasLimite.push({
          id: 'mei_limite_atencao',
          tipo: TIPO_ALERTA.LIMITE,
          urgencia: URGENCIA.ALTA,
          titulo: '⚠️ MEI PRÓXIMO AO LIMITE',
          mensagem: `Receita anual: R$ ${receitaAnual.toLocaleString()} (${(percentualUsado*100).toFixed(1)}% do limite)`,
          acao: 'Planejar migração para Simples Nacional',
          prazo: 'Monitorar mensalmente',
          impactoFinanceiro: this.calcularImpactoMigracao(receitaMensal, 'mei', 'simples'),
          dataAlerta: new Date(),
          prioridade: 2
        });
      }
    }

    // Verifica limite Simples Nacional
    if (regime === 'simples' || (receitaAnual > 81000 && receitaAnual <= 4800000)) {
      const percentualUsado = receitaAnual / 4800000;
      
      if (percentualUsado >= 0.95) {
        alertasLimite.push({
          id: 'simples_limite_critico',
          tipo: TIPO_ALERTA.LIMITE,
          urgencia: URGENCIA.CRITICA,
          titulo: '🚨 SIMPLES NACIONAL LIMITE CRÍTICO',
          mensagem: `Receita anual: R$ ${receitaAnual.toLocaleString()} (${(percentualUsado*100).toFixed(1)}% do limite)`,
          acao: 'MIGRAÇÃO URGENTE para Lucro Presumido ou Real',
          prazo: 'Até 31/12 para comunicar opção',
          impactoFinanceiro: this.calcularImpactoMigracao(receitaMensal, 'simples', 'presumido'),
          dataAlerta: new Date(),
          prioridade: 1
        });
      } else if (percentualUsado >= this.configuracao.alertasLimite.simplesPercentual) {
        alertasLimite.push({
          id: 'simples_limite_atencao',
          tipo: TIPO_ALERTA.LIMITE,
          urgencia: URGENCIA.ALTA,
          titulo: '⚠️ SIMPLES NACIONAL PRÓXIMO AO LIMITE',
          mensagem: `Receita anual: R$ ${receitaAnual.toLocaleString()} (${(percentualUsado*100).toFixed(1)}% do limite)`,
          acao: 'Planejar migração para Lucro Presumido ou Real',
          prazo: 'Revisar estratégia tributária',
          impactoFinanceiro: this.calcularImpactoMigracao(receitaMensal, 'simples', 'presumido'),
          dataAlerta: new Date(),
          prioridade: 2
        });
      }
    }

    // Verifica limite Lucro Presumido
    if (receitaAnual >= this.configuracao.alertasLimite.presumidoLimite) {
      alertasLimite.push({
        id: 'presumido_limite_atencao',
        tipo: TIPO_ALERTA.LIMITE,
        urgencia: URGENCIA.MEDIA,
        titulo: '📊 LUCRO PRESUMIDO PRÓXIMO AO LIMITE',
        mensagem: `Receita anual: R$ ${receitaAnual.toLocaleString()} - Próximo ao limite de R$ 78MM`,
        acao: 'Avaliar migração para Lucro Real',
        prazo: 'Análise semestral',
        impactoFinanceiro: this.calcularImpactoMigracao(receitaMensal, 'presumido', 'real'),
        dataAlerta: new Date(),
        prioridade: 3
      });
    }

    return alertasLimite;
  }

  // ==============================================
  // ALERTAS DE OPORTUNIDADES
  // ==============================================

  verificarOportunidades(dadosEmpresa) {
    const oportunidades = [];
    const { receitaAnual, receitaMensal, folhaAnual, tipoAtividade, regime } = dadosEmpresa;

    // Oportunidade CPRB
    const setoresCPRB = ['ti', 'call_center', 'hoteis', 'construcao_naval', 'industria_textil'];
    if (setoresCPRB.includes(tipoAtividade) && regime !== 'cprb') {
      const economiaCPRB = this.calcularEconomiaCPRB(receitaMensal, folhaAnual, tipoAtividade);
      
      if (economiaCPRB.economiaAnual > 50000) {
        oportunidades.push({
          id: 'oportunidade_cprb',
          tipo: TIPO_ALERTA.OPORTUNIDADE,
          urgencia: URGENCIA.ALTA,
          titulo: '💰 OPORTUNIDADE: CPRB',
          mensagem: `Setor ${tipoAtividade} elegível para CPRB`,
          acao: 'Migrar para CPRB (desoneração da folha)',
          prazo: 'Opção até 31/01 do ano seguinte',
          impactoFinanceiro: {
            economiaAnual: economiaCPRB.economiaAnual,
            percentualReducao: economiaCPRB.percentualReducao
          },
          dataAlerta: new Date(),
          prioridade: 1
        });
      }
    }

    // Oportunidade Fator R (Simples Nacional)
    if (regime === 'simples' && folhaAnual && receitaAnual) {
      const fatorR = folhaAnual / receitaAnual;
      
      if (fatorR >= 0.26 && fatorR < 0.28) {
        const aumentoNecessario = (receitaAnual * 0.28) - folhaAnual;
        const economiaAnexoIII = receitaAnual * 0.06; // Estimativa de economia
        
        if (economiaAnexoIII > aumentoNecessario * 2) {
          oportunidades.push({
            id: 'oportunidade_fator_r',
            tipo: TIPO_ALERTA.OPORTUNIDADE,
            urgencia: URGENCIA.MEDIA,
            titulo: '📈 OPORTUNIDADE: OTIMIZAÇÃO FATOR R',
            mensagem: `Fator R atual: ${(fatorR*100).toFixed(1)}% - Próximo dos 28%`,
            acao: `Aumentar folha em R$ ${aumentoNecessario.toLocaleString()} para atingir 28%`,
            prazo: 'Implementar até dezembro',
            impactoFinanceiro: {
              investimentoNecessario: aumentoNecessario,
              economiaAnual: economiaAnexoIII,
              roi: (economiaAnexoIII / aumentoNecessario).toFixed(1)
            },
            dataAlerta: new Date(),
            prioridade: 2
          });
        }
      }
    }

    // Oportunidade MEI para pequenos negócios
    if (receitaAnual <= 81000 && regime !== 'mei') {
      const economiaVsME = this.calcularEconomiaMEI(receitaMensal, regime);
      
      if (economiaVsME.economiaAnual > 10000) {
        oportunidades.push({
          id: 'oportunidade_mei',
          tipo: TIPO_ALERTA.OPORTUNIDADE,
          urgencia: URGENCIA.MEDIA,
          titulo: '🎯 OPORTUNIDADE: MIGRAÇÃO PARA MEI',
          mensagem: `Receita permite enquadramento como MEI`,
          acao: 'Migrar para MEI (máxima simplificação)',
          prazo: 'Opção até 31/01 do ano seguinte',
          impactoFinanceiro: economiaVsME,
          dataAlerta: new Date(),
          prioridade: 3
        });
      }
    }

    return oportunidades;
  }

  // ==============================================
  // ALERTAS DE PRAZOS
  // ==============================================

  verificarPrazos() {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const prazos = [];

    // Prazos fixos importantes
    const prazosFixos = [
      {
        data: new Date(anoAtual, 0, 31), // 31 de janeiro
        titulo: 'OPÇÃO DE REGIME TRIBUTÁRIO',
        descricao: 'Prazo final para optar por regime tributário',
        urgencia: URGENCIA.CRITICA,
        tipo: TIPO_ALERTA.PRAZO
      },
      {
        data: new Date(anoAtual, 2, 31), // 31 de março
        titulo: 'DIPJ - DECLARAÇÃO DE IR PESSOA JURÍDICA',
        descricao: 'Prazo para entrega da DIPJ (Lucro Presumido/Real)',
        urgencia: URGENCIA.CRITICA,
        tipo: TIPO_ALERTA.PRAZO
      },
      {
        data: new Date(anoAtual, 4, 31), // 31 de maio
        titulo: 'DEFIS - SIMPLES NACIONAL',
        descricao: 'Prazo para entrega da DEFIS',
        urgencia: URGENCIA.CRITICA,
        tipo: TIPO_ALERTA.PRAZO
      },
      {
        data: new Date(anoAtual, 4, 31), // 31 de maio
        titulo: 'RAIS - RELAÇÃO ANUAL DE INFORMAÇÕES SOCIAIS',
        descricao: 'Prazo para entrega da RAIS',
        urgencia: URGENCIA.ALTA,
        tipo: TIPO_ALERTA.PRAZO
      }
    ];

    // Verifica cada prazo
    prazosFixos.forEach(prazo => {
      const diasRestantes = Math.ceil((prazo.data - hoje) / (1000 * 60 * 60 * 24));
      
      if (diasRestantes <= this.configuracao.prazosAntecedencia.criticos && diasRestantes > 0) {
        prazos.push({
          id: `prazo_${prazo.titulo.toLowerCase().replace(/\s/g, '_')}`,
          tipo: prazo.tipo,
          urgencia: URGENCIA.CRITICA,
          titulo: `🚨 PRAZO CRÍTICO: ${prazo.titulo}`,
          mensagem: `${diasRestantes} dias restantes`,
          acao: prazo.descricao,
          prazo: prazo.data.toLocaleDateString('pt-BR'),
          dataAlerta: new Date(),
          prioridade: 1
        });
      } else if (diasRestantes <= this.configuracao.prazosAntecedencia.importantes && diasRestantes > 0) {
        prazos.push({
          id: `prazo_${prazo.titulo.toLowerCase().replace(/\s/g, '_')}`,
          tipo: prazo.tipo,
          urgencia: URGENCIA.ALTA,
          titulo: `⚠️ PRAZO IMPORTANTE: ${prazo.titulo}`,
          mensagem: `${diasRestantes} dias restantes`,
          acao: prazo.descricao,
          prazo: prazo.data.toLocaleDateString('pt-BR'),
          dataAlerta: new Date(),
          prioridade: 2
        });
      }
    });

    // Prazos mensais (DAS, DARF, GPS)
    const diaAtual = hoje.getDate();
    if (diaAtual >= 15 && diaAtual <= 20) {
      prazos.push({
        id: 'prazo_mensal_das_darf',
        tipo: TIPO_ALERTA.PRAZO,
        urgencia: URGENCIA.ALTA,
        titulo: '📅 PRAZO MENSAL: DAS/DARF/GPS',
        mensagem: 'Vencimento até dia 20',
        acao: 'Recolher impostos e contribuições mensais',
        prazo: `20/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${anoAtual}`,
        dataAlerta: new Date(),
        prioridade: 2
      });
    }

    return prazos;
  }

  // ==============================================
  // ALERTAS DE MUDANÇAS NA LEGISLAÇÃO
  // ==============================================

  verificarMudancasLegislacao() {
    // Em uma implementação real, isso seria integrado com APIs da Receita Federal
    const mudancas = [
      {
        id: 'reforma_tributaria_2025',
        tipo: TIPO_ALERTA.LEGISLACAO,
        urgencia: URGENCIA.MEDIA,
        titulo: '📜 REFORMA TRIBUTÁRIA EM ANDAMENTO',
        mensagem: 'Emenda Constitucional 132/2023 - Implementação gradual até 2033',
        acao: 'Acompanhar regulamentações e se preparar para mudanças',
        prazo: 'Implementação gradual 2025-2033',
        dataAlerta: new Date(),
        prioridade: 3,
        fontes: [
          'https://www.gov.br/receitafederal/pt-br/assuntos/reforma-tributaria',
          'Emenda Constitucional 132/2023'
        ]
      },
      {
        id: 'atualizacao_simples_2025',
        tipo: TIPO_ALERTA.LEGISLACAO,
        urgencia: URGENCIA.BAIXA,
        titulo: '🔄 ATUALIZAÇÕES SIMPLES NACIONAL 2025',
        mensagem: 'IN RFB 2.138/2024 - Novas regras e procedimentos',
        acao: 'Revisar procedimentos internos conforme nova IN',
        prazo: 'Vigência imediata',
        dataAlerta: new Date(),
        prioridade: 4,
        fontes: [
          'IN RFB 2.138/2024'
        ]
      }
    ];

    return mudancas;
  }

  // ==============================================
  // MÉTODOS AUXILIARES DE CÁLCULO
  // ==============================================

  calcularImpactoMigracao(receitaMensal, regimeAtual, regimeNovo) {
    try {
      let custoAtual = 0;
      let custoNovo = 0;

      // Calcula custo atual
      switch (regimeAtual) {
        case 'mei':
          const mei = calcMEI(receitaMensal);
          custoAtual = mei.dasFixo;
          break;
        case 'simples':
          const simples = calcSimplesTax(receitaMensal * 12, 'III');
          custoAtual = simples.valorMensal || 0;
          break;
        case 'presumido':
          const presumido = calcLucroPresumido(receitaMensal);
          custoAtual = presumido.totalMensal || 0;
          break;
      }

      // Calcula custo novo
      switch (regimeNovo) {
        case 'simples':
          const simplesNovo = calcSimplesTax(receitaMensal * 12, 'III');
          custoNovo = simplesNovo.valorMensal || 0;
          break;
        case 'presumido':
          const presumidoNovo = calcLucroPresumido(receitaMensal);
          custoNovo = presumidoNovo.totalMensal || 0;
          break;
        case 'real':
          const realNovo = calcLucroReal(receitaMensal, receitaMensal * 0.7);
          custoNovo = realNovo.totalMensal || 0;
          break;
      }

      return {
        custoAtualMensal: custoAtual,
        custoNovoMensal: custoNovo,
        diferencaMensal: custoNovo - custoAtual,
        diferencaAnual: (custoNovo - custoAtual) * 12,
        percentualVariacao: custoAtual > 0 ? ((custoNovo - custoAtual) / custoAtual) * 100 : 0
      };
    } catch (error) {
      return {
        erro: 'Erro no cálculo de migração',
        custoAtualMensal: 0,
        custoNovoMensal: 0,
        diferencaMensal: 0,
        diferencaAnual: 0
      };
    }
  }

  calcularEconomiaCPRB(receitaMensal, folhaAnual, tipoAtividade) {
    const aliquotasCPRB = {
      ti: 0.045,
      call_center: 0.02,
      hoteis: 0.02,
      construcao_naval: 0.02,
      industria_textil: 0.015
    };

    const aliquotaCPRB = aliquotasCPRB[tipoAtividade] || 0.02;
    const folhaMensal = folhaAnual / 12;

    const sistemaTradicional = folhaMensal * 0.20; // 20% INSS patronal
    const sistemaCPRB = receitaMensal * aliquotaCPRB;

    return {
      sistemaTradicional: sistemaTradicional * 12,
      sistemaCPRB: sistemaCPRB * 12,
      economiaAnual: (sistemaTradicional - sistemaCPRB) * 12,
      percentualReducao: ((sistemaTradicional - sistemaCPRB) / sistemaTradicional) * 100
    };
  }

  calcularEconomiaMEI(receitaMensal, regimeAtual) {
    try {
      const custoMEI = 80.90; // DAS MEI 2025
      let custoAtual = 0;

      switch (regimeAtual) {
        case 'simples':
          const simples = calcSimplesTax(receitaMensal * 12, 'III');
          custoAtual = simples.valorMensal || 0;
          break;
        case 'presumido':
          const presumido = calcLucroPresumido(receitaMensal);
          custoAtual = presumido.totalMensal || 0;
          break;
      }

      return {
        custoAtualMensal: custoAtual,
        custoMEIMensal: custoMEI,
        economiaAnual: (custoAtual - custoMEI) * 12,
        percentualReducao: custoAtual > 0 ? ((custoAtual - custoMEI) / custoAtual) * 100 : 0
      };
    } catch (error) {
      return { erro: 'Erro no cálculo MEI' };
    }
  }

  // ==============================================
  // MÉTODO PRINCIPAL
  // ==============================================

  gerarAlertas(dadosEmpresa) {
    const todosAlertas = [
      ...this.verificarLimites(dadosEmpresa),
      ...this.verificarOportunidades(dadosEmpresa),
      ...this.verificarPrazos(),
      ...this.verificarMudancasLegislacao()
    ];

    // Ordena por prioridade e urgência
    todosAlertas.sort((a, b) => {
      const urgenciaOrdem = { critica: 4, alta: 3, media: 2, baixa: 1 };
      return urgenciaOrdem[b.urgencia] - urgenciaOrdem[a.urgencia] || a.prioridade - b.prioridade;
    });

    this.alertasAtivos = todosAlertas;
    return todosAlertas;
  }

  // ==============================================
  // MÉTODOS DE FILTRAGEM
  // ==============================================

  obterAlertasCriticos() {
    return this.alertasAtivos.filter(alerta => alerta.urgencia === URGENCIA.CRITICA);
  }

  obterAlertasPorTipo(tipo) {
    return this.alertasAtivos.filter(alerta => alerta.tipo === tipo);
  }

  obterOportunidades() {
    return this.alertasAtivos.filter(alerta => alerta.tipo === TIPO_ALERTA.OPORTUNIDADE);
  }

  // ==============================================
  // RELATÓRIOS E ESTATÍSTICAS
  // ==============================================

  gerarRelatorioAlertas() {
    const estatisticas = {
      total: this.alertasAtivos.length,
      porUrgencia: {
        critica: this.alertasAtivos.filter(a => a.urgencia === URGENCIA.CRITICA).length,
        alta: this.alertasAtivos.filter(a => a.urgencia === URGENCIA.ALTA).length,
        media: this.alertasAtivos.filter(a => a.urgencia === URGENCIA.MEDIA).length,
        baixa: this.alertasAtivos.filter(a => a.urgencia === URGENCIA.BAIXA).length
      },
      porTipo: {
        limite: this.alertasAtivos.filter(a => a.tipo === TIPO_ALERTA.LIMITE).length,
        prazo: this.alertasAtivos.filter(a => a.tipo === TIPO_ALERTA.PRAZO).length,
        oportunidade: this.alertasAtivos.filter(a => a.tipo === TIPO_ALERTA.OPORTUNIDADE).length,
        legislacao: this.alertasAtivos.filter(a => a.tipo === TIPO_ALERTA.LEGISLACAO).length
      },
      potencialEconomia: this.alertasAtivos
        .filter(a => a.impactoFinanceiro?.economiaAnual)
        .reduce((total, a) => total + (a.impactoFinanceiro.economiaAnual || 0), 0)
    };

    return {
      dataRelatorio: new Date().toISOString(),
      estatisticas,
      alertas: this.alertasAtivos
    };
  }
}

// ==============================================
// FUNÇÕES UTILITÁRIAS
// ==============================================

export function criarSistemaAlertas() {
  return new SistemaAlertasTributarios();
}

export function formatarAlerta(alerta) {
  const iconesUrgencia = {
    critica: '🚨',
    alta: '⚠️',
    media: '📊',
    baixa: '💡'
  };

  return {
    ...alerta,
    icone: iconesUrgencia[alerta.urgencia],
    dataFormatada: alerta.dataAlerta.toLocaleDateString('pt-BR'),
    impactoFormatado: alerta.impactoFinanceiro ? 
      `R$ ${alerta.impactoFinanceiro.economiaAnual?.toLocaleString() || 0}/ano` : 
      'N/A'
  };
}

export function gerarNotificacaoWhatsApp(alerta) {
  return `
*${alerta.icone || '📊'} ${alerta.titulo}*

${alerta.mensagem}

*Ação necessária:* ${alerta.acao}
*Prazo:* ${alerta.prazo}

${alerta.impactoFinanceiro ? 
  `*Impacto:* R$ ${alerta.impactoFinanceiro.economiaAnual?.toLocaleString() || 0}/ano` : 
  ''}

_Sistema de Alertas Tributários_
`.trim();
}

// ==============================================
// CONFIGURAÇÃO DE MONITORAMENTO AUTOMÁTICO
// ==============================================

export class MonitoramentoAutomatico {
  constructor(sistemaAlertas) {
    this.sistemaAlertas = sistemaAlertas;
    this.intervalos = new Map();
    this.callbacks = new Map();
  }

  iniciarMonitoramento(dadosEmpresa, callbackAlertas, intervaloMinutos = 1440) { // Default: 24h
    const intervalId = setInterval(() => {
      const alertas = this.sistemaAlertas.gerarAlertas(dadosEmpresa);
      const alertasCriticos = alertas.filter(a => a.urgencia === URGENCIA.CRITICA);
      
      if (alertasCriticos.length > 0 && callbackAlertas) {
        callbackAlertas(alertasCriticos);
      }
    }, intervaloMinutos * 60 * 1000);

    this.intervalos.set('monitoramento_principal', intervalId);
    return intervalId;
  }

  pararMonitoramento(intervalId) {
    if (this.intervalos.has(intervalId)) {
      clearInterval(this.intervalos.get(intervalId));
      this.intervalos.delete(intervalId);
    }
  }

  configurarAlertasPorEmail(emailConfig) {
    // Placeholder para integração com sistema de e-mail
    console.log('Configuração de e-mail:', emailConfig);
  }
}

// ==============================================
// EXPORTAÇÕES
// ==============================================

export { URGENCIA, TIPO_ALERTA };

export default SistemaAlertasTributarios;

console.log('✅ Sistema de Alertas Tributários carregado');
console.log('🚨 Monitoramento inteligente ativo');
console.log('📊 Alertas por limite, prazo, oportunidades e legislação');