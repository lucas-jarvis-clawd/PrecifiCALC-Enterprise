import { useState, useEffect } from 'react';
import {
  Tags, BarChart3, Wallet, Target, Scale, ArrowRight, TrendingUp,
  AlertTriangle, Zap, DollarSign, Clock, ShoppingBag, Calculator,
} from 'lucide-react';
import { Card, CardBody } from '../components/Card';
import { formatCurrency } from '../data/taxData';
import QuantoSobraCard from '../components/QuantoSobraCard';
import WizardPrecificar from '../components/WizardPrecificar';

function useLimitAlerts() {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    try {
      const result = [];
      const sim = localStorage.getItem('precificalc_simulador');
      if (sim) {
        const d = JSON.parse(sim);
        const receitaMensal = d.receitaMensal || d.receita || 0;
        const regime = d.regime || '';
        const receitaAnual = receitaMensal * 12;
        if (regime === 'mei' && receitaAnual > 65000) {
          result.push({
            tipo: 'warning',
            msg: `O faturamento anual da empresa (${formatCurrency(receitaAnual)}) está chegando perto do limite do MEI (R$ 81.000). Hora de avaliar a migração para Simples Nacional!`,
            emoji: '⚠️',
          });
        }
        if (regime === 'simples' && receitaAnual > 4000000) {
          result.push({
            tipo: 'warning',
            msg: `O faturamento anual da empresa (${formatCurrency(receitaAnual)}) está chegando ao limite do Simples (R$ 4,8 milhões). Hora de avaliar o Lucro Presumido!`,
            emoji: '📈',
          });
        }
      }
      const dre = localStorage.getItem('precificalc_dre');
      if (dre) {
        const d = JSON.parse(dre);
        const rb = d.receitaBruta || 0;
        const imp = d.impostosSobreVendas || 0;
        const cpv = d.cpv || 0;
        const desp = (d.despAdmin || 0) + (d.despPessoal || 0) + (d.despComerciais || 0) + (d.outrasDespesas || 0);
        const lucro = rb - imp - cpv - desp - (d.depreciacao || 0) + (d.resultadoFinanceiro || 0) - (d.irpjCsll || 0);
        if (rb > 0 && lucro < 0) {
          result.push({
            tipo: 'danger',
            msg: `Os números indicam prejuízo de ${formatCurrency(Math.abs(lucro))}! É preciso revisar os preços de venda ou reduzir custos operacionais.`,
            emoji: '🔴',
          });
        }
      }
      setAlerts(result);
    } catch {}
  }, []);
  return alerts;
}

