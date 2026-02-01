import { useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Calculator, BarChart3, PieChart, Target, DollarSign, Clock } from 'lucide-react';
import { Card, CardBody, StatCard } from '../components/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AnaliseViabilidade() {
  const [dadosNegocio, setDadosNegocio] = useState({
    investimentoInicial: '',
    receitaMensal: '',
    custoFixoMensal: '',
    custoVariavelPercentual: '',
    atividade: 'servicos',
    regime: 'simples',
    margem: '30'
  });

  const [resultado, setResultado] = useState(null);

  const calcularViabilidade = () => {
    const receita = parseFloat(dadosNegocio.receitaMensal) || 0;
    const custoFixo = parseFloat(dadosNegocio.custoFixoMensal) || 0;
    const custoVariavel = (receita * parseFloat(dadosNegocio.custoVariavelPercentual)) / 100 || 0;
    const investimento = parseFloat(dadosNegocio.investimentoInicial) || 0;

    // Cálculo tributário simplificado por regime
    let aliquotaTributaria = 0;
    switch (dadosNegocio.regime) {
      case 'mei':
        aliquotaTributaria = 1.5;
        break;
      case 'simples':
        aliquotaTributaria = dadosNegocio.atividade === 'servicos' ? 15 : 8;
        break;
      case 'presumido':
        aliquotaTributaria = dadosNegocio.atividade === 'servicos' ? 16.5 : 13.5;
        break;
      case 'real':
        aliquotaTributaria = 11.33;
        break;
    }

    const impostos = (receita * aliquotaTributaria) / 100;
    const custoTotal = custoFixo + custoVariavel + impostos;
    const lucroMensal = receita - custoTotal;
    const margemLucro = (lucroMensal / receita) * 100;
    const payback = investimento > 0 ? investimento / lucroMensal : 0;
    const pontoEquilibrio = custoFixo / ((receita - custoVariavel - impostos) / receita);

    // Projeção 12 meses
    const projecao = Array.from({ length: 12 }, (_, i) => ({
      mes: i + 1,
      receita: receita,
      custos: custoTotal,
      lucro: lucroMensal,
      acumulado: lucroMensal * (i + 1) - investimento
    }));

    // Distribuição de custos
    const distribuicaoCustos = [
      { name: 'Custos Fixos', value: custoFixo, color: '#ef4444' },
      { name: 'Custos Variáveis', value: custoVariavel, color: '#f59e0b' },
      { name: 'Impostos', value: impostos, color: '#8b5cf6' },
      { name: 'Lucro Líquido', value: lucroMensal, color: '#10b981' }
    ];

    setResultado({
      lucroMensal,
      margemLucro,
      payback,
      pontoEquilibrio,
      impostos,
      custoTotal,
      projecao,
      distribuicaoCustos,
      viabilidade: margemLucro > 20 ? 'excelente' : margemLucro > 10 ? 'boa' : margemLucro > 0 ? 'limitada' : 'inviavel'
    });
  };

  const getViabilidadeColor = (viabilidade) => {
    switch (viabilidade) {
      case 'excelente': return 'text-green-400 bg-green-400/10';
      case 'boa': return 'text-blue-400 bg-blue-400/10';
      case 'limitada': return 'text-yellow-400 bg-yellow-400/10';
      case 'inviavel': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getViabilidadeTexto = (viabilidade) => {
    switch (viabilidade) {
      case 'excelente': return 'Excelente Viabilidade';
      case 'boa': return 'Boa Viabilidade';
      case 'limitada': return 'Viabilidade Limitada';
      case 'inviavel': return 'Negócio Inviável';
      default: return 'Não Calculado';
    }
  };

  const getViabilidadeIcon = (viabilidade) => {
    switch (viabilidade) {
      case 'excelente': 
      case 'boa': 
        return CheckCircle;
      case 'limitada': 
      case 'inviavel':
        return AlertCircle;
      default: 
        return Calculator;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
          <TrendingUp size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Análise de Viabilidade</h1>
          <p className="text-dark-400">Avalie se vale a pena abrir ou manter o negócio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="xl:col-span-1">
          <Card>
            <div className="px-6 py-4 border-b border-dark-700/30">
              <h2 className="font-semibold text-white">Dados do Negócio</h2>
            </div>
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Investimento Inicial (R$)
                </label>
                <input
                  type="number"
                  value={dadosNegocio.investimentoInicial}
                  onChange={(e) => setDadosNegocio({ ...dadosNegocio, investimentoInicial: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                  placeholder="Ex: 50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Receita Mensal Esperada (R$)
                </label>
                <input
                  type="number"
                  value={dadosNegocio.receitaMensal}
                  onChange={(e) => setDadosNegocio({ ...dadosNegocio, receitaMensal: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                  placeholder="Ex: 30000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Custo Fixo Mensal (R$)
                </label>
                <input
                  type="number"
                  value={dadosNegocio.custoFixoMensal}
                  onChange={(e) => setDadosNegocio({ ...dadosNegocio, custoFixoMensal: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                  placeholder="Ex: 8000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Custo Variável (% da receita)
                </label>
                <input
                  type="number"
                  value={dadosNegocio.custoVariavelPercentual}
                  onChange={(e) => setDadosNegocio({ ...dadosNegocio, custoVariavelPercentual: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                  placeholder="Ex: 20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Tipo de Atividade
                </label>
                <select
                  value={dadosNegocio.atividade}
                  onChange={(e) => setDadosNegocio({ ...dadosNegocio, atividade: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                >
                  <option value="servicos">Serviços</option>
                  <option value="comercio">Comércio</option>
                  <option value="industria">Indústria</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  Regime Tributário
                </label>
                <select
                  value={dadosNegocio.regime}
                  onChange={(e) => setDadosNegocio({ ...dadosNegocio, regime: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white"
                >
                  <option value="mei">MEI</option>
                  <option value="simples">Simples Nacional</option>
                  <option value="presumido">Lucro Presumido</option>
                  <option value="real">Lucro Real</option>
                </select>
              </div>

              <button
                onClick={calcularViabilidade}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-violet-700 transition-all duration-200"
              >
                <Calculator size={16} className="inline mr-2" />
                Analisar Viabilidade
              </button>
            </CardBody>
          </Card>
        </div>

        {/* Resultados */}
        <div className="xl:col-span-2 space-y-6">
          {resultado && (
            <>
              {/* Status da Viabilidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={getViabilidadeIcon(resultado.viabilidade)}
                  label="Status"
                  value={getViabilidadeTexto(resultado.viabilidade)}
                  className={getViabilidadeColor(resultado.viabilidade)}
                />
                <StatCard
                  icon={DollarSign}
                  label="Lucro Mensal"
                  value={`R$ ${resultado.lucroMensal.toLocaleString('pt-BR')}`}
                  subvalue={`${resultado.margemLucro.toFixed(1)}% margem`}
                  color="primary"
                />
                <StatCard
                  icon={Clock}
                  label="Payback"
                  value={resultado.payback > 0 ? `${resultado.payback.toFixed(1)} meses` : 'N/A'}
                  subvalue="Retorno investimento"
                  color="blue"
                />
                <StatCard
                  icon={Target}
                  label="Ponto Equilíbrio"
                  value={`R$ ${resultado.pontoEquilibrio.toLocaleString('pt-BR')}`}
                  subvalue="Receita mínima"
                  color="amber"
                />
              </div>

              {/* Projeção 12 Meses */}
              <Card>
                <div className="px-6 py-4 border-b border-dark-700/30">
                  <h3 className="font-semibold text-white">Projeção Financeira - 12 Meses</h3>
                </div>
                <CardBody>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={resultado.projecao}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="mes" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                          labelStyle={{ color: '#f3f4f6' }}
                        />
                        <Line type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={2} name="Lucro Mensal" />
                        <Line type="monotone" dataKey="acumulado" stroke="#3b82f6" strokeWidth={2} name="Lucro Acumulado" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribuição de Custos */}
                <Card>
                  <div className="px-6 py-4 border-b border-dark-700/30">
                    <h3 className="font-semibold text-white">Distribuição de Custos</h3>
                  </div>
                  <CardBody>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={resultado.distribuicaoCustos}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                          >
                            {resultado.distribuicaoCustos.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {resultado.distribuicaoCustos.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-dark-300">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* Resumo Executivo */}
                <Card>
                  <div className="px-6 py-4 border-b border-dark-700/30">
                    <h3 className="font-semibold text-white">Resumo Executivo</h3>
                  </div>
                  <CardBody className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-dark-400">Receita Mensal:</span>
                        <span className="text-white font-medium">R$ {parseFloat(dadosNegocio.receitaMensal || 0).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-400">Impostos:</span>
                        <span className="text-white font-medium">R$ {resultado.impostos.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-400">Custos Totais:</span>
                        <span className="text-white font-medium">R$ {resultado.custoTotal.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between border-t border-dark-700/30 pt-2">
                        <span className="text-dark-400 font-medium">Lucro Líquido:</span>
                        <span className={`font-bold ${resultado.lucroMensal > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          R$ {resultado.lucroMensal.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-dark-700/30">
                      <h4 className="text-white font-medium mb-2">Recomendações:</h4>
                      <div className="space-y-1 text-sm text-dark-300">
                        {resultado.margemLucro > 20 && (
                          <div className="text-green-400">✓ Excelente margem de lucro</div>
                        )}
                        {resultado.margemLucro <= 10 && resultado.margemLucro > 0 && (
                          <div className="text-yellow-400">⚠ Margem baixa, revisar custos</div>
                        )}
                        {resultado.margemLucro <= 0 && (
                          <div className="text-red-400">✗ Negócio inviável, reestruturar</div>
                        )}
                        {resultado.payback > 24 && (
                          <div className="text-yellow-400">⚠ Payback muito longo</div>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </>
          )}

          {!resultado && (
            <Card className="h-64 flex items-center justify-center">
              <div className="text-center">
                <Calculator size={48} className="text-dark-600 mx-auto mb-4" />
                <p className="text-dark-400">Preencha os dados para analisar a viabilidade</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}