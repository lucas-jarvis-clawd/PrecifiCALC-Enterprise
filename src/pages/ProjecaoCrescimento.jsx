import { useState, useMemo, useEffect } from 'react';
import { TrendingUp, DollarSign, AlertTriangle, Sparkles, ArrowUp, ArrowDown, Target } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import {
  formatCurrency, formatPercent,
  calcSimplesTax, calcLucroPresumido, calcLucroReal, calcMEI,
} from '../data/taxData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

const LS_KEY = 'precificalc_projecao';

export default function ProjecaoCrescimento({ perfilEmpresa }) {
  const [faturamentoAtual, setFaturamentoAtual] = useState(30000);
  const [crescimentoMensal, setCrescimentoMensal] = useState(5);
  const [regime, setRegime] = useState('simples');
  const [tipoAtividade, setTipoAtividade] = useState('servicos');
  const [custosFixos, setCustosFixos] = useState(10000);
  const [margemCusto, setMargemCusto] = useState(40); // % da receita em custos variáveis

  // Load from profile
  useEffect(() => {
    try {
      const perfil = perfilEmpresa || JSON.parse(localStorage.getItem('precificalc_perfil') || '{}');
      if (perfil.receitaAnual) setFaturamentoAtual(Math.round(perfil.receitaAnual / 12));
      if (perfil.regime) setRegime(perfil.regime);
    } catch {}
  }, [perfilEmpresa]);

  // Load saved state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.faturamentoAtual) setFaturamentoAtual(d.faturamentoAtual);
        if (d.crescimentoMensal !== undefined) setCrescimentoMensal(d.crescimentoMensal);
        if (d.regime) setRegime(d.regime);
        if (d.tipoAtividade) setTipoAtividade(d.tipoAtividade);
        if (d.custosFixos) setCustosFixos(d.custosFixos);
        if (d.margemCusto !== undefined) setMargemCusto(d.margemCusto);
      }
    } catch {}
  }, []);

  // Save state
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        faturamentoAtual, crescimentoMensal, regime, tipoAtividade, custosFixos, margemCusto,
      }));
    } catch {}
  }, [faturamentoAtual, crescimentoMensal, regime, tipoAtividade, custosFixos, margemCusto]);

  const projecao = useMemo(() => {
    const meses = [];
    const crescimento = crescimentoMensal / 100;
    let alertas = [];

    for (let m = 0; m <= 12; m++) {
      const fat = faturamentoAtual * Math.pow(1 + crescimento, m);
      const fatAnual = fat * 12;
      const custoVar = fat * (margemCusto / 100);
      const custoTotal = custosFixos + custoVar;

      // Calculate taxes based on regime
      let impostos = 0;
      let regimeLabel = '';

      if (regime === 'mei') {
        const r = calcMEI(fat, tipoAtividade === 'comercio' ? 'comercio' : 'servicos');
        if (r && !r.excedeLimite) {
          impostos = r.dasFixo;
          regimeLabel = 'MEI';
        } else {
          // Auto-upgrade to Simples
          const s = calcSimplesTax(fatAnual, tipoAtividade === 'comercio' ? 'I' : 'III');
          if (s && !s.excedeLimite && !s.migracao) {
            impostos = s.valorMensal;
            regimeLabel = 'Simples (auto)';
          }
        }
      } else if (regime === 'simples') {
        const anexo = tipoAtividade === 'comercio' ? 'I' : tipoAtividade === 'industria' ? 'II' : 'III';
        const r = calcSimplesTax(fatAnual, anexo);
        if (r && !r.excedeLimite && !r.migracao) {
          impostos = r.valorMensal;
          regimeLabel = 'Simples';
        } else {
          const lp = calcLucroPresumido(fat, tipoAtividade, 0.05);
          if (lp && !lp.erro) {
            impostos = lp.totalMensal;
            regimeLabel = 'Presumido (auto)';
          }
        }
      } else if (regime === 'presumido') {
        const r = calcLucroPresumido(fat, tipoAtividade, 0.05);
        if (r && !r.erro) {
          impostos = r.totalMensal;
          regimeLabel = 'Presumido';
        }
      } else {
        const r = calcLucroReal(fat, fat * 0.6, fat * 0.3, 0.05);
        if (r && !r.erro) {
          impostos = r.totalMensal;
          regimeLabel = 'L. Real';
        }
      }

      const lucro = fat - custoTotal - impostos;
      const margemLucro = fat > 0 ? (lucro / fat) * 100 : 0;

      meses.push({
        mes: m,
        label: m === 0 ? 'Hoje' : `Mês ${m}`,
        faturamento: fat,
        custoTotal,
        impostos,
        lucro,
        margemLucro,
        regimeLabel,
        fatAnual,
      });

      // Check for limit alerts
      if (regime === 'mei' && fatAnual > 81000 && m > 0) {
        if (!alertas.find(a => a.tipo === 'mei_limite')) {
          alertas.push({
            tipo: 'mei_limite',
            mes: m,
            msg: `No mês ${m}, seu faturamento anual (${formatCurrency(fatAnual)}) ultrapassa o limite do MEI (R$ 81 mil). Hora de virar Simples Nacional!`,
            icon: '',
          });
        }
      }
      if (regime === 'simples' && fatAnual > 4800000 && m > 0) {
        if (!alertas.find(a => a.tipo === 'simples_limite')) {
          alertas.push({
            tipo: 'simples_limite',
            mes: m,
            msg: `No mês ${m}, seu faturamento anual (${formatCurrency(fatAnual)}) ultrapassa o Simples Nacional (R$ 4,8M). Prepare-se para Lucro Presumido!`,
            icon: '',
          });
        }
      }
    }

    const hoje = meses[0];
    const em12 = meses[12];
    const crescimentoFat = em12.faturamento - hoje.faturamento;
    const crescimentoLucro = em12.lucro - hoje.lucro;

    return { meses, alertas, hoje, em12, crescimentoFat, crescimentoLucro };
  }, [faturamentoAtual, crescimentoMensal, regime, tipoAtividade, custosFixos, margemCusto]);

  const tt = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,.1)' };

  const quickScenarios = [
    { label: 'Estável', value: 0 },
    { label: 'Leve (+5%/mês)', value: 5 },
    { label: 'Acelerado (+10%/mês)', value: 10 },
    { label: 'Explosivo (+20%/mês)', value: 20 },
    { label: 'Queda (-5%/mês)', value: -5 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <TrendingUp className="text-brand-600" size={22} />
          Projeção de Crescimento
        </h1>
        <p className="text-slate-500 text-sm mt-1">Se seu negócio crescer, o que acontece com impostos e lucro?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <Card>
          <CardHeader><h2 className="text-slate-800 font-medium text-sm">Seus números atuais</h2></CardHeader>
          <CardBody className="space-y-3">
            <InputField
              label="Faturamento mensal atual"
              value={faturamentoAtual}
              onChange={setFaturamentoAtual}
              prefix="R$"
              step={5000}
              help="Quanto entra por mês"
            />
            <InputField
              label="Gastos fixos mensais"
              value={custosFixos}
              onChange={setCustosFixos}
              prefix="R$"
              step={1000}
              help="Aluguel, salários, contador, etc."
            />
            <InputField
              label="Custos variáveis (% do faturamento)"
              value={margemCusto}
              onChange={setMargemCusto}
              suffix="%"
              step={5}
              help="Material, comissões, frete"
            />
            <SelectField
              label="Tipo da empresa"
              value={regime}
              onChange={setRegime}
              options={[
                { value: 'mei', label: 'MEI' },
                { value: 'simples', label: 'Simples Nacional' },
                { value: 'presumido', label: 'Lucro Presumido' },
                { value: 'real', label: 'Lucro Real' },
              ]}
            />
            <SelectField
              label="Atividade"
              value={tipoAtividade}
              onChange={setTipoAtividade}
              options={[
                { value: 'servicos', label: 'Serviços' },
                { value: 'comercio', label: 'Comércio' },
                { value: 'industria', label: 'Indústria' },
              ]}
            />

            <div className="border-t border-slate-200 pt-3">
              <label className="block text-xs font-medium text-slate-600 mb-2">Cenário de crescimento:</label>
              <div className="space-y-1.5">
                {quickScenarios.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setCrescimentoMensal(s.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      crescimentoMensal === s.value
                        ? 'bg-brand-100 border-2 border-brand-400 text-brand-700 font-medium'
                        : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <InputField
                label="Ou defina seu crescimento (%/mês)"
                value={crescimentoMensal}
                onChange={setCrescimentoMensal}
                suffix="%"
                step={1}
                className="mt-3"
              />
            </div>
          </CardBody>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Key stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={DollarSign}
              label="Faturamento em 12m"
              value={formatCurrency(projecao.em12.faturamento)}
              subvalue={`${crescimentoMensal >= 0 ? '+' : ''}${((projecao.em12.faturamento / projecao.hoje.faturamento - 1) * 100).toFixed(0)}% vs hoje`}
              color={crescimentoMensal >= 0 ? 'green' : 'red'}
            />
            <StatCard
              icon={TrendingUp}
              label="Lucro em 12m"
              value={formatCurrency(projecao.em12.lucro)}
              subvalue={`Margem: ${projecao.em12.margemLucro.toFixed(1)}%`}
              color={projecao.em12.lucro > 0 ? 'green' : 'red'}
            />
            <StatCard
              icon={Target}
              label="Lucro hoje"
              value={formatCurrency(projecao.hoje.lucro)}
              subvalue={`Margem: ${projecao.hoje.margemLucro.toFixed(1)}%`}
              color={projecao.hoje.lucro > 0 ? 'blue' : 'red'}
            />
            <StatCard
              icon={projecao.crescimentoLucro >= 0 ? ArrowUp : ArrowDown}
              label="Lucro extra em 12m"
              value={formatCurrency(projecao.crescimentoLucro)}
              subvalue="Diferença vs hoje"
              color={projecao.crescimentoLucro >= 0 ? 'green' : 'red'}
            />
          </div>

          {/* Alerts */}
          {projecao.alertas.length > 0 && (
            <div className="space-y-2">
              {projecao.alertas.map((a, i) => (
                <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{a.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-amber-700">Atenção no mês {a.mes}!</p>
                    <p className="text-sm text-amber-600 mt-0.5">{a.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Emotional summary */}
          {projecao.crescimentoLucro > 0 && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-5 text-center">
              <p className="text-lg font-bold text-emerald-700">
                Com {crescimentoMensal}% de crescimento ao mês, seu lucro sobe&nbsp;
                <span className="text-emerald-800">{formatCurrency(projecao.crescimentoLucro)}/mês</span> em 1 ano!
              </p>
              <p className="text-sm text-emerald-600 mt-1">
                Isso é {formatCurrency(projecao.crescimentoLucro * 12)} a mais por ano!
              </p>
            </div>
          )}
          {projecao.crescimentoLucro < 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-5 text-center">
              <p className="text-lg font-bold text-red-700">
                Cenário de queda: seu lucro cai {formatCurrency(Math.abs(projecao.crescimentoLucro))}/mês em 1 ano.
              </p>
              <p className="text-sm text-red-600 mt-1">Hora de repensar a estratégia!</p>
            </div>
          )}

          {/* Chart */}
          <Card>
            <CardHeader>
              <h2 className="text-slate-800 font-medium text-sm">Projeção de 12 meses</h2>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={projecao.meses} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tt} formatter={v => [formatCurrency(v), '']} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="faturamento" name="Faturamento" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="lucro" name="Lucro" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="impostos" name="Impostos" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 5" dot={{ r: 2 }} />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Monthly table */}
          <Card>
            <CardHeader><h2 className="text-slate-800 font-medium text-sm">Mês a mês</h2></CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Mês</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Faturamento</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Impostos</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Custos</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Lucro</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Margem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projecao.meses.filter((_, i) => i % 2 === 0 || i === 12).map((m, i) => (
                      <tr key={i} className={`${m.mes === 0 ? 'bg-brand-50/50 font-medium' : ''} hover:bg-slate-50`}>
                        <td className="py-2 px-3 text-slate-700">{m.label}</td>
                        <td className="py-2 px-3 text-right text-slate-600">{formatCurrency(m.faturamento)}</td>
                        <td className="py-2 px-3 text-right text-red-500">{formatCurrency(m.impostos)}</td>
                        <td className="py-2 px-3 text-right text-slate-600">{formatCurrency(m.custoTotal)}</td>
                        <td className={`py-2 px-3 text-right font-semibold ${m.lucro >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatCurrency(m.lucro)}
                        </td>
                        <td className={`py-2 px-3 text-right ${m.margemLucro >= 20 ? 'text-emerald-600' : m.margemLucro >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                          {m.margemLucro.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
