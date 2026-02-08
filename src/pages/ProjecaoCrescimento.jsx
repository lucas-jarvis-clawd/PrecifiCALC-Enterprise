import { useMemo, useEffect } from 'react';
import { TrendingUp, DollarSign, AlertTriangle, Sparkles, ArrowUp, ArrowDown, Target } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import {
  formatCurrency, formatPercent,
  calcSimplesTax, calcLucroPresumido, calcLucroReal, calcMEI,
} from '../data/taxData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import PageHeader from '../components/PageHeader';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function ProjecaoCrescimento({ perfilEmpresa }) {
  const [state, setState] = useLocalStorage('precificalc_projecao', {
    faturamentoAtual: 30000, crescimentoMensal: 5, regime: 'simples',
    tipoAtividade: 'servicos', custosFixos: 10000, margemCusto: 40,
    cenarioMin: 20000, cenarioMax: 50000, cenarioEsperado: 30000,
    cenarioAtivo: false,
  });
  const update = (field, value) => setState(prev => ({ ...prev, [field]: value }));
  const { faturamentoAtual, crescimentoMensal, regime, tipoAtividade, custosFixos, margemCusto, cenarioMin, cenarioMax, cenarioEsperado, cenarioAtivo } = state;

  // Load from profile (overrides saved state)
  useEffect(() => {
    try {
      const perfil = perfilEmpresa || JSON.parse(localStorage.getItem('precificalc_perfil') || '{}');
      if (perfil.receitaAnual) update('faturamentoAtual', Math.round(perfil.receitaAnual / 12));
      if (perfil.regime) update('regime', perfil.regime);
    } catch {}
  }, [perfilEmpresa]);

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
            msg: `No mês ${m}, seu faturamento anual (${formatCurrency(fatAnual)}) ultrapassa o limite do MEI (R$ 81 mil). Avalie a migração para Simples Nacional.`,
            icon: '',
          });
        }
      }
      if (regime === 'simples' && fatAnual > 4800000 && m > 0) {
        if (!alertas.find(a => a.tipo === 'simples_limite')) {
          alertas.push({
            tipo: 'simples_limite',
            mes: m,
            msg: `No mês ${m}, seu faturamento anual (${formatCurrency(fatAnual)}) ultrapassa o Simples Nacional (R$ 4,8M). Avalie a transição para Lucro Presumido.`,
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

  // ─── Scenario projections (optimistic/pessimistic/expected) ──
  const cenarios = useMemo(() => {
    if (!cenarioAtivo) return null;

    function projectScenario(receitaInicial) {
      const meses = [];
      for (let m = 0; m <= 12; m++) {
        const fat = receitaInicial * Math.pow(1 + crescimentoMensal / 100, m);
        const custoVar = fat * (margemCusto / 100);
        const custoTotal = custosFixos + custoVar;
        const fatAnual = fat * 12;

        let impostos = 0;
        if (regime === 'simples') {
          const anexo = tipoAtividade === 'comercio' ? 'I' : tipoAtividade === 'industria' ? 'II' : 'III';
          const r = calcSimplesTax(fatAnual, anexo);
          if (r && !r.erro && !r.excedeLimite && !r.migracao) impostos = r.valorMensal;
        } else if (regime === 'presumido') {
          const r = calcLucroPresumido(fat, tipoAtividade, 0.05);
          if (r && !r.erro) impostos = r.totalMensal;
        } else if (regime === 'real') {
          const r = calcLucroReal(fat, fat * 0.6, fat * 0.3, 0.05);
          if (r && !r.erro) impostos = r.totalMensal;
        } else if (regime === 'mei') {
          const r = calcMEI(fat, tipoAtividade === 'comercio' ? 'comercio' : 'servicos');
          if (r && !r.excedeLimite) impostos = r.dasFixo;
        }

        const lucro = fat - custoTotal - impostos;
        meses.push({
          mes: m,
          label: m === 0 ? 'Hoje' : `Mes ${m}`,
          faturamento: fat,
          custoTotal,
          impostos,
          lucro,
          margemLucro: fat > 0 ? (lucro / fat) * 100 : 0,
        });
      }
      return meses;
    }

    const pessimista = projectScenario(cenarioMin);
    const esperado = projectScenario(cenarioEsperado);
    const otimista = projectScenario(cenarioMax);

    // Combine into chart data
    const chartData = [];
    for (let m = 0; m <= 12; m++) {
      chartData.push({
        label: m === 0 ? 'Hoje' : `Mes ${m}`,
        pessimista: pessimista[m].lucro,
        esperado: esperado[m].lucro,
        otimista: otimista[m].lucro,
      });
    }

    return {
      chartData,
      summary: {
        pessimista: pessimista[12],
        esperado: esperado[12],
        otimista: otimista[12],
      },
    };
  }, [cenarioAtivo, cenarioMin, cenarioMax, cenarioEsperado, crescimentoMensal, regime, tipoAtividade, custosFixos, margemCusto]);

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
      <PageHeader icon={TrendingUp} title="Projeção de Crescimento" description="Se seu negócio crescer, o que acontece com tributos e lucro?" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <Card>
          <CardHeader><h2 className="text-slate-800 font-medium text-sm">Seus números atuais</h2></CardHeader>
          <CardBody className="space-y-3">
            <InputField
              label="Receita Bruta (Faturamento) mensal atual"
              value={faturamentoAtual}
              onChange={v => update('faturamentoAtual', v)}
              prefix="R$"
              step={5000}
              help="Quanto entra por mês"
            />
            <InputField
              label="Gastos fixos mensais"
              value={custosFixos}
              onChange={v => update('custosFixos', v)}
              prefix="R$"
              step={1000}
              help="Aluguel, salários, contador, etc."
            />
            <InputField
              label="Custos variáveis (% do faturamento)"
              value={margemCusto}
              onChange={v => update('margemCusto', v)}
              suffix="%"
              step={5}
              help="Material, comissões, frete"
            />
            <SelectField
              label="Tipo da empresa"
              value={regime}
              onChange={v => update('regime', v)}
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
              onChange={v => update('tipoAtividade', v)}
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
                    onClick={() => update('crescimentoMensal', s.value)}
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
                onChange={v => update('crescimentoMensal', v)}
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
              label="Receita Bruta (Faturamento) em 12m"
              value={formatCurrency(projecao.em12.faturamento)}
              subvalue={`${crescimentoMensal >= 0 ? '+' : ''}${((projecao.em12.faturamento / projecao.hoje.faturamento - 1) * 100).toFixed(1)}% vs hoje`}
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
                    <p className="text-sm font-bold text-amber-700">Atenção no mês {a.mes}</p>
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
                <span className="text-emerald-800">{formatCurrency(projecao.crescimentoLucro)}/mês</span> em 1 ano.
              </p>
              <p className="text-sm text-emerald-600 mt-1">
                Isso é {formatCurrency(projecao.crescimentoLucro * 12)} a mais por ano.
              </p>
            </div>
          )}
          {projecao.crescimentoLucro < 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-5 text-center">
              <p className="text-lg font-bold text-red-700">
                Cenário de queda: seu lucro cai {formatCurrency(Math.abs(projecao.crescimentoLucro))}/mês em 1 ano.
              </p>
              <p className="text-sm text-red-600 mt-1">Considere revisar a estratégia.</p>
            </div>
          )}

          {/* Chart */}
          <Card>
            <CardHeader>
              <h2 className="text-slate-800 font-medium text-sm">Projeção de 12 meses</h2>
            </CardHeader>
            <CardBody>
              <div role="img" aria-label="Gráfico: projeção de receita, lucro e tributos ao longo de 12 meses">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={projecao.meses} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={tt} formatter={v => [formatCurrency(v), '']} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="faturamento" name="Receita Bruta" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="lucro" name="Lucro" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="impostos" name="Tributos" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 5" dot={{ r: 2 }} />
                    <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <details className="mt-2">
                <summary className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                  Ver dados em tabela
                </summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-1 px-2">Mês</th>
                        <th className="text-right py-1 px-2">Receita</th>
                        <th className="text-right py-1 px-2">Lucro</th>
                        <th className="text-right py-1 px-2">Tributos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projecao.meses.map((m) => (
                        <tr key={m.mes} className="border-b border-slate-100 dark:border-slate-700">
                          <td className="py-1 px-2 text-slate-700 dark:text-slate-300">{m.label}</td>
                          <td className="py-1 px-2 text-right font-mono text-slate-700 dark:text-slate-300">{formatCurrency(m.faturamento)}</td>
                          <td className={`py-1 px-2 text-right font-mono ${m.lucro >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(m.lucro)}</td>
                          <td className="py-1 px-2 text-right font-mono text-red-500 dark:text-red-400">{formatCurrency(m.impostos)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </CardBody>
          </Card>

          {/* Monthly table */}
          <Card>
            <CardHeader><h2 className="text-slate-800 font-medium text-sm">Mes a mes</h2></CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Mes</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Receita Bruta</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Tributos</th>
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

          {/* Scenario Simulator */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-slate-800 dark:text-slate-200 font-medium text-sm flex items-center gap-2">
                  <Sparkles size={16} className="text-violet-500" />
                  Cenario otimista/pessimista
                </h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cenarioAtivo}
                    onChange={(e) => update('cenarioAtivo', e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500/20"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Ativar</span>
                </label>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField
                  label="Receita minima (pessimista)"
                  value={cenarioMin}
                  onChange={v => update('cenarioMin', v)}
                  prefix="R$"
                  step={5000}
                  help="Pior cenario mensal"
                />
                <InputField
                  label="Receita esperada"
                  value={cenarioEsperado}
                  onChange={v => update('cenarioEsperado', v)}
                  prefix="R$"
                  step={5000}
                  help="Cenario mais provavel"
                />
                <InputField
                  label="Receita maxima (otimista)"
                  value={cenarioMax}
                  onChange={v => update('cenarioMax', v)}
                  prefix="R$"
                  step={5000}
                  help="Melhor cenario mensal"
                />
              </div>

              {cenarioAtivo && cenarios && (
                <>
                  <div role="img" aria-label="Gráfico: comparação de cenários pessimista, esperado e otimista ao longo de 12 meses">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={cenarios.chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={tt} formatter={v => [formatCurrency(v), '']} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="pessimista" name="Pessimista" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="esperado" name="Esperado" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="otimista" name="Otimista" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <details className="mt-2 mb-4">
                    <summary className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                      Ver dados em tabela
                    </summary>
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="text-left py-1 px-2">Mês</th>
                            <th className="text-right py-1 px-2">Pessimista</th>
                            <th className="text-right py-1 px-2">Esperado</th>
                            <th className="text-right py-1 px-2">Otimista</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cenarios.chartData.map((d) => (
                            <tr key={d.label} className="border-b border-slate-100 dark:border-slate-700">
                              <td className="py-1 px-2 text-slate-700 dark:text-slate-300">{d.label}</td>
                              <td className="py-1 px-2 text-right font-mono text-red-500 dark:text-red-400">{formatCurrency(d.pessimista)}</td>
                              <td className="py-1 px-2 text-right font-mono text-blue-600 dark:text-blue-400">{formatCurrency(d.esperado)}</td>
                              <td className="py-1 px-2 text-right font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(d.otimista)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>

                  {/* Summary table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">Cenario</th>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Receita Bruta (Mes 12)</th>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Custos</th>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Tributos</th>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Lucro</th>
                          <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">Margem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {[
                          { label: 'Pessimista', data: cenarios.summary.pessimista, color: 'text-red-600' },
                          { label: 'Esperado', data: cenarios.summary.esperado, color: 'text-blue-600' },
                          { label: 'Otimista', data: cenarios.summary.otimista, color: 'text-emerald-600' },
                        ].map(row => (
                          <tr key={row.label} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <td className={`py-2 px-3 font-semibold ${row.color}`}>{row.label}</td>
                            <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-300">{formatCurrency(row.data.faturamento)}</td>
                            <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-300">{formatCurrency(row.data.custoTotal)}</td>
                            <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-300">{formatCurrency(row.data.impostos)}</td>
                            <td className={`py-2 px-3 text-right font-semibold ${row.data.lucro >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {formatCurrency(row.data.lucro)}
                            </td>
                            <td className={`py-2 px-3 text-right ${row.data.margemLucro >= 20 ? 'text-emerald-600' : row.data.margemLucro >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                              {row.data.margemLucro.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {!cenarioAtivo && (
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">
                  Ative o simulador para comparar cenarios otimista, pessimista e esperado.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
