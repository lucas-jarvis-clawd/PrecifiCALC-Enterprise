import { Calculator, BarChart3, Wallet, Tags, FileText, TrendingUp, Users, DollarSign, ArrowRight } from 'lucide-react';
import { Card, CardBody, StatCard } from '../components/Card';

export default function Dashboard() {
  const features = [
    {
      icon: Calculator,
      title: 'Simulador Tributário',
      desc: 'Calcule impostos em todos os regimes: MEI, Simples Nacional (Anexos I-V), Lucro Presumido e Lucro Real.',
      color: 'from-primary-500 to-emerald-600',
    },
    {
      icon: BarChart3,
      title: 'Comparativo de Regimes',
      desc: 'Compare lado a lado a carga tributária entre todos os regimes para uma mesma receita.',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: Wallet,
      title: 'Custos Operacionais',
      desc: 'Gerencie custos fixos e variáveis do seu escritório com categorização inteligente.',
      color: 'from-purple-500 to-violet-600',
    },
    {
      icon: Tags,
      title: 'Precificação de Serviços',
      desc: 'Calcule o preço ideal para cada serviço contábil com base em custos, impostos e margem.',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: FileText,
      title: 'Gerador de Propostas',
      desc: 'Monte propostas comerciais profissionais com detalhamento completo para seus clientes.',
      color: 'from-rose-500 to-pink-600',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700/50 p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
            <span className="text-primary-400 text-sm font-medium">Sistema Ativo</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            PrecifiCALC
          </h1>
          <p className="text-dark-400 text-lg max-w-2xl">
            Sistema profissional de precificação para consultoria contábil. 
            Banco completo de impostos brasileiros, simulação de regimes e 
            geração de propostas — tudo em um só lugar.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <StatCard
              icon={Calculator}
              label="Regimes Tributários"
              value="4"
              subvalue="MEI, Simples, Presumido, Real"
              color="primary"
              className="min-w-[200px] flex-1"
            />
            <StatCard
              icon={TrendingUp}
              label="Anexos do Simples"
              value="5"
              subvalue="Com todas as 6 faixas cada"
              color="blue"
              className="min-w-[200px] flex-1"
            />
            <StatCard
              icon={DollarSign}
              label="Impostos Mapeados"
              value="12+"
              subvalue="IRPJ, CSLL, PIS, COFINS, ISS..."
              color="purple"
              className="min-w-[200px] flex-1"
            />
            <StatCard
              icon={Users}
              label="Serviços Pré-definidos"
              value="8"
              subvalue="Customizáveis conforme necessidade"
              color="amber"
              className="min-w-[200px] flex-1"
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Módulos do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat, i) => (
            <Card key={i} className="group hover:border-dark-600/50 transition-all duration-300 cursor-pointer" glow>
              <CardBody>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4 
                  group-hover:scale-110 transition-transform duration-300`}>
                  <feat.icon size={20} className="text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">{feat.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{feat.desc}</p>
                <div className="flex items-center gap-1 mt-4 text-primary-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Acessar <ArrowRight size={14} />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Tax Summary Table */}
      <Card>
        <div className="px-6 py-4 border-b border-dark-700/30">
          <h2 className="text-lg font-semibold text-white">Resumo dos Regimes Tributários</h2>
          <p className="text-dark-400 text-sm mt-1">Visão geral das características de cada regime</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700/30">
                <th className="text-left px-6 py-3 text-dark-400 font-medium">Regime</th>
                <th className="text-left px-6 py-3 text-dark-400 font-medium">Limite Anual</th>
                <th className="text-left px-6 py-3 text-dark-400 font-medium">Faixa Alíquota</th>
                <th className="text-left px-6 py-3 text-dark-400 font-medium">Impostos Inclusos</th>
                <th className="text-left px-6 py-3 text-dark-400 font-medium">Indicado Para</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/20">
              <tr className="hover:bg-dark-800/30">
                <td className="px-6 py-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-400" />
                    <span className="text-white font-medium">MEI</span>
                  </span>
                </td>
                <td className="px-6 py-3 text-dark-300">R$ 81.000</td>
                <td className="px-6 py-3 text-primary-400 font-medium">~1-2% efetivo</td>
                <td className="px-6 py-3 text-dark-300">INSS + ISS/ICMS</td>
                <td className="px-6 py-3 text-dark-400">Autônomos, início de operação</td>
              </tr>
              <tr className="hover:bg-dark-800/30">
                <td className="px-6 py-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span className="text-white font-medium">Simples Nacional</span>
                  </span>
                </td>
                <td className="px-6 py-3 text-dark-300">R$ 4.800.000</td>
                <td className="px-6 py-3 text-blue-400 font-medium">4% a 33%</td>
                <td className="px-6 py-3 text-dark-300">DAS unificado (8 tributos)</td>
                <td className="px-6 py-3 text-dark-400">PMEs, simplificação</td>
              </tr>
              <tr className="hover:bg-dark-800/30">
                <td className="px-6 py-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="text-white font-medium">Lucro Presumido</span>
                  </span>
                </td>
                <td className="px-6 py-3 text-dark-300">R$ 78.000.000</td>
                <td className="px-6 py-3 text-purple-400 font-medium">~11-17% serviços</td>
                <td className="px-6 py-3 text-dark-300">IRPJ, CSLL, PIS, COFINS + ISS</td>
                <td className="px-6 py-3 text-dark-400">Margens altas, serviços</td>
              </tr>
              <tr className="hover:bg-dark-800/30">
                <td className="px-6 py-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-white font-medium">Lucro Real</span>
                  </span>
                </td>
                <td className="px-6 py-3 text-dark-300">Sem limite</td>
                <td className="px-6 py-3 text-amber-400 font-medium">~34% sobre lucro</td>
                <td className="px-6 py-3 text-dark-300">IRPJ, CSLL, PIS, COFINS + ISS</td>
                <td className="px-6 py-3 text-dark-400">Margens baixas, grandes empresas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
