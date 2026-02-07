import { useState } from 'react';
import { ArrowRight, Check, Copy, FileText, Calculator, Wallet, AlertCircle, Sparkles } from 'lucide-react';

/**
 * Componente para integração de dados entre módulos
 * Resolve o problema C4: módulos desintegrados
 * Permite fluxo: Custos → Precificação → Propostas
 */

/**
 * Botão para usar dados de precificação em propostas
 */
export function BotaoUsarNaProposta({ 
  dadosPrecificacao, 
  onUsar, 
  className = '',
  disabled = false 
}) {
  const [copiado, setCopiado] = useState(false);

  const handleClick = () => {
    if (disabled || !dadosPrecificacao) return;
    
    onUsar(dadosPrecificacao);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const temDados = dadosPrecificacao && dadosPrecificacao.precoVenda > 0;

  return (
    <button
      onClick={handleClick}
      disabled={disabled || !temDados}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
        transition-all duration-200 touch-manipulation
        ${copiado 
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
          : temDados
            ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/30 active:scale-[0.98]'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
        }
        ${className}
      `}
    >
      {copiado ? (
        <>
          <Check size={16} />
          <span>Enviado para Propostas.</span>
        </>
      ) : (
        <>
          <FileText size={16} />
          <span>Usar na Proposta</span>
          <ArrowRight size={14} />
        </>
      )}
    </button>
  );
}

/**
 * Botão para importar custos do módulo Custos Operacionais
 */
export function BotaoImportarCustos({ 
  onImportar, 
  className = '',
  temDadosCustos = false 
}) {
  const [importando, setImportando] = useState(false);

  const handleClick = async () => {
    if (!temDadosCustos) return;
    
    setImportando(true);
    try {
      const custosSalvos = localStorage.getItem('precificalc_custos');
      if (custosSalvos) {
        const dados = JSON.parse(custosSalvos);
        onImportar(dados);
      }
    } catch (error) {
      console.error('Erro ao importar custos:', error);
    }
    setTimeout(() => setImportando(false), 1000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={!temDadosCustos || importando}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-200
        ${temDadosCustos
          ? 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
          : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
        }
        ${className}
      `}
    >
      {importando ? (
        <>
          <div className="w-4 h-4 border-2 border-slate-300 border-t-brand-500 rounded-full animate-spin" />
          <span>Importando...</span>
        </>
      ) : (
        <>
          <Wallet size={16} />
          <span>Importar de Custos</span>
        </>
      )}
    </button>
  );
}

/**
 * Card de resumo do fluxo de integração
 */
