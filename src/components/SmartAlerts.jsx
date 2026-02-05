import { useState, useEffect, useMemo } from 'react';
import { TrendingDown, TrendingUp, AlertTriangle, Lightbulb, DollarSign, X, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../data/taxData';

// Smart alert engine that analyzes user data and suggests optimizations
function generateSmartAlerts() {
  const alerts = [];

  try {
    // Check simulador data for regime optimization
    const sim = localStorage.getItem('precificalc_simulador');
    const perfil = localStorage.getItem('precificalc_perfil');
    const custos = localStorage.getItem('precificalc_custos');
    const dre = localStorage.getItem('precificalc_dre');

    if (sim) {
      const d = JSON.parse(sim);
      const receitaMensal = d.receitaMensal || d.rbt12 / 12 || 0;
      const regime = d.regime || '';
      const receitaAnual = receitaMensal * 12;

      // MEI → Simples suggestion
      if (regime === 'mei' && receitaAnual > 50000 && receitaAnual < 81000) {
        const economiaEstimada = receitaMensal * 0.02; // rough estimate
        alerts.push({
          id: 'mei-quase-limite',
          type: 'insight',
          icon: Lightbulb,
          title: 'MEI quase no limite',
          message: `Sua receita anual de ${formatCurrency(receitaAnual)} está ${((81000 - receitaAnual) / 81000 * 100).toFixed(0)}% do limite MEI. Planeje a transição para Simples Nacional.`,
          action: 'comparativo',
          actionLabel: 'Comparar regimes',
          priority: 2,
        });
      }

      // Regime optimization hint
      if (regime === 'simples' && receitaAnual > 1000000) {
        alerts.push({
          id: 'comparar-presumido',
          type: 'saving',
          icon: DollarSign,
          title: 'Oportunidade de economia',
          message: `Com receita de ${formatCurrency(receitaAnual)}/ano no Simples, vale comparar com Lucro Presumido. Empresas com margem alta podem economizar até 30% em tributos.`,
          action: 'comparativo',
          actionLabel: 'Ver comparativo',
          priority: 1,
        });
      }

      // High tax alert
      if (receitaMensal > 0) {
        const despOp = d.despesasOperacionais || 0;
        const imposto = d.impostoMensal || 0;
        if (imposto > 0 && (imposto / receitaMensal) > 0.25) {
          alerts.push({
            id: 'carga-alta',
            type: 'warning',
            icon: TrendingUp,
            title: 'Carga tributária elevada',
            message: `Seus impostos representam ${((imposto / receitaMensal) * 100).toFixed(1)}% da receita. Considere otimizar usando o Comparativo de Regimes.`,
            action: 'comparativo',
            actionLabel: 'Otimizar',
            priority: 1,
          });
        }
      }
    }

    // DRE analysis
    if (dre) {
      const d = JSON.parse(dre);
      const rb = d.receitaBruta || 0;
      const imp = d.impostosSobreVendas || 0;
      const cpv = d.cpv || 0;
      const desp = (d.despAdmin || 0) + (d.despPessoal || 0) + (d.despComerciais || 0) + (d.outrasDespesas || 0);
      const lucro = rb - imp - cpv - desp;
      
      if (rb > 0 && lucro < 0) {
        alerts.push({
          id: 'prejuizo-dre',
          type: 'danger',
          icon: TrendingDown,
          title: 'DRE indica prejuízo',
          message: `Seu demonstrativo mostra prejuízo de ${formatCurrency(Math.abs(lucro))}. Revise custos e precificação urgentemente.`,
          action: 'precificacao',
          actionLabel: 'Ajustar preços',
          priority: 0,
        });
      }

      if (rb > 0 && lucro > 0 && (lucro / rb) < 0.05) {
        alerts.push({
          id: 'margem-apertada',
          type: 'warning',
          icon: AlertTriangle,
          title: 'Margem de lucro apertada',
          message: `Sua margem líquida é de apenas ${((lucro / rb) * 100).toFixed(1)}%. Considere revisar preços ou reduzir custos.`,
          action: 'precificacao',
          actionLabel: 'Revisar preços',
          priority: 1,
        });
      }
    }

    // No costs configured yet
    if (!custos && sim) {
      alerts.push({
        id: 'configurar-custos',
        type: 'info',
        icon: Lightbulb,
        title: 'Configure seus custos',
        message: 'Cadastre seus custos operacionais para ter precificação mais precisa e relatórios completos.',
        action: 'custos',
        actionLabel: 'Cadastrar custos',
        priority: 3,
      });
    }

  } catch { /* ignore errors in data parsing */ }

  return alerts.sort((a, b) => a.priority - b.priority);
}

export default function SmartAlerts({ onNavigate, maxAlerts = 3, className = '' }) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('precificalc_dismissed_alerts') || '[]');
    } catch { return []; }
  });

  const alerts = useMemo(() => generateSmartAlerts(), []);
  
  const visibleAlerts = alerts
    .filter(a => !dismissed.includes(a.id))
    .slice(0, maxAlerts);

  const dismiss = (id) => {
    const newDismissed = [...dismissed, id];
    setDismissed(newDismissed);
    try {
      localStorage.setItem('precificalc_dismissed_alerts', JSON.stringify(newDismissed));
    } catch { /* ignore */ }
  };

  if (visibleAlerts.length === 0) return null;

  const typeStyles = {
    saving: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    insight: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
    warning: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    danger: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800',
    info: 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700',
  };

  const iconStyles = {
    saving: 'text-emerald-500',
    insight: 'text-blue-500',
    warning: 'text-amber-500',
    danger: 'text-red-500',
    info: 'text-slate-400',
  };

  const titleStyles = {
    saving: 'text-emerald-700 dark:text-emerald-300',
    insight: 'text-blue-700 dark:text-blue-300',
    warning: 'text-amber-700 dark:text-amber-300',
    danger: 'text-red-700 dark:text-red-300',
    info: 'text-slate-700 dark:text-slate-300',
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {visibleAlerts.map((alert) => {
        const Icon = alert.icon;
        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${typeStyles[alert.type]}`}
          >
            <div className={`p-1.5 rounded-lg bg-white/60 dark:bg-black/20 flex-shrink-0 ${iconStyles[alert.type]}`}>
              <Icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-semibold ${titleStyles[alert.type]}`}>{alert.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{alert.message}</p>
              {alert.action && onNavigate && (
                <button
                  onClick={() => onNavigate(alert.action)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                >
                  {alert.actionLabel} <ChevronRight size={12} />
                </button>
              )}
            </div>
            <button
              onClick={() => dismiss(alert.id)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Fechar alerta"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
