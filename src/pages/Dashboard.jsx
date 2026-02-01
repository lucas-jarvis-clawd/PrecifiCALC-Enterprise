import { Calculator, BarChart3, Wallet, Tags, FileText, Target, Scale, ArrowRight } from 'lucide-react';
import { Card, CardBody, StatCard } from '../components/Card';

export default function Dashboard({ onNavigate }) {
  const modules = [
    {
      id: 'simulador',
      icon: Calculator,
      title: 'Simulador Tributario',
      desc: 'Calcule a carga tributaria em todos os regimes: MEI, Simples Nacional, Lucro Presumido e Lucro Real.',
    },
    {
      id: 'comparativo',
      icon: BarChart3,
      title: 'Comparativo de Regimes',
      desc: 'Compare lado a lado a carga tributaria entre todos os regimes para encontrar o mais vantajoso.',
    },
    {
      id: 'viabilidade',
      icon: Target,
      title: 'Analise de Viabilidade',
      desc: 'Avalie a viabilidade do negocio com calculo de ROI, payback e projecao financeira.',
    },
    {
      id: 'custos',
      icon: Wallet,
      title: 'Custos Operacionais',
      desc: 'Mapeie custos fixos e variaveis do negocio para formar preco e analisar viabilidade.',
    },
    {
      id: 'precificacao',
      icon: Tags,
      title: 'Precificacao',
      desc: 'Calcule o preco de venda de produtos e servicos considerando custos, impostos e margem.',
    },
    {
      id: 'equilibrio',
      icon: Scale,
      title: 'Ponto de Equilibrio',
      desc: 'Determine a receita minima necessaria para cobrir todos os custos e comecar a lucrar.',
    },
    {
      id: 'propostas',
      icon: FileText,
      title: 'Gerador de Propostas',
      desc: 'Crie propostas comerciais de produtos e servicos com detalhamento e impressao em PDF.',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-surface-700 pb-6">
        <h1 className="text-2xl font-semibold text-white">PrecifiCALC Enterprise</h1>
        <p className="text-surface-400 mt-1">
          Plataforma de precificacao, analise tributaria e gestao financeira empresarial
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Calculator}
          label="Regimes Tributarios"
          value="4"
          subvalue="MEI, Simples, Presumido, Real"
          color="brand"
        />
        <StatCard
          icon={BarChart3}
          label="Anexos do Simples"
          value="5"
          subvalue="30 faixas de aliquotas"
          color="blue"
        />
        <StatCard
          icon={Tags}
          label="Impostos Mapeados"
          value="12+"
          subvalue="IRPJ, CSLL, PIS, COFINS, ISS..."
          color="purple"
        />
        <StatCard
          icon={Scale}
          label="Base Atualizada"
          value="2025"
          subvalue="Legislacao vigente"
          color="green"
        />
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-lg font-medium text-white mb-4">Modulos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => onNavigate(mod.id)}
              className="text-left bg-surface-800 rounded-lg border border-surface-700 p-5 hover:border-surface-600 hover:bg-surface-800/80 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-md bg-surface-700/50 text-surface-400 group-hover:text-brand-400 transition-colors">
                  <mod.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium mb-1 group-hover:text-brand-400 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-surface-500 text-sm leading-relaxed">{mod.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-surface-500 text-xs font-medium group-hover:text-brand-400 transition-colors">
                Acessar modulo <ArrowRight size={12} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tax Summary */}
      <Card>
        <div className="px-5 py-4 border-b border-surface-700">
          <h2 className="text-base font-medium text-white">Resumo dos Regimes Tributarios</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-pro">
            <thead>
              <tr className="border-b border-surface-700">
                <th className="text-left px-5 py-3">Regime</th>
                <th className="text-left px-5 py-3">Limite Anual</th>
                <th className="text-left px-5 py-3">Aliquota</th>
                <th className="text-left px-5 py-3">Impostos</th>
                <th className="text-left px-5 py-3">Indicado Para</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              <tr className="hover:bg-surface-800/50">
                <td className="px-5 py-3 text-white font-medium">MEI</td>
                <td className="px-5 py-3 text-surface-300">R$ 81.000</td>
                <td className="px-5 py-3 text-emerald-400 font-medium">~1-2%</td>
                <td className="px-5 py-3 text-surface-400">INSS + ISS/ICMS</td>
                <td className="px-5 py-3 text-surface-400">Autonomos, micronegocios</td>
              </tr>
              <tr className="hover:bg-surface-800/50">
                <td className="px-5 py-3 text-white font-medium">Simples Nacional</td>
                <td className="px-5 py-3 text-surface-300">R$ 4.800.000</td>
                <td className="px-5 py-3 text-blue-400 font-medium">4% a 33%</td>
                <td className="px-5 py-3 text-surface-400">DAS unificado (8 tributos)</td>
                <td className="px-5 py-3 text-surface-400">PMEs</td>
              </tr>
              <tr className="hover:bg-surface-800/50">
                <td className="px-5 py-3 text-white font-medium">Lucro Presumido</td>
                <td className="px-5 py-3 text-surface-300">R$ 78.000.000</td>
                <td className="px-5 py-3 text-violet-400 font-medium">~11-17%</td>
                <td className="px-5 py-3 text-surface-400">IRPJ, CSLL, PIS, COFINS, ISS</td>
                <td className="px-5 py-3 text-surface-400">Margens altas, servicos</td>
              </tr>
              <tr className="hover:bg-surface-800/50">
                <td className="px-5 py-3 text-white font-medium">Lucro Real</td>
                <td className="px-5 py-3 text-surface-300">Sem limite</td>
                <td className="px-5 py-3 text-amber-400 font-medium">~34% s/ lucro</td>
                <td className="px-5 py-3 text-surface-400">IRPJ, CSLL, PIS, COFINS, ISS</td>
                <td className="px-5 py-3 text-surface-400">Margens baixas, grandes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
