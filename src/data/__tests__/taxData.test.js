/**
 * Unit Tests - Cálculos Tributários
 * Cobertura: MEI, Simples Nacional, Lucro Presumido, Lucro Real, Encargos CLT
 * Validação cruzada com legislação vigente 2026
 */
import { describe, it, expect } from 'vitest';
import {
  calcMEI,
  calcSimplesTax,
  calcLucroPresumido,
  calcLucroReal,
  calcEncargoCLT,
  calcEncargos,
  calcFatorR,
  getAnexoPorFatorR,
  checkSublimiteSimples,
  formatCurrency,
  formatPercent,
  formatNumber,
  validarCNPJ,
  constantesTributarias2026,
  mei,
  simplesNacional,
  lucroPresumido,
  lucroReal,
  irrf,
  issData,
  cprb,
  calcCPPAnexoIV,
  determinarAnexoSimples,
} from '../taxData';

// ==========================================
// MEI
// ==========================================
describe('calcMEI', () => {
  it('deve calcular DAS fixo para MEI de serviços', () => {
    const result = calcMEI(5000, 'servicos');
    expect(result.dasFixo).toBe(86.05); // INSS 81.05 + ISS 5.00
    expect(result.dasAnual).toBe(86.05 * 12);
    expect(result.excedeLimite).toBeUndefined();
  });

  it('deve calcular DAS fixo para MEI de comércio', () => {
    const result = calcMEI(5000, 'comercio');
    expect(result.dasFixo).toBe(82.05); // INSS 81.05 + ICMS 1.00
  });

  it('deve calcular DAS fixo para MEI misto', () => {
    const result = calcMEI(5000, 'misto');
    expect(result.dasFixo).toBe(87.05); // INSS 81.05 + ICMS 1.00 + ISS 5.00
  });

  it('deve indicar que excede limite quando receita anual > R$ 81.000', () => {
    const result = calcMEI(7000, 'servicos'); // 7000 * 12 = 84000 > 81000
    expect(result.excedeLimite).toBe(true);
    expect(result.proximoRegime).toBe('Simples Nacional');
  });

  it('deve calcular alíquota efetiva corretamente', () => {
    const result = calcMEI(5000, 'servicos');
    expect(result.aliquotaEfetiva).toBeCloseTo(86.05 / 5000, 4);
  });

  it('deve calcular MEI Caminhoneiro com limite especial', () => {
    const result = calcMEI(15000, 'servicos', true);
    expect(result.dasFixo).toBe(195.52);
    expect(result.tipoMei).toBe('MEI Caminhoneiro');
    expect(result.excedeLimite).toBeUndefined(); // 15000*12=180000 < 251600
  });

  it('deve alertar proximidade do limite quando > 80%', () => {
    const result = calcMEI(5500, 'servicos'); // 66000/81000 = 81.5%
    expect(result.proximaRevisao).toBeTruthy();
    expect(result.proximaRevisao).toContain('ATENÇÃO');
  });
});

// ==========================================
// SIMPLES NACIONAL
// ==========================================
describe('calcSimplesTax', () => {
  it('deve calcular alíquota efetiva na 1ª faixa do Anexo I', () => {
    const result = calcSimplesTax(100000, 'I');
    expect(result.aliquotaEfetiva).toBe(0.04); // 4% sem dedução
    expect(result.faixa).toBe(1);
    expect(result.anexo).toBe('I');
  });

  it('deve calcular alíquota efetiva na 2ª faixa do Anexo I com dedução', () => {
    const result = calcSimplesTax(200000, 'I');
    const expected = (200000 * 0.073 - 5940) / 200000;
    expect(result.aliquotaEfetiva).toBeCloseTo(expected, 6);
    expect(result.faixa).toBe(2);
  });

  it('deve calcular Anexo III corretamente (serviços)', () => {
    const result = calcSimplesTax(500000, 'III');
    const expected = (500000 * 0.135 - 17640) / 500000;
    expect(result.aliquotaEfetiva).toBeCloseTo(expected, 6);
  });

  it('deve calcular Anexo V corretamente (serviços intelectuais)', () => {
    const result = calcSimplesTax(300000, 'V');
    const expected = (300000 * 0.18 - 4500) / 300000;
    expect(result.aliquotaEfetiva).toBeCloseTo(expected, 6);
  });

  it('deve recomendar migração do Anexo V para III quando fatorR >= 28%', () => {
    const result = calcSimplesTax(500000, 'V', 0.30);
    expect(result.migracao).toBe(true);
    expect(result.anexoRecomendado).toBe('III');
  });

  it('deve NÃO recomendar migração quando fatorR < 28%', () => {
    const result = calcSimplesTax(500000, 'V', 0.20);
    expect(result.migracao).toBeUndefined();
    expect(result.aliquotaEfetiva).toBeGreaterThan(0);
  });

  it('deve indicar excede limite acima de R$ 4.800.000', () => {
    const result = calcSimplesTax(5000000, 'III');
    expect(result.excedeLimite).toBe(true);
    expect(result.proximoRegime).toContain('Lucro');
  });

  it('deve retornar erro para anexo inválido', () => {
    const result = calcSimplesTax(300000, 'X');
    expect(result.erro).toBeTruthy();
  });

  it('deve calcular valor mensal corretamente', () => {
    const result = calcSimplesTax(600000, 'III');
    const receitaMensal = 600000 / 12;
    expect(result.receitaMensal).toBe(receitaMensal);
    expect(result.valorMensal).toBeCloseTo(receitaMensal * result.aliquotaEfetiva, 2);
  });

  it('deve calcular todas as 6 faixas do Anexo I', () => {
    const faixasRbt = [100000, 250000, 500000, 1000000, 2500000, 4000000];
    const expected = [1, 2, 3, 4, 5, 6];
    faixasRbt.forEach((rbt, i) => {
      const result = calcSimplesTax(rbt, 'I');
      expect(result.faixa).toBe(expected[i]);
    });
  });
});

