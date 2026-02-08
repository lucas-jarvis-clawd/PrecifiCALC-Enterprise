/**
 * Funções auxiliares de cálculo tributário usadas em múltiplas páginas.
 * CPP Anexo IV, Fator R, Anexo por Fator R, Sublimite Simples Nacional.
 */

export const calcCPPAnexoIV = (folha) => folha * 0.20;

export const calcFatorR = (folha12, rbt12) => rbt12 > 0 ? folha12 / rbt12 : 0;

export const getAnexoPorFatorR = (fr, anexo) => (fr >= 0.28 && anexo === 'V') ? 'III' : anexo;

export const checkSublimiteSimples = (rbt12, estado = null) => {
  const sublimitesPorEstado = {
    AC: 1800000, AL: 1800000, AM: 1800000, AP: 1800000, BA: 3600000,
    CE: 1800000, DF: 3600000, ES: 1800000, GO: 1800000, MA: 1800000,
    MG: 3600000, MS: 1800000, MT: 1800000, PA: 1800000, PB: 1800000,
    PE: 1800000, PI: 1800000, PR: 3600000, RJ: 3600000, RN: 1800000,
    RO: 1800000, RR: 1800000, RS: 3600000, SC: 3600000, SE: 1800000,
    SP: 3600000, TO: 1800000,
  };

  const sublimite = estado ? (sublimitesPorEstado[estado] || 3600000) : 3600000;
  const limiteSimples = 4800000;
  const dentroSimples = rbt12 <= limiteSimples;
  const dentroSublimite = rbt12 <= sublimite;

  let mensagem = null;
  let issIcmsSeparado = false;

  if (!dentroSimples) {
    mensagem = `Receita Bruta (Faturamento) de R$ ${rbt12.toLocaleString('pt-BR')} excede o limite do Simples Nacional (R$ 4.800.000).`;
  } else if (!dentroSublimite) {
    mensagem = `Receita Bruta (Faturamento) de R$ ${rbt12.toLocaleString('pt-BR')} excede o sublimite${estado ? ' de ' + estado : ''} (R$ ${sublimite.toLocaleString('pt-BR')}). ISS e ICMS devem ser recolhidos separadamente fora do DAS.`;
    issIcmsSeparado = true;
  }

  return { dentroSimples, dentroSublimite, sublimite, mensagem, issIcmsSeparado, estado };
};
