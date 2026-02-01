import { Calculator, BarChart3, Wallet, Tags, FileText, Target, Scale, ArrowRight } from 'lucide-react';
import { Card, CardBody, StatCard } from '../components/Card';

export default function Dashboard({ onNavigate }) {
  const modules = [
    { id: 'simulador', icon: Calculator, title: 'Simulador Tributário', desc: 'Calcule a carga tributária em todos os regimes: MEI, Simples Nacional, Lucro Presumido e Lucro Real.' },
    { id: 'comparativo', icon: BarChart3, title: 'Comparativo de Regimes', desc: 'Compare lado a lado a carga tributária entre todos os regimes para encontrar o mais vantajoso.' },
    { id: 'viabilidade', icon: Target, title: 'Análise de Viabilidade', desc: 'Avalie a viabilidade do negócio com cálculo de ROI, payback e projeção financeira.' },
    { id: 'custos', icon: Wallet, title: 'Custos Operacionais', desc: 'Mapeie custos fixos e variáveis do negócio para formar preço e analisar viabilidade.' },
    { id: 'precificacao', icon: Tags, title: 'Precificação', desc: 'Calcule o preço de venda de produtos e serviços considerando custos, impostos e margem.' },
    { id: 'equilibrio', icon: Scale, title: 'Ponto de Equilíbrio', desc: 'Determine a receita mínima necessária para cobrir todos os custos e começar a lucrar.' },
    { id: 'propostas', icon: FileText, title: 'Gerador de Propostas', desc: 'Crie propostas comerciais de produtos e serviços com detalhamento e impressão em PDF.' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-semibold text-slate-800">PrecifiCALC Enterprise</h1>
        <p className="text-slate-500 mt-1">Plataforma de precificação, análise tributária e gestão financeira empresarial</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calculator} label="Regimes Tributários" value="4" subvalue="MEI, Simples, Presumido, Real" color="brand" />
        <StatCard icon={BarChart3} label="Anexos do Simples" value="5" subvalue="30 faixas de alíquotas" color="blue" />
        <StatCard icon={Tags} label="Impostos Mapeados" value="12+" subvalue="IRPJ, CSLL, PIS, COFINS, ISS..." color="purple" />
        <StatCard icon={Scale} label="Base Atualizada" value="2025" subvalue="Legislação vigente" color="green" />
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
                <th className="text-left px-5 py-3">Impostos</th>
                <th className="text-left px-5 py-3">Indicado Para</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-800 font-medium">MEI</td>
                <td className="px-5 py-3">R$ 81.000</td>
                <td className="px-5 py-3 text-emerald-600 font-medium">~1-2%</td>
                <td className="px-5 py-3">INSS + ISS/ICMS</td>
                <td className="px-5 py-3">Autônomos, micronegócios</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-800 font-medium">Simples Nacional</td>
                <td className="px-5 py-3">R$ 4.800.000</td>
                <td className="px-5 py-3 text-blue-600 font-medium">4% a 33%</td>
                <td className="px-5 py-3">DAS unificado (8 tributos)</td>
                <td className="px-5 py-3">PMEs</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-800 font-medium">Lucro Presumido</td>
                <td className="px-5 py-3">R$ 78.000.000</td>
                <td className="px-5 py-3 text-violet-600 font-medium">~11-17%</td>
                <td className="px-5 py-3">IRPJ, CSLL, PIS, COFINS, ISS</td>
                <td className="px-5 py-3">Margens altas, serviços</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-800 font-medium">Lucro Real</td>
                <td className="px-5 py-3">Sem limite</td>
                <td className="px-5 py-3 text-amber-600 font-medium">~34% s/ lucro</td>
                <td className="px-5 py-3">IRPJ, CSLL, PIS, COFINS, ISS</td>
                <td className="px-5 py-3">Margens baixas, grandes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