// ==========================================
// LUCRO PRESUMIDO
// ==========================================
describe('calcLucroPresumido', () => {
  it('deve calcular tributos para serviços (presunção 32%)', () => {
    const result = calcLucroPresumido(100000, 'servicos', 0.05);
    expect(result.regime).toBe('Lucro Presumido');
    expect(result.presuncao.irpj).toBe(0.32);
    expect(result.presuncao.csll).toBe(0.32);
  });

  it('deve calcular tributos para comércio (presunção 8%/12%)', () => {
    const result = calcLucroPresumido(100000, 'comercio', 0.05);
    expect(result.presuncao.irpj).toBe(0.08);
    expect(result.presuncao.csll).toBe(0.12);
  });

  it('deve aplicar adicional IRPJ quando base > R$ 60.000/trimestre', () => {
    const result = calcLucroPresumido(100000, 'servicos'); // base = 100000*3*0.32 = 96000 > 60000
    expect(result.irpj.temAdicional).toBe(true);
  });

  it('deve NÃO aplicar adicional IRPJ quando base <= R$ 60.000/trimestre', () => {
    const result = calcLucroPresumido(30000, 'comercio'); // base = 30000*3*0.08 = 7200 < 60000
    expect(result.irpj.temAdicional).toBe(false);
  });

  it('deve calcular PIS e COFINS cumulativos corretamente', () => {
    const receitaMensal = 100000;
    const result = calcLucroPresumido(receitaMensal, 'servicos');
    expect(result.pis.valorMensal).toBeCloseTo(receitaMensal * 0.0065, 2);
    expect(result.cofins.valorMensal).toBeCloseTo(receitaMensal * 0.03, 2);
  });

  it('deve calcular ISS corretamente', () => {
    const result = calcLucroPresumido(100000, 'servicos', 0.03);
    expect(result.iss.valorMensal).toBe(3000);
    expect(result.iss.aliquota).toBe(0.03);
  });

  it('deve calcular alíquota efetiva total', () => {
    const result = calcLucroPresumido(100000, 'servicos', 0.05);
    expect(result.aliquotaEfetiva).toBeGreaterThan(0);
    expect(result.aliquotaEfetiva).toBeLessThan(1);
    expect(result.totalMensal).toBeCloseTo(result.aliquotaEfetiva * 100000, 2);
  });

  it('deve alertar quando próximo ao limite de R$ 78 milhões', () => {
    const result = calcLucroPresumido(5500000, 'servicos'); // 66M anual > 60M
    expect(result.proximaRevisao).toBeTruthy();
  });

  it('deve retornar erro quando excede limite', () => {
    const result = calcLucroPresumido(7000000, 'servicos'); // 84M > 78M
    expect(result.erro).toBeTruthy();
    expect(result.proximoRegime).toContain('Real');
  });
});

