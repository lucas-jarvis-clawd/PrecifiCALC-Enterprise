import { useState, useEffect } from 'react';
import { ArrowRight, LayoutDashboard, Search } from 'lucide-react';
import { Card, CardBody } from '../components/Card';
import { formatCurrency, formatPercent, simplesNacional } from '../data/taxData';
import QuantoSobraCard from '../components/QuantoSobraCard';
import WizardPrecificar from '../components/WizardPrecificar';
import PageHeader from '../components/PageHeader';
import HistoricoCalcMensal from '../components/HistoricoCalcMensal';

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
            msg: `O faturamento anual da empresa (${formatCurrency(receitaAnual)}) está chegando perto do limite do MEI (R$ 81.000). Avalie a migração para Simples Nacional.`,
            emoji: '',
          });
        }
        if (regime === 'simples' && receitaAnual > 4000000) {
          result.push({
            tipo: 'warning',
            msg: `O faturamento anual da empresa (${formatCurrency(receitaAnual)}) está chegando ao limite do Simples (R$ 4,8 milhões). Avalie a transição para Lucro Presumido.`,
            emoji: '',
          });
        }
        // Faixa change alert for Simples Nacional
        if (regime === 'simples' && d.rbt12) {
          const rbt12 = d.rbt12;
          const anexo = d.anexo || 'III';
          const anexoData = simplesNacional.anexos[anexo];
          if (anexoData) {
            const faixas = anexoData.faixas;
            const currentFaixa = faixas.find(f => rbt12 >= f.de && rbt12 <= f.ate);
            if (currentFaixa) {
              const idx = faixas.indexOf(currentFaixa);
              if (idx < faixas.length - 1) {
                const distancia = currentFaixa.ate - rbt12;
                const threshold = currentFaixa.ate * 0.10;
                if (distancia <= threshold) {
                  const nextFaixa = faixas[idx + 1];
                  result.push({
                    tipo: 'warning',
                    msg: `Atenção: mais ${formatCurrency(distancia)} de receita bruta e a empresa muda para a faixa ${idx + 2} do ${anexoData.nome} (alíquota nominal de ${formatPercent(nextFaixa.aliquota)}).`,
                    emoji: '',
                  });
                }
              }
            }
          }
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
            msg: `Os números indicam prejuízo de ${formatCurrency(Math.abs(lucro))}. É preciso revisar os preços de venda ou reduzir custos operacionais.`,
            emoji: '',
          });
        }
      }
      setAlerts(result);
    } catch (error) {
      console.warn('Failed to load data:', error);
    }
  }, []);
  return alerts;
}

