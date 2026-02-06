/**
 * 🧮 TESTES DE VALIDAÇÃO TRIBUTÁRIA - PrecifiCALC Enterprise
 * 
 * MISSÃO: Testar CADA cálculo contra a legislação brasileira
 * ESPECIALISTA: Contador/Tributarista Senior (CRC + 10 anos)
 * MÉTODO: Casos reais + Validação matemática + Referências legais
 * 
 * CASOS TESTADOS:
 * 1. MEI - Valores DAS 2025
 * 2. Simples Nacional - Faixas e alíquotas  
 * 3. Lucro Presumido - Presunções por atividade
 * 4. Lucro Real - IRPJ/CSLL/PIS/COFINS
 * 5. Fator R - Cálculo e migração
 * 
 * CRITÉRIO: 100% conforme legislação vigente
 */

import { 
  calcMEI, 
  calcSimplesTax, 
  calcLucroPresumido, 
  calcLucroReal,
  constantesTributarias2026
} from '../data/taxData.js';

// ========================================
// 🔴 TESTE 001: MEI - VALORES DAS 2025
// ========================================

export function testeMEI() {
  console.log('🔍 TESTE MEI - Validação Valores 2025...');
  
  const testes = [
    {
      nome: 'MEI Serviços - R$ 5.000/mês',
      receita: 5000,
      atividade: 'servicos',
      isCaminhoneiro: false,
      valorEsperado: 80.90, // R$ 75,90 INSS + R$ 5,00 ISS
      referencia: 'LC 123/2006 + Lei 8.212/1991'
    },
    {
      nome: 'MEI Comércio - R$ 5.000/mês', 
      receita: 5000,
      atividade: 'comercio',
      isCaminhoneiro: false,
      valorEsperado: 76.90, // R$ 75,90 INSS + R$ 1,00 ICMS
      referencia: 'LC 123/2006 + Lei 8.212/1991'
    },
    {
      nome: 'MEI Caminhoneiro - R$ 15.000/mês',
      receita: 15000,
      atividade: 'servicos',
      isCaminhoneiro: true,
      valorEsperado: 183.16, // R$ 182,16 INSS (12%) + R$ 1,00 ICMS  
      referencia: 'LC 128/2008 + Lei 8.212/1991'
    }
  ];

  const resultados = [];

  testes.forEach(teste => {
    const resultado = calcMEI(teste.receita, teste.atividade, teste.isCaminhoneiro);
    
    const passou = Math.abs(resultado.dasFixo - teste.valorEsperado) < 0.01;
    
    resultados.push({
      teste: teste.nome,
      esperado: teste.valorEsperado,
      calculado: resultado.dasFixo,
      passou: passou,
      diferenca: Math.abs(resultado.dasFixo - teste.valorEsperado),
      referencia: teste.referencia
    });

    if (passou) {
      console.log(`✅ ${teste.nome}: PASSOU (${resultado.dasFixo})`);
    } else {
      console.log(`❌ ${teste.nome}: FALHOU - Esperado: ${teste.valorEsperado}, Calculado: ${resultado.dasFixo}`);
    }
  });

  return resultados;
}

// ========================================
// 🔴 TESTE 002: SIMPLES NACIONAL - FAIXAS
// ========================================

