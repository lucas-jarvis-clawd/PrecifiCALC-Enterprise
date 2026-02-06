import { HelpCircle, Info } from 'lucide-react';
import Tooltip from './Tooltip';

/**
 * Dicionário de termos técnicos com explicações em linguagem empresarial
 * Baseado nas DIRETRIZES_UX.md - tradução de "contabilês" para "empresário"
 */
const TERMOS_TECNICOS = {
  // Tributação e Regimes
  rbt12: {
    termo: "RBT12",
    explicacao: "Receita Bruta Total dos últimos 12 meses - usado para determinar sua faixa de tributação no Simples Nacional",
    exemploUso: "Se sua empresa faturou R$ 300 mil nos últimos 12 meses, sua RBT12 é R$ 300 mil",
  },
  fatorR: {
    termo: "Fator R",
    explicacao: "Proporção da folha de pagamento sobre o faturamento - determina se você migra do Anexo V para III",
    exemploUso: "Se você fatura R$ 100 mil/mês e paga R$ 30 mil de salários, seu Fator R é 30%",
  },
  anexo: {
    termo: "Anexo do Simples",
    explicacao: "Categoria da sua atividade no Simples Nacional - cada anexo tem alíquotas diferentes",
    exemploUso: "Serviços geralmente são Anexo III, comércio é Anexo I",
  },
  mei: {
    termo: "MEI",
    explicacao: "Microempreendedor Individual - regime para quem fatura até R$ 81 mil por ano com impostos fixos",
    exemploUso: "No MEI você paga valor fixo mensal (cerca de R$ 70), independente do quanto vendeu",
  },
  simples: {
    termo: "Simples Nacional",
    explicacao: "Regime tributário simplificado para empresas que faturam até R$ 4,8 milhões por ano",
    exemploUso: "No Simples, você paga uma guia única (DAS) que inclui vários impostos",
  },
  presumido: {
    termo: "Lucro Presumido",
    explicacao: "Regime onde o governo presume quanto você lucrou e cobra impostos sobre essa estimativa",
    exemploUso: "Se você é prestador de serviços, o governo presume que 32% da receita é lucro",
  },
  real: {
    termo: "Lucro Real",
    explicacao: "Regime onde os impostos são calculados sobre o lucro real da empresa (receitas - despesas)",
    exemploUso: "Você só paga IRPJ se realmente tiver lucro no período",
  },

  // Custos e Precificação
  cpp: {
    termo: "CPP (INSS Patronal)",
    explicacao: "Contribuição Previdenciária Patronal - valor que a empresa paga sobre a folha de salários (cerca de 20%)",
    exemploUso: "Se você paga R$ 10 mil em salários, deve recolher mais R$ 2 mil de INSS patronal",
  },
  cmv: {
    termo: "CMV (Custo da Mercadoria Vendida)",
    explicacao: "Quanto você gastou para produzir ou comprar o que vendeu",
    exemploUso: "Se você comprou um produto por R$ 50 e vendeu por R$ 100, o CMV é R$ 50",
  },
  cpv: {
    termo: "CPV (Custo dos Produtos Vendidos)",
    explicacao: "Mesmo que CMV - quanto custou produzir o que você vendeu",
    exemploUso: "Inclui matéria-prima, mão de obra e outros custos diretos",
  },
  margemContribuicao: {
    termo: "Margem de Contribuição",
    explicacao: "Quanto sobra de cada venda para pagar os gastos fixos e gerar lucro",
    exemploUso: "Se você vende por R$ 100 e tem R$ 40 de custos variáveis, sua margem é R$ 60",
  },
  pontoEquilibrio: {
    termo: "Ponto de Equilíbrio",
    explicacao: "Mínimo que você precisa vender por mês para pagar todas as contas (não ter prejuízo)",
    exemploUso: "Se seus gastos fixos são R$ 10 mil e sua margem é R$ 20 por venda, precisa vender 500 unidades",
  },
  markup: {
    termo: "Markup",
    explicacao: "Percentual que você adiciona sobre o custo para formar o preço de venda",
    exemploUso: "Se o custo é R$ 50 e você quer markup de 100%, o preço será R$ 100",
  },

  // Demonstrações Financeiras
  dre: {
    termo: "DRE",
    explicacao: "Demonstração do Resultado - relatório que mostra se sua empresa deu lucro ou prejuízo",
    exemploUso: "Lista todas as receitas, diminui todos os gastos e mostra o resultado final",
  },
  ebitda: {
    termo: "EBITDA",
    explicacao: "Lucro operacional antes de juros, impostos sobre o lucro, depreciação e amortização",
    exemploUso: "É o lucro 'puro' do seu negócio, sem considerar financiamentos e contabilizações",
  },
  prolabore: {
    termo: "Pró-labore",
    explicacao: "Salário do sócio/proprietário - valor mensal que você retira como remuneração pelo trabalho",
    exemploUso: "Diferente da distribuição de lucros, o pró-labore tem desconto de INSS",
  },

  // Impostos Específicos
  iss: {
    termo: "ISS",
    explicacao: "Imposto sobre Serviços - pago ao município onde o serviço é prestado",
    exemploUso: "Alíquota varia de 2% a 5% dependendo da cidade e tipo de serviço",
  },
  icms: {
    termo: "ICMS",
    explicacao: "Imposto sobre vendas de produtos - pago ao estado",
    exemploUso: "Incide sobre vendas, transferências e alguns serviços de transporte/comunicação",
  },
  pis: {
    termo: "PIS",
    explicacao: "Programa de Integração Social - contribuição sobre o faturamento",
    exemploUso: "No Lucro Presumido é 0,65% da receita, no Real pode ter créditos",
  },
  cofins: {
    termo: "COFINS",
    explicacao: "Contribuição para Financiamento da Seguridade Social - contribuição sobre o faturamento",
    exemploUso: "No Lucro Presumido é 3% da receita, no Real pode ter créditos",
  },
  irpj: {
    termo: "IRPJ",
    explicacao: "Imposto de Renda Pessoa Jurídica - imposto sobre o lucro da empresa",
    exemploUso: "No Presumido é 15% sobre o lucro presumido, no Real é 15% sobre o lucro real",
  },
  csll: {
    termo: "CSLL",
    explicacao: "Contribuição Social sobre Lucro Líquido - contribuição sobre o lucro",
    exemploUso: "Geralmente 9% sobre o lucro (presumido ou real)",
  },

  // Conceitos Avançados
  ncm: {
    termo: "NCM",
    explicacao: "Nomenclatura Comum do Mercosul - código de 8 dígitos que classifica todos os produtos para fins de tributação",
    exemploUso: "NCM 2710.12.11 identifica gasolina comum, que tem tributação monofásica específica",
  },
  lalur: {
    termo: "LALUR",
    explicacao: "Livro de Apuração do Lucro Real - onde se fazem ajustes contábeis para calcular o lucro tributável",
    exemploUso: "Usado apenas no Lucro Real para ajustar diferenças entre contabilidade e tributação",
  },
  aliquotaEfetiva: {
    termo: "Alíquota Efetiva",
    explicacao: "Percentual real de impostos que você paga sobre cada venda",
    exemploUso: "Se vende R$ 1000 e paga R$ 80 de impostos, sua alíquota efetiva é 8%",
  },
  baseCalculo: {
    termo: "Base de Cálculo",
    explicacao: "Valor sobre o qual o imposto é calculado",
    exemploUso: "Para calcular PIS de 0,65%, a base é toda a receita da empresa",
  },
  vpl: {
    termo: "VPL",
    explicacao: "Valor Presente Líquido - mostra se um investimento vale a pena, considerando o tempo",
    exemploUso: "Se VPL for positivo, o investimento dá mais retorno que deixar o dinheiro na poupança",
  },
  tir: {
    termo: "TIR",
    explicacao: "Taxa Interna de Retorno - rentabilidade anual que o investimento proporcionará",
    exemploUso: "TIR de 20% ao ano significa que o investimento rende 20% ao ano",
  },
  payback: {
    termo: "Payback",
    explicacao: "Tempo para recuperar o investimento inicial",
    exemploUso: "Se investir R$ 100 mil e ganhar R$ 10 mil por mês, o payback é 10 meses",
  },
};

