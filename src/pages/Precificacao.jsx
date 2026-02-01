import { useState, useMemo } from 'react';
import { Tags, Plus, Trash2, DollarSign, Clock, TrendingUp, Target } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import {
  formatCurrency,
  formatPercent,
  servicosContabeis,
  calcSimplesTax,
  calcLucroPresumido,
} from '../data/taxData';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

export default function Precificacao() {
  const [custoHora, setCustoHora] = useState(85);
  const [margemDesejada, setMargemDesejada] = useState(40);
  const [regimeEscritorio, setRegimeEscritorio] = useState('simples');
  const [receitaAnualEscritorio, setReceitaAnualEscritorio] = useState(600000);
  const [servicos, setServicos] = useState(
    servicosContabeis.map(s => ({
      ...s,
      horasCustom: s.horasEstimadas,
      precoManual: null,
      ativo: true,
    }))
  );

  // Tax rate for the office itself
  const taxaImpostoEscritorio = useMemo(() => {
    if (regimeEscritorio === 'simples') {
      const result = calcSimplesTax(receitaAnualEscritorio, 'III');
      return result ? result.aliquotaEfetiva : 0.10;
    } else {
      const result = calcLucroPresumido(receitaAnualEscritorio / 12, 'servicos', 0.05);
      return result ? result.aliquotaEfetiva : 0.14;
    }
  }, [regimeEscritorio, receitaAnualEscritorio]);

  function calcPreco(servico) {
    const horas = servico.horasCustom;
    const custoBase = horas * custoHora;
    const comImposto = custoBase / (1 - taxaImpostoEscritorio);
    const precoFinal = comImposto / (1 - margemDesejada / 100);
    const margemReal = precoFinal - comImposto;
    const lucroReal = margemReal;

    return {
      horas,
      custoBase,
      impostos: comImposto - custoBase,
      precoSugerido: precoFinal,
      precoFinal: servico.precoManual || precoFinal,
      margemReal: servico.precoManual
        ? (servico.precoManual - comImposto) / servico.precoManual
        : margemDesejada / 100,
      lucroReal: servico.precoManual
        ? servico.precoManual - comImposto
        : lucroReal,
    };
  }

  const servicosComPreco = servicos.filter(s => s.ativo).map(s => ({
    ...s,
    calculo: calcPreco(s),
  }));

  const ticketMedio = servicosComPreco.length > 0
    ? servicosComPreco.filter(s => s.tipo === 'recorrente').reduce((sum, s) => sum + s.calculo.precoFinal, 0) / Math.max(1, servicosComPreco.filter(s => s.tipo === 'recorrente').length)
    : 0;

  const receitaTotal = servicosComPreco.filter(s => s.tipo === 'recorrente').reduce((sum, s) => sum + s.calculo.precoFinal, 0);
  const horasTotal = servicosComPreco.filter(s => s.tipo === 'recorrente').reduce((sum, s) => sum + s.calculo.horas, 0);

  const chartData = servicosComPreco.map(s => ({
    nome: s.nome.length > 20 ? s.nome.substring(0, 20) + '...' : s.nome,
    preco: s.calculo.precoFinal,
    custo: s.calculo.custoBase,
    margem: s.calculo.margemReal * 100,
  }));

  function updateServico(id, field, value) {
    setServicos(servicos.map(s => s.id === id ? { ...s, [field]: value } : s));
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Tags className="text-amber-400" size={28} />
          Precificação de Serviços
        </h1>
        <p className="text-dark-400 mt-1">Calcule preços que cobrem custos, impostos e garantem sua margem</p>
      </div>

      {/* Global Parameters */}
      <Card>
        <CardHeader>
          <h2 className="text-white font-semibold">Parâmetros Globais de Precificação</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField
              label="Custo/Hora do Escritório"
              value={custoHora}
              onChange={setCustoHora}
              prefix="R$"
              step={5}
              help="Baseado nos custos operacionais dividido pelas horas produtivas"
            />
            <InputField
              label="Margem de Lucro Desejada"
              value={margemDesejada}
              onChange={setMargemDesejada}
              suffix="%"
              min={5}
              max={80}
              step={5}
              help="Sobre o preço final de venda"
            />
            <SelectField
              label="Regime do Escritório"
              value={regimeEscritorio}
              onChange={setRegimeEscritorio}
              options={[
                { value: 'simples', label: 'Simples Nacional' },
                { value: 'presumido', label: 'Lucro Presumido' },
              ]}
            />
            <InputField
              label="Receita Anual do Escritório"
              value={receitaAnualEscritorio}
              onChange={setReceitaAnualEscritorio}
              prefix="R$"
              step={50000}
              help={`Alíquota efetiva: ${formatPercent(taxaImpostoEscritorio)}`}
            />
          </div>

          <div className="mt-4 p-3 bg-dark-900/50 rounded-lg">
            <p className="text-xs text-dark-400">
              <strong className="text-dark-300">Fórmula:</strong>{' '}
              Preço = (Horas × Custo/Hora) ÷ (1 - Alíquota Imposto) ÷ (1 - Margem Desejada)
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Ticket Médio (recorrente)" value={formatCurrency(ticketMedio)} color="primary" />
        <StatCard icon={Target} label="Receita Recorrente" value={formatCurrency(receitaTotal)} subvalue="/mês por pacote completo" color="blue" />
        <StatCard icon={Clock} label="Horas/Mês (recorrente)" value={`${horasTotal}h`} color="purple" />
        <StatCard icon={TrendingUp} label="Alíquota Impostos" value={formatPercent(taxaImpostoEscritorio)} color="amber" />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <h2 className="text-white font-semibold">Preço vs Custo por Serviço</h2>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="nome"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                angle={-35}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `R$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(v, name) => [formatCurrency(v), name === 'preco' ? 'Preço' : 'Custo']}
              />
              <Bar dataKey="custo" name="Custo" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="preco" name="Preço" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold">Tabela de Preços por Serviço</h2>
            <p className="text-dark-400 text-sm mt-0.5">Ajuste horas e preços conforme necessidade</p>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700/30">
                <th className="text-left px-4 py-3 text-dark-400 font-medium">Serviço</th>
                <th className="text-center px-4 py-3 text-dark-400 font-medium">Tipo</th>
                <th className="text-center px-4 py-3 text-dark-400 font-medium">Horas</th>
                <th className="text-right px-4 py-3 text-dark-400 font-medium">Custo Base</th>
                <th className="text-right px-4 py-3 text-dark-400 font-medium">Impostos</th>
                <th className="text-right px-4 py-3 text-dark-400 font-medium">Preço Sugerido</th>
                <th className="text-right px-4 py-3 text-dark-400 font-medium">Preço Final</th>
                <th className="text-center px-4 py-3 text-dark-400 font-medium">Margem</th>
                <th className="text-center px-4 py-3 text-dark-400 font-medium w-16">Ativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/20">
              {servicos.map((servico, i) => {
                const calc = calcPreco(servico);
                return (
                  <tr
                    key={servico.id}
                    className={`hover:bg-dark-800/30 transition-colors ${!servico.ativo ? 'opacity-40' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-dark-200 font-medium">{servico.nome}</p>
                      <p className="text-dark-500 text-xs">{servico.descricao}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        servico.tipo === 'recorrente' ? 'bg-primary-500/10 text-primary-400' :
                        servico.tipo === 'pontual' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {servico.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={servico.horasCustom}
                        onChange={(e) => updateServico(servico.id, 'horasCustom', parseFloat(e.target.value) || 0)}
                        className="w-16 bg-dark-900/60 border border-dark-600/50 rounded px-2 py-1 text-center text-sm text-dark-100"
                        min={0}
                        step={0.5}
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-dark-300">
                      {formatCurrency(calc.custoBase)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-rose-400/70 text-xs">
                      +{formatCurrency(calc.impostos)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-dark-400">
                      {formatCurrency(calc.precoSugerido)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        value={servico.precoManual || Math.round(calc.precoSugerido)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          updateServico(servico.id, 'precoManual', val > 0 ? val : null);
                        }}
                        className="w-24 bg-dark-900/60 border border-dark-600/50 rounded px-2 py-1 text-right text-sm text-primary-400 font-mono font-bold"
                        min={0}
                        step={50}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold ${
                        calc.margemReal >= 0.3 ? 'text-primary-400' :
                        calc.margemReal >= 0.15 ? 'text-amber-400' :
                        'text-rose-400'
                      }`}>
                        {formatPercent(calc.margemReal)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={servico.ativo}
                        onChange={(e) => updateServico(servico.id, 'ativo', e.target.checked)}
                        className="w-4 h-4 rounded bg-dark-900 border-dark-600 text-primary-500 focus:ring-primary-500/20 cursor-pointer"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pricing Strategy Tips */}
      <Card>
        <CardHeader>
          <h2 className="text-white font-semibold">💡 Dicas de Precificação</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-dark-900/30 rounded-lg border border-dark-700/20">
              <h3 className="text-primary-400 font-medium text-sm mb-2">Custo/Hora Base</h3>
              <p className="text-dark-400 text-xs leading-relaxed">
                Divida todos os custos mensais pelas horas produtivas (geralmente 60-70% das horas trabalhadas). 
                Ex: R$ 30.000 custos ÷ 880h produtivas = R$ 34/hora
              </p>
            </div>
            <div className="p-4 bg-dark-900/30 rounded-lg border border-dark-700/20">
              <h3 className="text-blue-400 font-medium text-sm mb-2">Margem por Complexidade</h3>
              <p className="text-dark-400 text-xs leading-relaxed">
                Serviços complexos como planejamento tributário justificam margens de 50-60%. 
                Serviços recorrentes podem ter margens menores (30-40%) pelo volume.
              </p>
            </div>
            <div className="p-4 bg-dark-900/30 rounded-lg border border-dark-700/20">
              <h3 className="text-amber-400 font-medium text-sm mb-2">Pacotes de Serviço</h3>
              <p className="text-dark-400 text-xs leading-relaxed">
                Agrupe serviços recorrentes (contábil + fiscal + folha) com desconto de 10-15%. 
                Aumenta retenção e previsibilidade de receita.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