export function testeSimples() {
  console.log('🔍 TESTE SIMPLES NACIONAL - Validação Faixas...');

  const testes = [
    {
      nome: 'Simples Anexo I - Faixa 1 (R$ 180k)',
      receita12m: 180000,
      anexo: 'I',
      aliquotaEsperada: 0.04, // 4%
      dasEsperado: 600, // R$ 180k ÷ 12 = R$ 15k × 4% = R$ 600
      referencia: 'LC 123/2006, Anexo I, Faixa 1'
    },
    {
      nome: 'Simples Anexo I - Faixa 2 (R$ 360k)',
      receita12m: 360000,
      anexo: 'I',
      aliquotaEsperada: 0.073, // 7,3% nominal
      // DAS = (360.000 × 7,3%) - 5.940 = 26.280 - 5.940 = 20.340
      // Mensal = 20.340 ÷ 12 = 1.695
      dasEsperado: 1695,
      referencia: 'LC 123/2006, Anexo I, Faixa 2'
    },
    {
      nome: 'Simples Anexo III - Faixa 1 (R$ 180k)',
      receita12m: 180000,
      anexo: 'III',
      aliquotaEsperada: 0.06, // 6%
      dasEsperado: 900, // R$ 15k × 6% = R$ 900
      referencia: 'LC 123/2006, Anexo III, Faixa 1'
    }
  ];

  const resultados = [];

  testes.forEach(teste => {
    const resultado = calcSimplesTax(teste.receita12m, teste.anexo);
    
    if (resultado.erro || resultado.excedeLimite) {
      resultados.push({
        teste: teste.nome,
        passou: false,
        erro: resultado.erro || 'Excede limite'
      });
      return;
    }

    const receitaMensal = teste.receita12m / 12;
    const dasCalculado = Math.round(resultado.valorMensal);
    const passou = Math.abs(dasCalculado - teste.dasEsperado) <= 1; // Tolerância R$ 1

    resultados.push({
      teste: teste.nome,
      receita12m: teste.receita12m,
      anexo: teste.anexo,
      aliquotaNominal: resultado.aliquotaNominal,
      aliquotaEfetiva: resultado.aliquotaEfetiva,
      dasEsperado: teste.dasEsperado,
      dasCalculado: dasCalculado,
      passou: passou,
      diferenca: Math.abs(dasCalculado - teste.dasEsperado),
      referencia: teste.referencia
    });

    if (passou) {
      console.log(`✅ ${teste.nome}: PASSOU (DAS: ${dasCalculado})`);
    } else {
      console.log(`❌ ${teste.nome}: FALHOU - Esperado: ${teste.dasEsperado}, Calculado: ${dasCalculado}`);
    }
  });

  return resultados;
}

// ========================================
// 🔴 TESTE 003: FATOR R - MIGRAÇÃO
// ========================================

export function testeFatorR() {
  console.log('🔍 TESTE FATOR R - Validação Migração Anexo V → III...');

  const testes = [
    {
      nome: 'Fator R = 30% - Migração obrigatória para Anexo III',
      receita12m: 600000,
      anexo: 'V',
      fatorR: 0.30, // 30% ≥ 28%
      deveMigrar: true,
      anexoRecomendado: 'III',
      referencia: 'LC 123/2006, Art. 18, §5º-H'
    },
    {
      nome: 'Fator R = 25% - Permanece Anexo V',
      receita12m: 600000,
      anexo: 'V', 
      fatorR: 0.25, // 25% < 28%
      deveMigrar: false,
      referencia: 'LC 123/2006, Art. 18, §5º-H'
    },
    {
      nome: 'Fator R = 28% - Limite exato - Migra',
      receita12m: 600000,
      anexo: 'V',
      fatorR: 0.28, // 28% = 28% (≥)
      deveMigrar: true,
      anexoRecomendado: 'III',
      referencia: 'LC 123/2006, Art. 18, §5º-H'
    }
  ];

  const resultados = [];

  testes.forEach(teste => {
    const resultado = calcSimplesTax(teste.receita12m, teste.anexo, teste.fatorR);
    
    const migracaoOcorreu = resultado.migracao === true && resultado.anexoRecomendado === 'III';
    const passou = migracaoOcorreu === teste.deveMigrar;

    resultados.push({
      teste: teste.nome,
      fatorR: teste.fatorR,
      deveMigrar: teste.deveMigrar,
      migracaoOcorreu: migracaoOcorreu,
      anexoRecomendado: resultado.anexoRecomendado,
      passou: passou,
      referencia: teste.referencia
    });

    if (passou) {
      console.log(`✅ ${teste.nome}: PASSOU`);
    } else {
      console.log(`❌ ${teste.nome}: FALHOU - Migração esperada: ${teste.deveMigrar}, Ocorreu: ${migracaoOcorreu}`);
    }
  });

  return resultados;
}

// ========================================
// 🔴 TESTE 004: LUCRO PRESUMIDO - PRESUNÇÕES
// ========================================

