import { useState, useMemo } from 'react';
import { BarChart3, Award } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/Card';
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
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
  LineChart, Line, Legend,
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
          regime: `Simples (${anexo})`,
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
    if (lpResult && !lpResult.erro) {
      resultados.push({
        regime: 'L. Presumido',
        impostoMensal: lpResult.totalMensal,
        impostoAnual: lpResult.totalAnual,
        aliquotaEfetiva: lpResult.aliquotaEfetiva,
        liquidoMensal: receitaMensal - lpResult.totalMensal,
        color: COLORS[2],
      });
    }

    // Lucro Real
    const lrResult = calcLucroReal(receitaMensal, despesas, creditos, issAliquota / 100);
    if (lrResult && !lrResult.erro) {
      resultados.push({
        regime: 'L. Real',
        impostoMensal: lrResult.totalMensal,
        impostoAnual: lrResult.totalAnual,
        aliquotaEfetiva: lrResult.aliquotaEfetiva,
        liquidoMensal: receitaMensal - lrResult.totalMensal,
        color: COLORS[3],
      });
    }

    resultados.sort((a, b) => a.impostoMensal - b.impostoMensal);
    return resultados;
  }, [receitaMensal, tipoAtividade, anexo, issAliquota, despesasPercent, creditosPercent]);

  // Evolucao por receita
  const evolucao = useMemo(() => {
    const steps = [5000, 10000, 20000, 30000, 50000, 80000, 100000, 150000, 200000, 300000, 400000];
    return steps.map((rm) => {
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
      if (lp && !lp.erro) ponto['L. Presumido'] = lp.aliquotaEfetiva * 100;
      const lr = calcLucroReal(rm, rm * 0.4, rm * 0.2, issAliquota / 100);
      if (lr && !lr.erro) ponto['L. Real'] = lr.aliquotaEfetiva * 100;

      return ponto;
    });
  }, [anexo, tipoAtividade, issAliquota]);

  const melhor = comparativo[0];
  const pior = comparativo[comparativo.length - 1];
  const economia = pior && melhor ? pior.impostoMensal - melhor.impostoMensal : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-surface-700 pb-4">
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <BarChart3 className="text-brand-400" size={22} />
          Comparativo de Regimes
        </h1>
        <p className="text-surface-400 text-sm mt-1">Encontre o regime mais vantajoso para o perfil do cliente</p>
      </div>

      {/* Parameters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField label="Receita Bruta Mensal" value={receitaMensal} onChange={setReceitaMensal} prefix="R$" step={5000} />
            <SelectField
              label="Tipo de Atividade"
              value={tipoAtividade}
              onChange={setTipoAtividade}
              options={[
                { value: 'servicos', label: 'Servicos' },
                { value: 'comercio', label: 'Comercio' },
                { value: 'industria', label: 'Industria' },
              ]}
            />
            <SelectField
              label="Anexo do Simples"
              value={anexo}
              onChange={setAnexo}
              options={[
                { value: 'I', label: 'Anexo I - Comercio' },
                { value: 'II', label: 'Anexo II - Industria' },
                { value: 'III', label: 'Anexo III - Servicos' },
                { value: 'IV', label: 'Anexo IV - Servicos' },
                { value: 'V', label: 'Anexo V - TI/Eng' },
              ]}
            />
            <InputField label="ISS (%)" value={issAliquota} onChange={setIssAliquota} suffix="%" min={2} max={5} step={0.5} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <InputField label="Despesas Dedutiveis (% receita) - Lucro Real" value={despesasPercent} onChange={setDespesasPercent} suffix="%" min={0} max={95} step={5} />
            <InputField label="Creditos PIS/COFINS (% receita) - Lucro Real" value={creditosPercent} onChange={setCreditosPercent} suffix="%" min={0} max={80} step={5} />
          </div>
        </CardBody>
      </Card>

      {/* Winner Banner */}
      {melhor && (
        <div className="bg-surface-800 border border-brand-600/20 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-brand-600/20 flex items-center justify-center">
              <Award className="text-brand-400" size={20} />
            </div>
            <div>
              <p className="text-surface-400 text-xs">Regime mais vantajoso</p>
              <p className="text-white text-lg font-semibold">{melhor.regime}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-surface-500 text-xs">Aliquota Efetiva</p>
              <p className="text-brand-400 font-semibold">{formatPercent(melhor.aliquotaEfetiva)}</p>
            </div>
            <div className="text-right">
              <p className="text-surface-500 text-xs">Economia mensal</p>
              <p className="text-emerald-400 font-semibold">{formatCurrency(economia)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader><h2 className="text-white font-medium text-sm">Imposto Mensal por Regime</h2></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={comparativo} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="regime" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '6px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                  formatter={(v) => [formatCurrency(v), 'Imposto Mensal']}
                />
                <Bar dataKey="impostoMensal" radius={[4, 4, 0, 0]}>
                  {comparativo.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Ranking */}
        <Card>
          <CardHeader><h2 className="text-white font-medium text-sm">Ranking Detalhado</h2></CardHeader>
          <CardBody>
            <div className="space-y-2">
              {comparativo.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    i === 0 ? 'border-brand-600/30 bg-brand-600/5' : 'border-surface-700 bg-surface-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold ${
                      i === 0 ? 'bg-brand-600/20 text-brand-400' : 'bg-surface-700 text-surface-400'
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className={`font-medium text-sm ${i === 0 ? 'text-white' : 'text-surface-300'}`}>{item.regime}</p>
                      <p className="text-xs text-surface-500">Aliquota: {formatPercent(item.aliquotaEfetiva)}</p>
                    </div>
                  </div>
                  <p className={`font-semibold font-mono text-sm ${i === 0 ? 'text-brand-400' : 'text-surface-300'}`}>
                    {formatCurrency(item.impostoMensal)}<span className="text-surface-500 text-xs font-normal">/mes</span>
                  </p>
                </div>
              ))}
            </div>
            {economia > 0 && (
              <div className="mt-4 p-3 bg-emerald-600/5 border border-emerald-600/20 rounded-md text-center">
                <p className="text-xs text-surface-400">Economia anual escolhendo {melhor.regime}</p>
                <p className="text-lg font-semibold text-emerald-400">{formatCurrency(economia * 12)}</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Evolution Chart */}
      <Card>
        <CardHeader>
          <h2 className="text-white font-medium text-sm">Aliquota Efetiva por Faturamento</h2>
          <p className="text-surface-500 text-xs mt-0.5">Como a carga tributaria evolui com o crescimento da receita</p>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={evolucao} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="receita" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '6px' }}
                formatter={(v) => [`${v.toFixed(2)}%`, '']}
                labelFormatter={(v) => `Receita: ${formatCurrency(v)}/mes`}
              />
              <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }} />
              <Line type="monotone" dataKey="MEI" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
              <Line type="monotone" dataKey={`Simples ${anexo}`} stroke={COLORS[1]} strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
              <Line type="monotone" dataKey="L. Presumido" stroke={COLORS[2]} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="L. Real" stroke={COLORS[3]} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  );
}