// ==========================================
// LUCRO REAL
// ==========================================
describe('calcLucroReal', () => {
  it('deve calcular IRPJ sobre lucro tributável', () => {
    const result = calcLucroReal(100000, 60000);
    expect(result.regime).toBe('Lucro Real');
    expect(result.lucroContabil).toBe(40000);
    expect(result.irpj.baseTrimestral).toBe(40000 * 3);
  });

  it('deve aplicar adicional IRPJ quando lucro trimestral > R$ 60.000', () => {
    const result = calcLucroReal(100000, 60000); // lucro 40k * 3 = 120k > 60k
    expect(result.irpj.temAdicional).toBe(true);
  });

  it('deve calcular PIS/COFINS não-cumulativo com créditos', () => {
    const result = calcLucroReal(100000, 60000, 30000);
    // PIS: 100000 * 1.65% - 30000 * 1.65%
    expect(result.pis.creditos).toBeCloseTo(30000 * 0.0165, 2);
    expect(result.pis.valorMensal).toBeLessThan(result.pis.bruto);
  });

  it('deve incluir adições e exclusões do LALUR', () => {
    const result = calcLucroReal(100000, 60000, 0, 0.05, 5000, 3000);
    expect(result.adicoesLalur).toBe(5000);
    expect(result.exclusoesLalur).toBe(3000);
    expect(result.lucroMensal).toBe(100000 - 60000 + 5000 - 3000);
  });

  it('deve indicar prejuízo fiscal quando lucro < 0', () => {
    const result = calcLucroReal(50000, 80000);
    expect(result.lucroContabil).toBeLessThan(0);
    expect(result.observacoes).toBeTruthy();
    expect(result.observacoes).toContain('Prejuízo');
  });

  it('deve calcular alíquota efetiva total', () => {
    const result = calcLucroReal(200000, 100000);
    expect(result.aliquotaEfetiva).toBeGreaterThan(0);
    expect(result.aliquotaEfetiva).toBeLessThan(1);
  });
});

// ==========================================
// ENCARGOS CLT
// ==========================================
describe('calcEncargoCLT', () => {
  it('deve calcular multiplicador de encargos acima de 1.5x', () => {
    const result = calcEncargoCLT(5000);
    expect(result.multiplicador).toBeGreaterThan(1.5);
    expect(result.custoTotal).toBeGreaterThan(5000);
  });

  it('deve incluir INSS patronal de 20%', () => {
    const result = calcEncargoCLT(5000);
    expect(result.encargosDetalhados.inssPatronal).toBe(1000); // 5000 * 0.20
  });

  it('deve incluir FGTS de 8%', () => {
    const result = calcEncargoCLT(5000);
    expect(result.encargosDetalhados.fgts).toBe(400); // 5000 * 0.08
  });

  it('deve provisionar 13º salário (1/12)', () => {
    const result = calcEncargoCLT(12000);
    expect(result.encargosDetalhados.prov13).toBeCloseTo(1000, 0);
  });

  it('deve classificar RAT corretamente', () => {
    const result1 = calcEncargoCLT(5000, 1);
    const result3 = calcEncargoCLT(5000, 3);
    expect(result3.encargosDetalhados.rat).toBeGreaterThan(result1.encargosDetalhados.rat);
  });

  it('deve incluir benefícios quando solicitado', () => {
    const semBeneficios = calcEncargoCLT(5000, 3, false);
    const comBeneficios = calcEncargoCLT(5000, 3, true);
    expect(comBeneficios.custoTotal).toBeGreaterThan(semBeneficios.custoTotal);
  });
});

// ==========================================
// ENCARGOS GENÉRICOS
// ==========================================
describe('calcEncargos', () => {
  it('deve calcular multiplicador total', () => {
    const result = calcEncargos(0.02);
    expect(result.multiplicador).toBeGreaterThan(1.4);
    expect(result.multiplicador).toBeLessThan(2.0);
  });

  it('deve detalhar todos os componentes', () => {
    const result = calcEncargos(0.02);
    expect(result.inssPatronal).toBe(0.20);
    expect(result.fgts).toBe(0.08);
    expect(result.terceiros).toBe(0.058);
    expect(result.detalhamento).toHaveLength(7);
  });
});

// ==========================================
// FATOR R
// ==========================================
describe('calcFatorR / getAnexoPorFatorR', () => {
  it('deve calcular fator R corretamente', () => {
    expect(calcFatorR(100000, 500000)).toBe(0.20);
    expect(calcFatorR(140000, 500000)).toBe(0.28);
  });

  it('deve retornar 0 para receita 0', () => {
    expect(calcFatorR(50000, 0)).toBe(0);
  });

  it('deve migrar Anexo V para III quando fator R >= 28%', () => {
    expect(getAnexoPorFatorR(0.28, 'V')).toBe('III');
    expect(getAnexoPorFatorR(0.35, 'V')).toBe('III');
  });

  it('deve manter Anexo V quando fator R < 28%', () => {
    expect(getAnexoPorFatorR(0.20, 'V')).toBe('V');
  });

  it('deve não alterar outros anexos', () => {
    expect(getAnexoPorFatorR(0.35, 'III')).toBe('III');
    expect(getAnexoPorFatorR(0.10, 'I')).toBe('I');
  });
});