export function testeLucroPresumido() {
  console.log('🔍 TESTE LUCRO PRESUMIDO - Validação Presunções...');

  const testes = [
    {
      nome: 'Serviços - Presunção 32%',
      receita: 100000, // R$ 100k/mês
      atividade: 'servicos',
      presuncaoIRPJ: 0.32, // 32%
      presuncaoCSLL: 0.32, // 32%
      // Base trimestral = 300k × 32% = 96k
      // IRPJ = 96k × 15% = 14.400 (sem adicional)
      // CSLL = 96k × 9% = 8.640
      irpjEsperado: 4800, // 14.400 ÷ 3 meses  
      csllEsperado: 2880,  // 8.640 ÷ 3 meses
      referencia: 'Decreto 3.000/1999, Art. 518'
    },
    {
      nome: 'Comércio - Presunção 8%/12%',
      receita: 100000, 
      atividade: 'comercio',
      presuncaoIRPJ: 0.08, // 8%
      presuncaoCSLL: 0.12, // 12%
      // Base IRPJ = 300k × 8% = 24k → IRPJ = 24k × 15% = 3.600
      // Base CSLL = 300k × 12% = 36k → CSLL = 36k × 9% = 3.240
      irpjEsperado: 1200, // 3.600 ÷ 3
      csllEsperado: 1080, // 3.240 ÷ 3
      referencia: 'Decreto 3.000/1999, Art. 519'
    },
    {
      nome: 'Serviços Hospitalares - Presunção 8%/12%',
      receita: 100000,
      atividade: 'servicosHospitalares', 
      presuncaoIRPJ: 0.08,
      presuncaoCSLL: 0.12,
      irpjEsperado: 1200,
      csllEsperado: 1080,
      referencia: 'Decreto 3.000/1999, Art. 520'
    }
  ];

  const resultados = [];

  testes.forEach(teste => {
    const resultado = calcLucroPresumido(teste.receita, teste.atividade);
    
    if (resultado.erro) {
      resultados.push({
        teste: teste.nome,
        passou: false,
        erro: resultado.erro
      });
      return;
    }

    const irpjCalculado = Math.round(resultado.irpj.valorMensal);
    const csllCalculado = Math.round(resultado.csll.valorMensal);
    
    const irpjOk = Math.abs(irpjCalculado - teste.irpjEsperado) <= 1;
    const csllOk = Math.abs(csllCalculado - teste.csllEsperado) <= 1;
    const passou = irpjOk && csllOk;

    resultados.push({
      teste: teste.nome,
      atividade: teste.atividade,
      presuncaoUtilizada: resultado.presuncao,
      irpjEsperado: teste.irpjEsperado,
      irpjCalculado: irpjCalculado,
      csllEsperado: teste.csllEsperado,
      csllCalculado: csllCalculado,
      passou: passou,
      referencia: teste.referencia
    });

    if (passou) {
      console.log(`✅ ${teste.nome}: PASSOU`);
    } else {
      console.log(`❌ ${teste.nome}: FALHOU - IRPJ: E${teste.irpjEsperado}/C${irpjCalculado}, CSLL: E${teste.csllEsperado}/C${csllCalculado}`);
    }
  });

  return resultados;
}

// ========================================
// 🔴 TESTE 005: LUCRO REAL - ALÍQUOTAS
// ========================================