export function FluxoIntegracao({ 
  etapaAtual = 'custos', 
  dadosCustos = null,
  dadosPrecificacao = null,
  dadosPropostas = null,
  onNavigate,
  className = ''
}) {
  const etapas = [
    {
      id: 'custos',
      nome: 'Custos',
      icone: Wallet,
      descricao: 'Defina gastos fixos e variáveis',
      completo: !!dadosCustos,
      rota: 'custos'
    },
    {
      id: 'precificacao',
      nome: 'Preços',
      icone: Calculator,
      descricao: 'Calcule preço de venda',
      completo: !!dadosPrecificacao?.precoVenda,
      rota: 'precificacao'
    },
    {
      id: 'propostas',
      nome: 'Propostas',
      icone: FileText,
      descricao: 'Gere proposta profissional',
      completo: !!dadosPropostas,
      rota: 'propostas'
    },
  ];

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-brand-500" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Fluxo de Trabalho Integrado
        </h3>
      </div>
      
      <div className="flex items-center justify-between">
        {etapas.map((etapa, index) => {
          const Icone = etapa.icone;
          const ativo = etapa.id === etapaAtual;
          const proximo = index < etapas.length - 1;
          
          return (
            <div key={etapa.id} className="flex items-center">
              {/* Etapa */}
              <button
                onClick={() => onNavigate?.(etapa.rota)}
                className={`
                  flex items-center gap-2 p-2 rounded-lg transition-all text-left
                  ${ativo 
                    ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800' 
                    : etapa.completo
                      ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                      : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }
                `}
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  ${ativo 
                    ? 'bg-brand-500 text-white' 
                    : etapa.completo
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  }
                `}>
                  {etapa.completo && !ativo ? (
                    <Check size={14} />
                  ) : (
                    <Icone size={14} />
                  )}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-medium">{etapa.nome}</div>
                  <div className="text-xs opacity-75">{etapa.descricao}</div>
                </div>
              </button>
              
              {/* Seta de progresso */}
              {proximo && (
                <ArrowRight 
                  size={16} 
                  className={`mx-2 ${etapa.completo ? 'text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Dica contextual */}
      <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle size={14} className="text-brand-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {etapaAtual === 'custos' && 'Defina seus gastos para calcular o preço correto'}
            {etapaAtual === 'precificacao' && 'Use os custos para formar o preço ideal'}
            {etapaAtual === 'propostas' && 'Importe o preço calculado para gerar propostas'}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Notificação de dados disponíveis em outros módulos
 */
export function NotificacaoDadosDisponiveis({ 
  tipo = 'custos', // 'custos', 'precificacao'
  onImportar,
  onDismiss,
  className = ''
}) {
  const configs = {
    custos: {
      titulo: 'Custos definidos em outro módulo',
      descricao: 'Encontramos gastos já cadastrados. Quer importá-los?',
      icone: Wallet,
      cor: 'blue',
    },
    precificacao: {
      titulo: 'Preço calculado disponível',
      descricao: 'Use o preço calculado na Precificação para esta proposta.',
      icone: Calculator,
      cor: 'brand',
    },
  };

  const config = configs[tipo];
  const Icone = config.icone;

  return (
    <div className={`
      bg-gradient-to-r from-${config.cor}-50 to-${config.cor}-50/50 
      dark:from-${config.cor}-950/30 dark:to-${config.cor}-950/10
      border border-${config.cor}-200 dark:border-${config.cor}-800 
      rounded-lg p-4 animate-fade-in-up
      ${className}
    `}>
      <div className="flex items-start gap-3">
        <div className={`
          p-2 rounded-lg bg-${config.cor}-100 dark:bg-${config.cor}-900/30 
          text-${config.cor}-600 dark:text-${config.cor}-400
        `}>
          <Icone size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold text-${config.cor}-800 dark:text-${config.cor}-300`}>
            {config.titulo}
          </h4>
          <p className={`text-xs text-${config.cor}-600 dark:text-${config.cor}-400 mt-0.5`}>
            {config.descricao}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={onImportar}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-lg
                bg-${config.cor}-500 text-white hover:bg-${config.cor}-600
                transition-colors
              `}
            >
              Importar Dados
            </button>
            <button
              onClick={onDismiss}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-lg
                text-${config.cor}-600 dark:text-${config.cor}-400 
                hover:bg-${config.cor}-100 dark:hover:bg-${config.cor}-900/30
                transition-colors
              `}
            >
              Dispensar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Utilidades para gerenciar dados entre módulos
 */
export const ModuloIntegration = {
  // Salvar dados de um módulo para outro
  exportarDados: (modulo, dados) => {
    try {
      const key = `precificalc_${modulo}`;
      localStorage.setItem(key, JSON.stringify(dados));
      return true;
    } catch (error) {
      console.error(`Erro ao exportar dados do módulo ${modulo}:`, error);
      return false;
    }
  },

  // Importar dados de outro módulo
  importarDados: (modulo) => {
    try {
      const key = `precificalc_${modulo}`;
      const dados = localStorage.getItem(key);
      return dados ? JSON.parse(dados) : null;
    } catch (error) {
      console.error(`Erro ao importar dados do módulo ${modulo}:`, error);
      return null;
    }
  },

  // Verificar se há dados disponíveis
  temDados: (modulo) => {
    try {
      const dados = ModuloIntegration.importarDados(modulo);
      return dados && Object.keys(dados).length > 0;
    } catch {
      return false;
    }
  },

  // Preparar dados para exportação entre módulos específicos
  prepararDadosParaProposta: (dadosPrecificacao) => ({
    produto: dadosPrecificacao.nome || 'Produto/Serviço',
    preco: dadosPrecificacao.precoVenda || 0,
    custo: dadosPrecificacao.custoTotal || 0,
    margem: dadosPrecificacao.margemReal || 0,
    impostos: dadosPrecificacao.impostoTotalUnitario || 0,
    quantidade: 1,
    dataCalculada: new Date().toISOString(),
  }),
};

export default {
  BotaoUsarNaProposta,
  BotaoImportarCustos,
  FluxoIntegracao,
  NotificacaoDadosDisponiveis,
  ModuloIntegration,
};