// ==========================================
// SUBLIMITES SIMPLES
// ==========================================
describe('checkSublimiteSimples', () => {
  it('deve estar dentro do Simples e sublimite', () => {
    const result = checkSublimiteSimples(2000000);
    expect(result.dentroSimples).toBe(true);
    expect(result.dentroSublimite).toBe(true);
    expect(result.mensagem).toBeNull();
  });

  it('deve alertar sublimite ultrapassado', () => {
    const result = checkSublimiteSimples(4000000);
    expect(result.dentroSimples).toBe(true);
    expect(result.dentroSublimite).toBe(false);
    expect(result.mensagem).toContain('3.600.000');
  });

  it('deve indicar fora do Simples', () => {
    const result = checkSublimiteSimples(5000000);
    expect(result.dentroSimples).toBe(false);
    expect(result.mensagem).toContain('4.800.000');
  });
});

// ==========================================
// IRRF
// ==========================================
describe('IRRF', () => {
  it('deve calcular IRRF PF para isento', () => {
    const result = irrf.calcularPF(2000);
    expect(result.irDevido).toBe(0);
  });

  it('deve calcular IRRF PF na 2ª faixa (7.5%)', () => {
    const result = irrf.calcularPF(2500);
    expect(result.irDevido).toBeGreaterThan(0);
    expect(result.aliquota).toBe(0.075);
  });

  it('deve deduzir dependentes antes de calcular faixa', () => {
    const semDep = irrf.calcularPF(3000, 0);
    const comDep = irrf.calcularPF(3000, 2);
    expect(comDep.irDevido).toBeLessThan(semDep.irDevido);
    expect(comDep.deducaoDependentes).toBeCloseTo(2 * 189.59, 2);
  });

  it('deve calcular IRRF para serviços', () => {
    const result = irrf.calcularServicos(10000, 'consultoria');
    expect(result.aliquota).toBe(0.03);
    expect(result.valorRetido).toBe(300);
    expect(result.valorLiquido).toBe(9700);
  });
});

// ==========================================
// ISS
// ==========================================
describe('ISS', () => {
  it('deve usar alíquota do município quando disponível', () => {
    const sp = issData.calcular(10000, 'São Paulo/SP');
    expect(sp.aliquota).toBe(0.02);
    expect(sp.valorISS).toBe(200);
  });

  it('deve usar alíquota padrão (5%) para município desconhecido', () => {
    const outro = issData.calcular(10000, 'Cidade Qualquer');
    expect(outro.aliquota).toBe(0.05);
    expect(outro.valorISS).toBe(500);
  });
});

// ==========================================
// CPRB (Desoneração)
// ==========================================
describe('CPRB', () => {
  it('deve aplicar fator de reoneração 2026 (60%)', () => {
    const result = cprb.calcular(100000, 'ti', 50000);
    expect(result.fatorReoneracao).toBe(0.60);
    expect(result.aliquotaEfetiva).toBeCloseTo(0.045 * 0.60, 4);
    expect(result.valorCPPFolha).toBe(50000 * 0.10); // 10% sobre folha
  });

  it('deve retornar erro para atividade não encontrada', () => {
    const result = cprb.calcular(100000, 'inexistente');
    expect(result.erro).toBeTruthy();
  });
});

// ==========================================
// CPP Anexo IV
// ==========================================
describe('calcCPPAnexoIV', () => {
  it('deve calcular 20% sobre a folha', () => {
    expect(calcCPPAnexoIV(10000)).toBe(2000);
    expect(calcCPPAnexoIV(0)).toBe(0);
  });
});

// ==========================================
// DETERMINAÇÃO DE ANEXO
// ==========================================
describe('determinarAnexoSimples', () => {
  it('deve retornar Anexo I para comércio', () => {
    expect(determinarAnexoSimples('comercio')).toBe('I');
  });

  it('deve retornar Anexo II para indústria', () => {
    expect(determinarAnexoSimples('industria')).toBe('II');
  });

  it('deve retornar Anexo I para indústria com > 80% revenda', () => {
    expect(determinarAnexoSimples('industria', null, 90, 100)).toBe('I');
  });

  it('deve retornar Anexo III para serviços com fator R >= 28%', () => {
    expect(determinarAnexoSimples('servicos', 0.30)).toBe('III');
  });

  it('deve retornar Anexo V para serviços intelectuais com fator R < 28%', () => {
    expect(determinarAnexoSimples('servicos', 0.20)).toBe('V');
  });

  it('deve retornar Anexo IV para construção', () => {
    expect(determinarAnexoSimples('construcao')).toBe('IV');
  });
});