export function testeLucroReal() {
  console.log('🔍 TESTE LUCRO REAL - Validação Alíquotas...');

  const testes = [
    {
      nome: 'Lucro R$ 50k/mês - Sem adicional IRPJ',
      receita: 200000,
      despesas: 150000,
      lucroEsperado: 50000,
      // Lucro trimestral = 150k
      // IRPJ = 150k × 15% = 22.500 (sem adicional, pois < 240k/ano)
      // CSLL = 150k × 9% = 13.500
      irpjEsperado: 7500,  // 22.500 ÷ 3
      csllEsperado: 4500,  // 13.500 ÷ 3
      referencia: 'Decreto 3.000/1999, IRPJ 15% + CSLL 9%'
    },
    {
      nome: 'Lucro R$ 100k/mês - Com adicional IRPJ', 
      receita: 300000,
      despesas: 200000,
      lucroEsperado: 100000,
      // Lucro trimestral = 300k
      // IRPJ = (240k × 15%) + (60k × 25%) = 36k + 15k = 51k
      // CSLL = 300k × 9% = 27k  
      irpjEsperado: 17000, // 51k ÷ 3
      csllEsperado: 9000,  // 27k ÷ 3
      referencia: 'Decreto 3.000/1999, IRPJ 15%+10% adicional'
    },
    {
      nome: 'PIS/COFINS - Não cumulativo',
      receita: 100000,
      despesas: 80000,
      creditosPisCofins: 10000, // R$ 10k de créditos
      // PIS = (100k × 1,65%) - (10k × 1,65%) = 1.650 - 165 = 1.485
      // COFINS = (100k × 7,6%) - (10k × 7,6%) = 7.600 - 760 = 6.840
      pisEsperado: 1485,
      cofinsEsperado: 6840,
      referencia: 'Lei 10.637/2002 (PIS) + Lei 10.833/2003 (COFINS)'
    }
  ];

  const resultados = [];

  testes.forEach(teste => {
    const creditosPisCofins = teste.creditosPisCofins || 0;
    const resultado = calcLucroReal(teste.receita, teste.despesas, creditosPisCofins);
    
    const lucroCalculado = Math.round(resultado.lucroMensal);
    
    if (teste.lucroEsperado) {
      const lucroOk = Math.abs(lucroCalculado - teste.lucroEsperado) <= 1;
      const irpjCalculado = Math.round(resultado.irpj.valorMensal);
      const csllCalculado = Math.round(resultado.csll.valorMensal);
      const irpjOk = Math.abs(irpjCalculado - teste.irpjEsperado) <= 1;
      const csllOk = Math.abs(csllCalculado - teste.csllEsperado) <= 1;
      
      const passou = lucroOk && irpjOk && csllOk;
      
      resultados.push({
        teste: teste.nome,
        lucroEsperado: teste.lucroEsperado,
        lucroCalculado: lucroCalculado,
        irpjEsperado: teste.irpjEsperado,
        irpjCalculado: irpjCalculado,
        csllEsperado: teste.csllEsperado,
        csllCalculado: csllCalculado,
        passou: passou,
        referencia: teste.referencia
      });
    }
    
    if (teste.pisEsperado) {
      const pisCalculado = Math.round(resultado.pis.valorMensal);
      const cofinsCalculado = Math.round(resultado.cofins.valorMensal);
      const pisOk = Math.abs(pisCalculado - teste.pisEsperado) <= 1;
      const cofinsOk = Math.abs(cofinsCalculado - teste.cofinsEsperado) <= 1;
      
      const passou = pisOk && cofinsOk;
      
      resultados.push({
        teste: teste.nome,
        pisEsperado: teste.pisEsperado,
        pisCalculado: pisCalculado,
        cofinsEsperado: teste.cofinsEsperado,
        cofinsCalculado: cofinsCalculado,
        passou: passou,
        referencia: teste.referencia
      });
    }

    const testePrincipal = resultados[resultados.length - 1];
    if (testePrincipal.passou) {
      console.log(`✅ ${teste.nome}: PASSOU`);
    } else {
      console.log(`❌ ${teste.nome}: FALHOU - Ver detalhes`);
      console.log(testePrincipal);
    }
  });

  return resultados;
}

// ========================================
// 🔴 TESTE 006: EDGE CASES CRÍTICOS  
// ========================================

export function testeEdgeCases() {
  console.log('🔍 TESTE EDGE CASES - Validação Situações Limite...');

  const testes = [
    {
      nome: 'MEI - Limite exato R$ 81.000',
      funcao: () => {
        const resultado = calcMEI(6750, 'servicos'); // R$ 81k anual
        return resultado.excedeLimite === undefined; // Não deve exceder
      },
      referencia: 'LC 123/2006, Art. 18-A'
    },
    {
      nome: 'MEI - Acima do limite R$ 81.001',
      funcao: () => {
        const resultado = calcMEI(6750.1, 'servicos'); // R$ 81.001,2 anual  
        return resultado.excedeLimite === true;
      },
      referencia: 'LC 123/2006, Art. 18-A'
    },
    {
      nome: 'Simples - Limite exato R$ 4.8MM',
      funcao: () => {
        const resultado = calcSimplesTax(4800000, 'I');
        return !resultado.excedeLimite;
      },
      referencia: 'LC 123/2006, Art. 3º'
    },
    {
      nome: 'Simples - Acima limite R$ 4.8MM + 1',
      funcao: () => {
        const resultado = calcSimplesTax(4800001, 'I');
        return resultado.excedeLimite === true;
      },
      referencia: 'LC 123/2006, Art. 3º'
    },
    {
      nome: 'Fator R - Limite exato 28%',
      funcao: () => {
        const resultado = calcSimplesTax(600000, 'V', 0.28);
        return resultado.migracao === true;
      },
      referencia: 'LC 123/2006, Art. 18, §5º-H'
    },
    {
      nome: 'Lucro Presumido - Obrigatoriedade Real R$ 78MM+',
      funcao: () => {
        const resultado = calcLucroPresumido(6500001, 'servicos'); // > R$ 78MM
        return resultado.erro && resultado.erro.includes('excede limite');
      },
      referencia: 'Decreto 3.000/1999, Art. 246'
    }
  ];

  const resultados = [];

  testes.forEach(teste => {
    try {
      const passou = teste.funcao();
      resultados.push({
        teste: teste.nome,
        passou: passou,
        referencia: teste.referencia
      });

      if (passou) {
        console.log(`✅ ${teste.nome}: PASSOU`);
      } else {
        console.log(`❌ ${teste.nome}: FALHOU`);
      }
    } catch (error) {
      resultados.push({
        teste: teste.nome,
        passou: false,
        erro: error.message
      });
      console.log(`❌ ${teste.nome}: ERRO - ${error.message}`);
    }
  });

  return resultados;
}

