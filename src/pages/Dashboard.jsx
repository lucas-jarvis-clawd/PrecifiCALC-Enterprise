import { useState, useEffect } from 'react';
import { Calculator, BarChart3, Wallet, Tags, FileText, Target, Scale, ArrowRight, FileSpreadsheet, CalendarDays, UserCheck, AlertTriangle } from 'lucide-react';
import { Card, CardBody, StatCard } from '../components/Card';
import { formatCurrency } from '../data/taxData';

function useLimitAlerts() {
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    try {
      const result = [];
      // Check simulador data
      const sim = localStorage.getItem('precificalc_simulador');
      if (sim) {
        const d = JSON.parse(sim);
        const receitaMensal = d.receitaMensal || d.receita || 0;
        const regime = d.regime || '';
        const receitaAnual = receitaMensal * 12;
        if (regime === 'mei' && receitaAnual > 65000) {
          result.push({
            tipo: 'warning',
            msg: `Receita anual estimada de ${formatCurrency(receitaAnual)} está próxima do limite MEI (R$ 81.000). Considere migrar para o Simples Nacional.`,
          });
        }
        if (regime === 'simples' && receitaAnual > 4000000) {
          result.push({
            tipo: 'warning',
            msg: `Receita anual estimada de ${formatCurrency(receitaAnual)} está próxima do limite do Simples Nacional (R$ 4.800.000). Avalie o Lucro Presumido ou Real.`,
          });
        }
        if (regime === 'presumido' && receitaAnual > 60000000) {
          result.push({
            tipo: 'warning',
            msg: `Receita anual estimada de ${formatCurrency(receitaAnual)} está próxima do limite do Lucro Presumido (R$ 78.000.000). Prepare migração para Lucro Real.`,
          });
        }
      }
      // Check DRE data
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
            msg: `O DRE indica prejuízo líquido de ${formatCurrency(Math.abs(lucro))}. Revise custos e receitas.`,
          });
        }
      }
      setAlerts(result);
    } catch {}
  }, []);
  return alerts;
}

export default function Dashboard({ onNavigate }) {
  const alerts = useLimitAlerts();

  const modules = [
    { id: 'simulador', icon: Calculator, title: 'Simulador Tributário', desc: 'Calcule a carga tributária em todos os regimes: MEI, Simples Nacional, Lucro Presumido e Lucro Real.' },
    { id: 'comparativo', icon: BarChart3, title: 'Comparativo de Regimes', desc: 'Compare lado a lado a carga tributária entre todos os regimes para encontrar o mais vantajoso.' },
    { id: 'viabilidade', icon: Target, title: 'Análise de Viabilidade', desc: 'Avalie a viabilidade do negócio com cálculo de ROI, payback e projeção financeira.' },
    { id: 'custos', icon: Wallet, title: 'Custos Operacionais', desc: 'Mapeie custos fixos e variáveis do negócio para formar preço e analisar viabilidade.' },
    { id: 'precificacao', icon: Tags, title: 'Precificação', desc: 'Calcule o preço de venda de produtos e serviços considerando custos, tributos e margem.' },
    { id: 'equilibrio', icon: Scale, title: 'Ponto de Equilíbrio', desc: 'Determine a receita mínima necessária para cobrir todos os custos e começar a lucrar.' },
    { id: 'dre', icon: FileSpreadsheet, title: 'DRE', desc: 'Monte o Demonstrativo de Resultado do Exercício com cálculo automático de margens e EBITDA.' },
    { id: 'calendario', icon: CalendarDays, title: 'Calendário Fiscal', desc: 'Consulte todas as obrigações tributárias e trabalhistas com prazos de vencimento por regime.' },
    { id: 'enquadramento', icon: UserCheck, title: 'Enquadramento Tributário', desc: 'Receba uma recomendação de regime tributário baseada no perfil da sua empresa.' },
    { id: 'propostas', icon: FileText, title: 'Gerador de Propostas', desc: 'Crie propostas comerciais de produtos e serviços com detalhamento e impressão em PDF.' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold text-slate-800">PrecifiCALC Enterprise</h1>
        <p className="text-slate-500 mt-1">Plataforma de precificação, análise tributária e gestão financeira empresarial</p>
      </div>

      {/* Alertas de limites */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                a.tipo === 'danger'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}
            >
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{a.msg}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calculator} label="Regimes Tributários" value="4" subvalue="MEI, Simples, Presumido, Real" color="brand" />
        <StatCard icon={BarChart3} label="Anexos do Simples" value="5" subvalue="30 faixas de alíquotas" color="blue" />
        <StatCard icon={Tags} label="Tributos Mapeados" value="12+" subvalue="IRPJ, CSLL, PIS, COFINS, ISS..." color="purple" />
        <StatCard icon={Scale} label="Base Atualizada" value="2026" subvalue="Legislação vigente" color="green" />
      </div>

      <div>
        <h2 className="text-lg font-medium text-slate-800 mb-4">Módulos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => onNavigate(mod.id)}
              className="text-left bg-white rounded-lg border border-slate-200 p-5 hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-md bg-slate-100 text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-50 transition-colors">
                  <mod.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-slate-800 font-medium mb-1 group-hover:text-brand-700 transition-colors">{mod.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{mod.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-slate-400 text-xs font-medium group-hover:text-brand-600 transition-colors">
                Acessar módulo <ArrowRight size={12} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-medium text-slate-800">Resumo dos Regimes Tributários</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-pro">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3">Regime</th>
                <th className="text-left px-5 py-3">Limite Anual</th>
                <th className="text-left px-5 py-3">Alíquota</th>
                <th className="text-left px-5 py-3">Tributos</th>
                <th className="text-left px-5 py-3">Indicado Para</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-800 font-medium">MEI</td>
                <td className="px-5 py-3">R$ 81.000</td>
                <td className="px-5 py-3 text-emerald-600 font-medium">~1-2%</td>
                <td className="px-5 py-3">INSS + ISS/ICMS</td>
                <td className="px-5 py-3">O objetivo é regularizar, testar o negócio ou faturar pouco com custo mínimo.</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-800 font-medium">Simples Nacional</td>
                <td className="px-5 py-3">R$ 4.800.000</td>
                <td className="px-5 py-3 text-blue-600 font-medium">4% a 33%</td>
                <td className="px-5 py-3">DAS Unificado</td>
                <td className="px-5 py-3">O foco é simplicidade e previsibilidade, não otimização fiscal máxima.</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-800 font-medium">Lucro Presumido</td>
                <td className="px-5 py-3">R$ 78.000.000</td>
                <td className="px-5 py-3 text-violet-600 font-medium">~11-17%</td>
                <td className="px-5 py-3">IRPJ, CSLL, PIS, COFINS, ISS</td>
                <td className="px-5 py-3">A margem real é maior que a margem presumida pela lei.</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-800 font-medium">Lucro Real</td>
                <td className="px-5 py-3">Sem limite</td>
                <td className="px-5 py-3 text-amber-600 font-medium">~34% s/ lucro</td>
                <td className="px-5 py-3">IRPJ, CSLL, PIS, COFINS, ISS</td>
                <td className="px-5 py-3">A empresa tem muitos créditos, margem apertada ou oscilações fortes no resultado.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