// ==========================================
// VALIDAÇÃO CNPJ
// ==========================================
describe('validarCNPJ', () => {
  it('deve validar CNPJ válido', () => {
    expect(validarCNPJ('11.222.333/0001-81')).toBe(true);
    expect(validarCNPJ('11222333000181')).toBe(true);
  });

  it('deve rejeitar CNPJ com dígitos iguais', () => {
    expect(validarCNPJ('11.111.111/1111-11')).toBe(false);
  });

  it('deve rejeitar CNPJ com tamanho errado', () => {
    expect(validarCNPJ('123')).toBe(false);
  });
});

// ==========================================
// FORMATAÇÃO
// ==========================================
describe('Formatadores', () => {
  it('deve formatar moeda BRL', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1.234');
    expect(result).toContain('R$');
  });

  it('deve formatar percentual', () => {
    const result = formatPercent(0.1567);
    expect(result).toContain('15');
    expect(result).toContain('%');
  });

  it('deve formatar número', () => {
    const result = formatNumber(1234.5);
    expect(result).toContain('1.234');
  });
});

// ==========================================
// CONSTANTES 2026
// ==========================================
describe('Constantes Tributárias 2026', () => {
  it('deve ter salário mínimo correto', () => {
    expect(constantesTributarias2026.salarioMinimo).toBe(1621.00);
  });

  it('deve ter teto INSS correto', () => {
    expect(constantesTributarias2026.tetoINSS).toBe(8475.55);
  });

  it('deve ter 4 faixas INSS', () => {
    expect(constantesTributarias2026.faixasINSS).toHaveLength(4);
  });

  it('deve ter limite MEI de R$ 81.000', () => {
    expect(constantesTributarias2026.limiteMEI).toBe(81000);
  });

  it('deve ter limite Simples de R$ 4.800.000', () => {
    expect(constantesTributarias2026.limiteSimples).toBe(4800000);
  });

  it('deve ter valor MEI INSS = 5% do salário mínimo', () => {
    expect(constantesTributarias2026.valorMeiInss).toBeCloseTo(1621 * 0.05, 0);
  });
});

// ==========================================
// INTEGRIDADE DOS DADOS
// ==========================================
describe('Integridade dos Dados Tributários', () => {
  it('deve ter todos os 5 anexos do Simples Nacional', () => {
    expect(Object.keys(simplesNacional.anexos)).toEqual(['I', 'II', 'III', 'IV', 'V']);
  });

  it('cada anexo deve ter 6 faixas', () => {
    Object.values(simplesNacional.anexos).forEach(anexo => {
      expect(anexo.faixas).toHaveLength(6);
    });
  });

  it('cada faixa deve ter alíquota e dedução', () => {
    Object.values(simplesNacional.anexos).forEach(anexo => {
      anexo.faixas.forEach(faixa => {
        expect(faixa).toHaveProperty('de');
        expect(faixa).toHaveProperty('ate');
        expect(faixa).toHaveProperty('aliquota');
        expect(faixa).toHaveProperty('deducao');
        expect(faixa.aliquota).toBeGreaterThanOrEqual(0);
        expect(faixa.ate).toBeGreaterThan(faixa.de);
      });
    });
  });

  it('faixas devem ser contíguas (sem gap)', () => {
    Object.values(simplesNacional.anexos).forEach(anexo => {
      for (let i = 1; i < anexo.faixas.length; i++) {
        expect(anexo.faixas[i].de).toBeCloseTo(anexo.faixas[i - 1].ate + 0.01, 0);
      }
    });
  });

  it('última faixa deve ir até R$ 4.800.000', () => {
    Object.values(simplesNacional.anexos).forEach(anexo => {
      expect(anexo.faixas[5].ate).toBe(4800000);
    });
  });

  it('Lucro Presumido deve ter todas as presunções', () => {
    expect(lucroPresumido.presuncao.servicos).toBeDefined();
    expect(lucroPresumido.presuncao.comercio).toBeDefined();
    expect(lucroPresumido.presuncao.industria).toBeDefined();
  });

  it('IRRF deve ter 5 faixas para pessoa física', () => {
    expect(irrf.pessoaFisica.faixas).toHaveLength(5);
  });
});