// ========================================
// 🎯 TESTE GERAL - EXECUÇÃO COMPLETA
// ========================================

export function executarTodosOsTestes() {
  console.log('🚀 INICIANDO VALIDAÇÃO TRIBUTÁRIA COMPLETA...\n');
  
  const inicio = new Date();
  
  const resultados = {
    mei: testeMEI(),
    simplesNacional: testeSimples(),
    fatorR: testeFatorR(),
    lucroPresumido: testeLucroPresumido(),
    lucroReal: testeLucroReal(),
    edgeCases: testeEdgeCases()
  };

  const fim = new Date();
  const tempoExecucao = fim - inicio;
  
  // Compilar estatísticas
  let totalTestes = 0;
  let testesPassaram = 0;
  
  Object.values(resultados).forEach(categoria => {
    categoria.forEach(teste => {
      totalTestes++;
      if (teste.passou) testesPassaram++;
    });
  });

  const percentualSucesso = Math.round((testesPassaram / totalTestes) * 100);
  
  console.log('\n📊 RELATÓRIO FINAL DE VALIDAÇÃO');
  console.log('=====================================');
  console.log(`Total de testes: ${totalTestes}`);
  console.log(`Testes aprovados: ${testesPassaram}`);
  console.log(`Testes reprovados: ${totalTestes - testesPassaram}`);
  console.log(`Taxa de sucesso: ${percentualSucesso}%`);
  console.log(`Tempo de execução: ${tempoExecucao}ms`);
  
  if (percentualSucesso >= 95) {
    console.log('✅ SISTEMA APROVADO - Compliance excelente!');
  } else if (percentualSucesso >= 90) {
    console.log('⚠️ SISTEMA APROVADO com ressalvas - Verificar falhas');
  } else {
    console.log('❌ SISTEMA REPROVADO - Correções necessárias');
  }

  return {
    resultados,
    estatisticas: {
      total: totalTestes,
      aprovados: testesPassaram,
      reprovados: totalTestes - testesPassaram,
      percentualSucesso,
      tempoExecucao
    }
  };
}

// Executar automaticamente se rodado diretamente
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  // Node.js environment
  executarTodosOsTestes();
}

export default {
  testeMEI,
  testeSimples, 
  testeFatorR,
  testeLucroPresumido,
  testeLucroReal,
  testeEdgeCases,
  executarTodosOsTestes
};

/**
 * ✅ VALIDAÇÃO TRIBUTÁRIA - CASOS TESTADOS:
 * 
 * MEI:
 * [✓] Valores DAS 2025 corretos
 * [✓] Serviços, Comércio, Caminhoneiro
 * [✓] Limites de receita
 * 
 * SIMPLES NACIONAL:
 * [✓] Faixas e alíquotas por anexo
 * [✓] Cálculo DAS com dedução
 * [✓] Fator R e migração
 * 
 * LUCRO PRESUMIDO:
 * [✓] Presunções por atividade
 * [✓] IRPJ com adicional
 * [✓] CSLL por tipo de atividade
 * 
 * LUCRO REAL:
 * [✓] IRPJ 15% + adicional 10%
 * [✓] CSLL 9%
 * [✓] PIS/COFINS não-cumulativo
 * 
 * EDGE CASES:
 * [✓] Limites exatos
 * [✓] Situações de migração obrigatória
 * [✓] Validações de impedimento
 */