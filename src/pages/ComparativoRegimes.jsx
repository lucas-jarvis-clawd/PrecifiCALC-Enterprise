import { useState, useMemo } from 'react';
import { BarChart3, Award } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import { calcSimplesTax, calcMEI, calcLucroPresumido, calcLucroReal, formatCurrency, formatPercent } from '../data/taxData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function ComparativoRegimes() {
  const [receitaMensal, setReceitaMensal] = useState(30000);
  const [rbt12, setRbt12] = useState(360000);
  const [tipoAtividade, setTipoAtividade] = useState('servicos');
  const [anexo, setAnexo] = useState('III');
  const [issAliquota, setIssAliquota] = useState(5);
  const [despesasPercent, setDespesasPercent] = useState(40);
  const [creditosPercent, setCreditosPercent] = useState(20);

  const comparativo = useMemo(() => {
    const receitaAnual = rbt12;
    const rm = receitaMensal;
    const despesas = rm * (despesasPercent / 100);
    const creditos = rm * (creditosPercent / 100);
    const resultados = [];

    if (receitaAnual <= 81000) {
      const r = calcMEI(rm, 'servicos');
      if (r && !r.excedeLimite) resultados.push({ regime: 'MEI', impostoMensal: r.dasFixo, impostoAnual: r.dasAnual, aliquotaEfetiva: r.aliquotaEfetiva, liquidoMensal: rm - r.dasFixo, color: COLORS[0] });
    }
    if (receitaAnual <= 4800000) {
      const r = calcSimplesTax(receitaAnual, anexo);
      if (r && !r.excedeLimite) resultados.push({ regime: `Simples (${anexo})`, impostoMensal: r.valorMensal, impostoAnual: r.valorAnual, aliquotaEfetiva: r.aliquotaEfetiva, liquidoMensal: r.receitaMensal - r.valorMensal, color: COLORS[1] });
    }
    const lp = calcLucroPresumido(rm, tipoAtividade, issAliquota / 100);
    if (lp && !lp.erro) resultados.push({ regime: 'L. Presumido', impostoMensal: lp.totalMensal, impostoAnual: lp.totalAnual, aliquotaEfetiva: lp.aliquotaEfetiva, liquidoMensal: rm - lp.totalMensal, color: COLORS[2] });
    const lr = calcLucroReal(rm, despesas, creditos, issAliquota / 100);
    if (lr && !lr.erro) resultados.push({ regime: 'L. Real', impostoMensal: lr.totalMensal, impostoAnual: lr.totalAnual, aliquotaEfetiva: lr.aliquotaEfetiva, liquidoMensal: rm - lr.totalMensal, color: COLORS[3] });

    resultados.sort((a, b) => a.impostoMensal - b.impostoMensal);
    return resultados;
  }, [receitaMensal, rbt12, tipoAtividade, anexo, issAliquota, despesasPercent, creditosPercent]);

  const evolucao = useMemo(() => {
    return [5000, 10000, 20000, 30000, 50000, 80000, 100000, 150000, 200000, 300000, 400000].map((rm) => {
      const ra = rm * 12;
      const ponto = { receita: rm };
      if (ra <= 81000) { const m = calcMEI(rm, 'servicos'); if (m && !m.excedeLimite) ponto['MEI'] = m.aliquotaEfetiva * 100; }
      if (ra <= 4800000) { const s = calcSimplesTax(ra, anexo); if (s && !s.excedeLimite) ponto[`Simples ${anexo}`] = s.aliquotaEfetiva * 100; }
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
  const tt = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,.1)' };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <BarChart3 className="text-brand-600" size={22} />
          Comparativo de Regimes
        </h1>
        <p className="text-slate-500 text-sm mt-1">Encontre o regime mais vantajoso para o perfil do negócio</p>
      </div>

      <Card>
        <CardBody>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField label="Receita Bruta Mensal" value={receitaMensal} onChange={setReceitaMensal} prefix="R$" step={5000} />
            <InputField label="RBT12 (Simples Nacional)" value={rbt12} onChange={setRbt12} prefix="R$" step={10000} help="Receita bruta dos últimos 12 meses" />
            <SelectField label="Tipo de Atividade" value={tipoAtividade} onChange={setTipoAtividade} options={[
              { value: 'servicos', label: 'Serviços' }, { value: 'comercio', label: 'Comércio' }, { value: 'industria', label: 'Indústria' },
            ]} />
            <SelectField label="Anexo do Simples" value={anexo} onChange={setAnexo} options={[
              { value: 'I', label: 'Anexo I - Comércio' }, { value: 'II', label: 'Anexo II - Indústria' },
              { value: 'III', label: 'Anexo III - Serviços' }, { value: 'IV', label: 'Anexo IV - Serviços' }, { value: 'V', label: 'Anexo V - TI/Eng' },
            ]} />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <InputField label="Alíquota ISS (%)" value={issAliquota} onChange={setIssAliquota} suffix="%" min={2} max={5} step={0.5} />
            <InputField label="Despesas Dedutíveis (% receita)" value={despesasPercent} onChange={setDespesasPercent} suffix="%" min={0} max={95} step={5} help="Para Lucro Real" />
            <InputField label="Créditos PIS/COFINS (% receita)" value={creditosPercent} onChange={setCreditosPercent} suffix="%" min={0} max={80} step={5} help="Para Lucro Real" />
          </div>
        </CardBody>
      </Card>

      {melhor && (
        <div className="bg-white border border-brand-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-brand-100 flex items-center justify-center">
              <Award className="text-brand-600" size={20} />
            </div>
            <div>
              <p className="text-slate-500 text-xs">Regime mais vantajoso</p>
              <p className="text-slate-800 text-lg font-semibold">{melhor.regime}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-slate-400 text-xs">Alíquota Efetiva</p>
              <p className="text-brand-600 font-semibold">{formatPercent(melhor.aliquotaEfetiva)}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs">Economia mensal</p>
              <p className="text-emerald-600 font-semibold">{formatCurrency(economia)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="text-slate-800 font-medium text-sm">Imposto Mensal por Regime</h2></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={comparativo} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="regime" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tt} formatter={(v) => [formatCurrency(v), 'Imposto Mensal']} />
                <Bar dataKey="impostoMensal" radius={[4, 4, 0, 0]}>
                  {comparativo.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h2 className="text-slate-800 font-medium text-sm">Ranking Detalhado</h2></CardHeader>
          <CardBody>
            <div className="space-y-2">
              {comparativo.map((item, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-md border ${i === 0 ? 'border-brand-200 bg-brand-50/50' : 'border-slate-200 bg-slate-50/50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold ${i === 0 ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-500'}`}>{i + 1}</span>
                    <div>
                      <p className={`font-medium text-sm ${i === 0 ? 'text-slate-800' : 'text-slate-600'}`}>{item.regime}</p>
                      <p className="text-xs text-slate-400">Alíquota: {formatPercent(item.aliquotaEfetiva)}</p>
                    </div>
                  </div>
                  <p className={`font-semibold font-mono text-sm ${i === 0 ? 'text-brand-600' : 'text-slate-600'}`}>
                    {formatCurrency(item.impostoMensal)}<span className="text-slate-400 text-xs font-normal">/mês</span>
                  </p>
                </div>
              ))}
            </div>
            {economia > 0 && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-center">
                <p className="text-xs text-slate-500">Economia anual escolhendo {melhor.regime}</p>
                <p className="text-lg font-semibold text-emerald-600">{formatCurrency(economia * 12)}</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-slate-800 font-medium text-sm">Alíquota Efetiva por Faturamento</h2>
          <p className="text-slate-400 text-xs mt-0.5">Como a carga tributária evolui com o crescimento da receita</p>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={evolucao} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="receita" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
              <Tooltip contentStyle={tt} formatter={(v) => [`${v.toFixed(2)}%`, '']} labelFormatter={(v) => `Receita: ${formatCurrency(v)}/mês`} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
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