/**
 * Componente que exibe um termo técnico com tooltip explicativo
 * Segue as diretrizes UX de manter precisão técnica + explicação empresarial
 */
export function TermoTecnico({ termo, children, className = '', variant = 'inline' }) {
  const definicao = TERMOS_TECNICOS[termo?.toLowerCase()];
  
  if (!definicao) {
    // Se não encontrar o termo, renderiza sem tooltip
    console.warn(`TermoTecnico: termo "${termo}" não encontrado no dicionário`);
    return <span className={className}>{children}</span>;
  }

  const tooltipContent = (
    <div className="max-w-xs">
      <div className="font-semibold text-brand-600 dark:text-brand-400 text-sm mb-1">
        {definicao.termo}
      </div>
      <div className="text-slate-700 dark:text-slate-300 text-xs mb-2 leading-relaxed">
        {definicao.explicacao}
      </div>
      {definicao.exemploUso && (
        <div className="text-slate-600 dark:text-slate-400 text-xs italic border-l-2 border-brand-200 dark:border-brand-700 pl-2">
          <strong>Exemplo:</strong> {definicao.exemploUso}
        </div>
      )}
    </div>
  );

  if (variant === 'icon') {
    return (
      <Tooltip content={tooltipContent} className={className}>
        <HelpCircle size={14} className="text-slate-400 dark:text-slate-500 cursor-help hover:text-brand-500 transition-colors" />
      </Tooltip>
    );
  }

  return (
    <Tooltip content={tooltipContent} className={className}>
      <span className="cursor-help border-b border-dotted border-brand-400 dark:border-brand-500 text-brand-600 dark:text-brand-400 hover:border-solid transition-colors">
        {children || definicao.termo}
      </span>
    </Tooltip>
  );
}

/**
 * Label com termo técnico e tooltip integrado
 * Formato: "RBT12 (Faturamento últimos 12 meses)" + tooltip
 */
export function LabelComTermoTecnico({ termo, textoExplicativo, required = false, className = '' }) {
  const definicao = TERMOS_TECNICOS[termo?.toLowerCase()];
  
  const textoCompleto = definicao ? 
    `${definicao.termo}${textoExplicativo ? ` (${textoExplicativo})` : ''}` : 
    textoExplicativo || termo;

  return (
    <label className={`flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 ${className}`}>
      <span>{textoCompleto}</span>
      {required && <span className="text-red-400">*</span>}
      {definicao && <TermoTecnico termo={termo} variant="icon" />}
    </label>
  );
}

/**
 * Hook para obter explicação de um termo técnico
 */
export function useTermoTecnico(termo) {
  return TERMOS_TECNICOS[termo?.toLowerCase()] || null;
}

export default TermoTecnico;