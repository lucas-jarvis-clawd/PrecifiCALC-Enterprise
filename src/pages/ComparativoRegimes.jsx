import { useState, useMemo } from 'react';
import { BarChart3, TrendingDown, Award, ArrowRight } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import {
  calcSimplesTax,
  calcMEI,
  calcLucroPresumido,
  calcLucroReal,
  formatCurrency,
  formatPercent,
} from '../data/taxData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function ComparativoRegimes() {
  const [receitaMensal, setReceitaMensal] = useState(30000);
  const [tipoAtividade, setTipoAtividade] = useState('servicos');
  const [anexo, setAnexo] = useState('III');
  const [issAliquota, setIssAliquota] = useState(5);
  const [despesasPercent, setDespesasPercent] = useState(40);
  const [creditosPercent, setCreditosPercent] = useState(20);

  const comparativo = useMemo(() => {
    const receitaAnual = receitaMensal * 12;
    const despesas = receitaMensal * (despesasPercent / 100);
    const creditos = receitaMensal * (creditosPercent / 100);

    const resultados = [];

    // MEI
    if (receitaAnual <= 81000) {
      const meiResult = calcMEI(receitaMensal, 'servicos');
      if (meiResult && !meiResult.excedeLimite) {
        resultados.push({
          regime: 'MEI',
          impostoMensal: meiResult.dasFixo,
          impostoAnual: meiResult.dasAnual,
          aliquotaEfetiva: meiResult.aliquotaEfetiva,
          liquidoMensal: receitaMensal - meiResult.dasFixo,
          color: COLORS[0],
        });
      }
    }

    // Simples Nacional
    if (receitaAnual <= 4800000) {
      const simplesResult = calcSimplesTax(receitaAnual, anexo);
      if (simplesResult && !simplesResult.excedeLimite) {
        resultados.push({
          regime: `Simples (Anexo ${anexo})`,
          impostoMensal: simplesResult.valorMensal,
          impostoAnual: simplesResult.valorAnual,
          aliquotaEfetiva: simplesResult.aliquotaEfetiva,
          liquidoMensal: simplesResult.receitaMensal - simplesResult.valorMensal,
          color: COLORS[1],
        });
      }
    }

    // Lucro Presumido
    const lpResult = calcLucroPresumido(receitaMensal, tipoAtividade, issAliquota / 100);
    resultados.push({
      regime: 'L. Presumido',
      impostoMensal: lpResult.totalMensal,
      impostoAnual: lpResult.totalAnual,
      aliquotaEfetiva: lpResult.aliquotaEfetiva,
      liquidoMensal: receitaMensal - lpResult.totalMensal,
      color: COLORS[2],
    });

    // Lucro Real
    const lrResult = calcLucroReal(receitaMensal, despesas, creditos, issAliquota / 100);
    resultados.push({
      regime: 'L. Real',
      impostoMensal: lrResult.totalMensal,
      impostoAnual: lrResult.totalAnual,
      aliquotaEfetiva: lrResult.aliquotaEfetiva,
      liquidoMensal: receitaMensal - lrResult.totalMensal,
      color: COLORS[3],
    });

    // Ordenar por menor imposto
    resultados.sort((a, b) => a.impostoMensal - b.impostoMensal);

    return resultados;
  }, [receitaMensal, tipoAtividade, anexo, issAliquota, despesasPercent, creditosPercent]);

  // Evolução por receita
  const evolucao = useMemo(() => {
    const pontos = [];
    const steps = [5000, 10000, 20000, 30000, 50000, 80000, 100000, 150000, 200000, 300000, 400000];

    for (const rm of steps) {
      const ra = rm * 12;
      const ponto = { receita: rm };

      if (ra <= 81000) {
        const m = calcMEI(rm, 'servicos');
        if (m && !m.excedeLimite) ponto['MEI'] = m.aliquotaEfetiva * 100;
      }

      if (ra <= 4800000) {
        const s = calcSimplesTax(ra, anexo);
        if (s && !s.excedeLimite) ponto[`Simples ${anexo}`] = s.aliquotaEfetiva * 100;
      }

      const lp = calcLucroPresumido(rm, tipoAtividade, issAliquota / 100);
      ponto['L. Presumido'] = lp.aliquotaEfetiva * 100;

      const lr = calcLucroReal(rm, rm * 0.4, rm * 0.2, issAliquota / 100);
      ponto['L. Real'] = lr.aliquotaEfetiva * 100;

      pontos.push(ponto);
    }
    return pontos;
  }, [anexo, tipoAtividade, issAliquota]);

  const melhor = comparativo[0];
  const pior = comparativo[comparativo.length - 1];
  const economia = pior ? pior.impostoMensal - melhor.impostoMensal : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="text-blue-400" size={28} />
          Comparativo de Regimes
        </h1>
        <p className="text-dark-400 mt-1">Encontre o regime mais vantajoso para o perfil do seu cliente</p>
      </div>

      {/* Parameters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField
              label="Receita Bruta Mensal"
              value={receitaMensal}
              onChange={setReceitaMensal}
              prefix="R$"
              step={5000}
            />
            <SelectField
              label="Tipo de Atividade"
              value={tipoAtividade}
              onChange={setTipoAtividade}
              options={[
                { value: 'servicos', label: 'Serviços' },
                { value: 'comercio', label: 'Comércio' },
                { value: 'industria', label: 'Indústria' },
              ]}
            />
            <SelectField
              label="Anexo do Simples"
              value={anexo}
              onChange={setAnexo}
              options={[
                { value: 'I', label: 'Anexo I - Comércio' },
                { value: 'II', label: 'Anexo II - Indústria' },
                { value: 'III', label: 'Anexo III - Serviços' },
                { value: 'IV', label: 'Anexo IV - Serviços' },
                { value: 'V', label: 'Anexo V - TI/Eng' },
              ]}
            />
            <InputField
              label="ISS (%)"
              value={issAliquota}
              onChange={setIssAliquota}
              suffix="%"
              min={2}
              max={5}
              step={0.5}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <InputField
              label="Despesas Dedutíveis (% receita) - p/ Lucro Real"
              value={despesasPercent}
              onChange={setDespesasPercent}
              suffix="%"
              min={0}
              max={95}
              step={5}
            />
            <InputField
              label="Créditos PIS/COFINS (% receita) - p/ Lucro Real"
              value={creditosPercent}
              onChange={setCreditosPercent}
              suffix="%"
              min={0}
              max={80}
              step={5}
            />
          </div>
        </CardBody>
      </Card>

      {/* Winner Banner */}
      {melhor && (
        <div className="bg-gradient-to-r from-primary-500/10 to-blue-500/10 border border-primary-500/20 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center">
              <Award className="text-primary-400" size={24} />
            </div>
            <div>
              <p className="text-dark-400 text-sm">Regime mais vantajoso</p>
              <p className="text-white text-xl font-bold">{melhor.regime}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-dark-400 text-xs">Alíquota Efetiva</p>
              <p className="text-primary-400 font-bold text-lg">{formatPercent(melhor.aliquotaEfetiva)}</p>
            </div>
            <div className="text-right">
              <p className="text-dark-400 text-xs">Economia mensal vs pior</p>
              <p className="text-primary-400 font-bold text-lg">{formatCurrency(economia)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <h2 className="text-white font-semibold">Imposto Mensal por Regime</h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparativo} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="regime" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                  formatter={(v) => [formatCurrency(v), 'Imposto Mensal']}
                />
                <Bar dataKey="impostoMensal" radius={[6, 6, 0, 0]}>
                  {comparativo.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Comparison Table */}
        <Card>
          <CardHeader>
            <h2 className="text-white font-semibold">Ranking Detalhado</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {comparativo.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    i === 0
                      ? 'border-primary-500/30 bg-primary-500/5'
                      : 'border-dark-700/30 bg-dark-900/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        i === 0 ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-700/50 text-dark-400'
                      }`}
                    >
                      {i + 1}º
                    </span>
                    <div>
                      <p className={`font-medium ${i === 0 ? 'text-white' : 'text-dark-300'}`}>{item.regime}</p>
                      <p className="text-xs text-dark-500">Alíquota: {formatPercent(item.aliquotaEfetiva)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${i === 0 ? 'text-primary-400' : 'text-dark-300'}`}>
                      {formatCurrency(item.impostoMensal)}
                    </p>
                    <p className="text-xs text-dark-500">/mês</p>
                  </div>
                </div>
              ))}
            </div>

            {economia > 0 && (
              <div className="mt-4 p-3 bg-primary-500/5 border border-primary-500/20 rounded-lg text-center">
                <p className="text-sm text-dark-400">Economia anual escolhendo {melhor.regime}</p>
                <p className="text-xl font-bold text-primary-400">{formatCurrency(economia * 12)}</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Evolution Chart */}
      <Card>
        <CardHeader>
          <h2 className="text-white font-semibold">Evolução da Alíquota Efetiva por Receita</h2>
          <p className="text-dark-400 text-sm mt-1">Como a carga tributária varia conforme o faturamento cresce</p>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={evolucao} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="receita"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(v) => `${v.toFixed(0)}%`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(v) => [`${v.toFixed(2)}%`, '']}
                labelFormatter={(v) => `Receita: ${formatCurrency(v)}/mês`}
              />
              <Legend wrapperStyle={{ color: '#94a3b8' }} />
              <Line type="monotone" dataKey="MEI" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
              <Line type="monotone" dataKey={`Simples ${anexo}`} stroke={COLORS[1]} strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
              <Line type="monotone" dataKey="L. Presumido" stroke={COLORS[2]} strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="L. Real" stroke={COLORS[3]} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  );
}