export default function Dashboard({ onNavigate, perfilEmpresa }) {
  const alerts = useLimitAlerts();
  const [showWizard, setShowWizard] = useState(false);
  const [nomeEmpresa, setNomeEmpresa] = useState('');

  useEffect(() => {
    try {
      const p = perfilEmpresa || JSON.parse(localStorage.getItem('precificalc_perfil') || '{}');
      if (p.nomeEmpresa) setNomeEmpresa(p.nomeEmpresa);
    } catch {}
  }, [perfilEmpresa]);

  const quickActions = [
    {
      id: 'wizard',
      emoji: '🎯',
      title: 'Quero Precificar!',
      desc: 'Calcule o preço ideal do produto ou serviço em 5 passos',
      action: () => setShowWizard(true),
      highlight: true,
      color: 'from-brand-600 to-brand-700',
    },
    {
      id: 'precificacao',
      emoji: '🏷️',
      title: 'Formar Preço',
      desc: 'Calculadora completa do preço de venda do produto/serviço',
      action: () => onNavigate('precificacao'),
      color: 'from-blue-600 to-blue-700',
    },
    {
      id: 'comparativo',
      emoji: '📊',
      title: 'Comparar Impostos',
      desc: 'Qual regime tributário paga menos imposto?',
      action: () => onNavigate('comparativo'),
      color: 'from-violet-600 to-violet-700',
    },
    {
      id: 'projecao',
      emoji: '🚀',
      title: 'Projeção de Crescimento',
      desc: 'Se a empresa crescer 10%, 20%, 50% — o que muda?',
      action: () => onNavigate('projecao'),
      color: 'from-emerald-600 to-emerald-700',
    },
  ];

  const modules = [
    { id: 'custos', emoji: '💰', title: 'Custos Operacionais', desc: 'Mapeie todos os gastos fixos e variáveis da empresa' },
    { id: 'equilibrio', emoji: '⚖️', title: 'Ponto de Equilíbrio', desc: 'Mínimo que a empresa precisa vender para não ter prejuízo' },
    { id: 'viabilidade', emoji: '✅', title: 'Viabilidade do Negócio', desc: 'ROI, payback e projeção do investimento' },
    { id: 'dre', emoji: '📋', title: 'Resultado Mensal (DRE)', desc: 'Quanto entrou, quanto saiu, quanto sobrou no negócio' },
    { id: 'enquadramento', emoji: '🏢', title: 'Melhor Regime Tributário', desc: 'MEI, Simples, Presumido ou Real — qual se encaixa?' },
    { id: 'simulador', emoji: '🧮', title: 'Simular Impostos', desc: 'Calcule a carga tributária em cada regime' },
    { id: 'propostas', emoji: '📄', title: 'Criar Proposta', desc: 'Monte uma proposta comercial profissional' },
    { id: 'calendario', emoji: '📅', title: 'Calendário Fiscal', desc: 'Datas de pagamento de impostos e obrigações' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Wizard modal */}
      {showWizard && (
        <WizardPrecificar onClose={() => setShowWizard(false)} onNavigate={onNavigate} />
      )}

      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {nomeEmpresa ? `Olá, ${nomeEmpresa}! 👋` : 'Bem-vindo ao PrecifiCALC! 👋'}
            </h1>
            <p className="text-slate-500 mt-1">
              Ferramenta completa para precificar produtos e serviços da empresa
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
                a.tipo === 'danger'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}
            >
              <span className="text-lg flex-shrink-0">{a.emoji}</span>
              <span className="font-medium">{a.msg}</span>
            </div>
          ))}
        </div>
      )}

      {/* QUANTO SOBRA NO BOLSO - The star of the show */}
      <QuantoSobraCard perfilEmpresa={perfilEmpresa} />

      {/* Quick Actions - Big buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`relative text-left rounded-2xl p-5 text-white transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] shadow-lg ${
              action.highlight
                ? `bg-gradient-to-br ${action.color} ring-2 ring-brand-300 ring-offset-2`
                : `bg-gradient-to-br ${action.color}`
            }`}
          >
            {action.highlight && (
              <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse">
                COMECE AQUI!
              </div>
            )}
            <span className="text-3xl block mb-2">{action.emoji}</span>
            <h3 className="font-bold text-lg">{action.title}</h3>
            <p className="text-white/80 text-sm mt-1">{action.desc}</p>
            <div className="flex items-center gap-1 mt-3 text-white/60 text-xs font-medium">
              Acessar <ArrowRight size={12} />
            </div>
          </button>
        ))}
      </div>

      {/* Other modules */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Mais ferramentas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => onNavigate(mod.id)}
              className="text-left bg-white rounded-xl border border-slate-200 p-4 hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <span className="text-2xl block mb-2">{mod.emoji}</span>
              <h3 className="text-slate-800 font-semibold text-sm mb-1 group-hover:text-brand-700">{mod.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{mod.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Simple regime summary - no jargon */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">🏢 Tipos de empresa no Brasil</h2>
          <p className="text-xs text-slate-500 mt-0.5">Entenda qual regime a empresa se encaixa e se vale trocar</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-pro">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3">Tipo</th>
                <th className="text-left px-5 py-3">Faturamento máximo/ano</th>
                <th className="text-left px-5 py-3">Imposto aproximado</th>
                <th className="text-left px-5 py-3">Pra quem é</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-800 font-semibold">🟢 MEI</td>
                <td className="px-5 py-3">R$ 81 mil</td>
                <td className="px-5 py-3 text-emerald-600 font-medium">~R$ 82-87/mês fixo</td>
                <td className="px-5 py-3">Começando, fatura pouco, quer gastar o mínimo</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-800 font-semibold">🔵 Simples Nacional</td>
                <td className="px-5 py-3">R$ 4,8 milhões</td>
                <td className="px-5 py-3 text-blue-600 font-medium">4% a 33% do faturamento</td>
                <td className="px-5 py-3">Maioria dos pequenos negócios, imposto numa guia só</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-800 font-semibold">🟣 Lucro Presumido</td>
                <td className="px-5 py-3">R$ 78 milhões</td>
                <td className="px-5 py-3 text-violet-600 font-medium">~11% a 17% do faturamento</td>
                <td className="px-5 py-3">Lucro real maior que o governo "presume"</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-800 font-semibold">🟠 Lucro Real</td>
                <td className="px-5 py-3">Sem limite</td>
                <td className="px-5 py-3 text-amber-600 font-medium">~34% sobre o lucro</td>
                <td className="px-5 py-3">Grandes empresas ou margem muito apertada</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