export default function Dashboard({ onNavigate, perfilEmpresa }) {
  const alerts = useLimitAlerts();
  const [showWizard, setShowWizard] = useState(false);
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [moduleBusca, setModuleBusca] = useState('');

  useEffect(() => {
    try {
      const p = perfilEmpresa || JSON.parse(localStorage.getItem('precificalc_perfil') || '{}');
      if (p.nomeEmpresa) setNomeEmpresa(p.nomeEmpresa);
    } catch (error) {
      console.warn('Failed to load data:', error);
    }
  }, [perfilEmpresa]);

  const quickActions = [
    {
      id: 'wizard',
      emoji: '',
      title: 'Calcular Preço',
      desc: 'Calcule o preço ideal do produto ou serviço em 5 passos',
      action: () => setShowWizard(true),
      highlight: true,
    },
    {
      id: 'precificacao',
      emoji: '',
      title: 'Formar Preço',
      desc: 'Calculadora completa do preço de venda do produto/serviço',
      action: () => onNavigate('precificacao'),
    },
    {
      id: 'comparativo',
      emoji: '',
      title: 'Comparar Tributos',
      desc: 'Qual regime tributário paga menos tributo?',
      action: () => onNavigate('comparativo'),
    },
    {
      id: 'projecao',
      emoji: '',
      title: 'Projeção de Crescimento',
      desc: 'Se a empresa crescer 10%, 20%, 50% — o que muda?',
      action: () => onNavigate('projecao'),
    },
  ];

  const modules = [
    { id: 'custos', emoji: '', title: 'Custos Operacionais', desc: 'Mapeie todos os gastos fixos e variáveis da empresa' },
    { id: 'equilibrio', emoji: '', title: 'Ponto de Equilíbrio', desc: 'Mínimo que a empresa precisa vender para não ter prejuízo' },
    { id: 'viabilidade', emoji: '', title: 'Viabilidade do Negócio', desc: 'ROI, payback e projeção do investimento' },
    { id: 'dre', emoji: '', title: 'Resultado Mensal (DRE)', desc: 'Quanto entrou, quanto saiu, quanto sobrou no negócio' },
    { id: 'enquadramento', emoji: '', title: 'Melhor Regime Tributário', desc: 'MEI, Simples, Presumido ou Real — qual se encaixa?' },
    { id: 'simulador', emoji: '', title: 'Simular Tributos', desc: 'Calcule a carga tributária em cada regime' },
    { id: 'propostas', emoji: '', title: 'Criar Proposta', desc: 'Monte uma proposta comercial profissional' },
    { id: 'calendario', emoji: '', title: 'Calendário Fiscal', desc: 'Datas de pagamento de tributos e obrigações' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Wizard modal */}
      {showWizard && (
        <WizardPrecificar onClose={() => setShowWizard(false)} onNavigate={onNavigate} />
      )}

      <PageHeader
        icon={LayoutDashboard}
        title={nomeEmpresa ? `Olá, ${nomeEmpresa}` : 'Bem-vindo ao PrecifiCALC'}
        description="Ferramenta completa para precificar produtos e serviços da empresa"
      />

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
      <QuantoSobraCard perfilEmpresa={perfilEmpresa} onNavigate={onNavigate} />

      {/* Quick Actions - Big buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`relative text-left rounded-2xl p-5 bg-white border border-slate-200 transition-all hover:scale-[1.02] hover:border-[#001a2d] hover:shadow-lg active:scale-[0.98]`}
          >
            {action.highlight && (
              <div className="absolute -top-2 -right-2 bg-[#001a2d] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                Começar aqui
              </div>
            )}
            <span className="text-3xl block mb-2">{action.emoji}</span>
            <h3 className="font-bold text-lg text-[#1a2332]">{action.title}</h3>
            <p className="text-slate-500 text-sm mt-1">{action.desc}</p>
            <div className="flex items-center gap-1 mt-3 text-slate-400 text-xs font-medium">
              Acessar <ArrowRight size={12} />
            </div>
          </button>
        ))}
      </div>

      {/* Other modules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Mais ferramentas</h2>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={moduleBusca}
              onChange={(e) => setModuleBusca(e.target.value)}
              placeholder="Buscar modulo..."
              className="w-48 pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>
        {(() => {
          const filteredModules = modules.filter(mod => {
            if (!moduleBusca) return true;
            const q = moduleBusca.toLowerCase();
            return mod.title.toLowerCase().includes(q) || mod.desc.toLowerCase().includes(q);
          });
          if (filteredModules.length === 0) {
            return (
              <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                Nenhum modulo encontrado.
              </div>
            );
          }
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {filteredModules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => onNavigate(mod.id)}
                  className="text-left bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-[#1e3a5f] hover:shadow-md transition-all group"
                >
                  <span className="text-2xl block mb-2">{mod.emoji}</span>
                  <h3 className="text-[#1a2332] dark:text-slate-200 font-semibold text-sm mb-1 group-hover:text-[#1e3a5f]">{mod.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{mod.desc}</p>
                </button>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Historico Mensal */}
      <HistoricoCalcMensal />

      {/* Simple regime summary - no jargon */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-[#1a2332]">Tipos de empresa no Brasil</h2>
          <p className="text-xs text-slate-500 mt-0.5">Entenda qual regime a empresa se encaixa e se vale trocar</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-pro">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3">Tipo</th>
                <th className="text-left px-5 py-3">Receita Bruta (Faturamento) máximo/ano</th>
                <th className="text-left px-5 py-3">Tributo aproximado</th>
                <th className="text-left px-5 py-3">Pra quem é</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-[#1a2332] font-semibold">MEI</td>
                <td className="px-5 py-3">R$ 81 mil</td>
                <td className="px-5 py-3 text-[#1e3a5f] font-medium">~R$ 82-87/mês fixo</td>
                <td className="px-5 py-3">Começando, fatura pouco, quer gastar o mínimo</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-[#1a2332] font-semibold">Simples Nacional</td>
                <td className="px-5 py-3">R$ 4,8 milhões</td>
                <td className="px-5 py-3 text-[#1e3a5f] font-medium">4% a 33% do faturamento</td>
                <td className="px-5 py-3">Maioria dos pequenos negócios, tributo numa guia só</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-[#1a2332] font-semibold">Lucro Presumido</td>
                <td className="px-5 py-3">R$ 78 milhões</td>
                <td className="px-5 py-3 text-[#1e3a5f] font-medium">~11% a 17% do faturamento</td>
                <td className="px-5 py-3">Lucro real maior que o governo "presume"</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-[#1a2332] font-semibold">Lucro Real</td>
                <td className="px-5 py-3">Sem limite</td>
                <td className="px-5 py-3 text-[#1e3a5f] font-medium">~34% sobre o lucro</td>
                <td className="px-5 py-3">Grandes empresas ou margem muito apertada</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
