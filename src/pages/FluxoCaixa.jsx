import { useState, useMemo, useEffect, useCallback } from 'react';
import { Banknote, AlertTriangle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import PageHeader from '../components/PageHeader';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { formatCurrency } from '../data/taxData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const STORAGE_KEY = 'precificalc_fluxocaixa';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

export default function FluxoCaixa() {
  const saved = loadState();

  const [receitaMensal, setReceitaMensal] = useState(saved?.receitaMensal ?? 50000);
  const [prazoRecebimento, setPrazoRecebimento] = useState(saved?.prazoRecebimento || 'avista');
  const [custosFixos, setCustosFixos] = useState(saved?.custosFixos ?? 15000);
  const [custosVariaveisPercent, setCustosVariaveisPercent] = useState(saved?.custosVariaveisPercent ?? 20);
  const [tributosPercent, setTributosPercent] = useState(saved?.tributosPercent ?? 10);
  const [saldoInicial, setSaldoInicial] = useState(saved?.saldoInicial ?? 0);
  const [crescimentoMensal, setCrescimentoMensal] = useState(saved?.crescimentoMensal ?? 0);

  const persistState = useCallback(() => {
    const state = {
      receitaMensal, prazoRecebimento, custosFixos, custosVariaveisPercent,
      tributosPercent, saldoInicial, crescimentoMensal,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [receitaMensal, prazoRecebimento, custosFixos, custosVariaveisPercent,
    tributosPercent, saldoInicial, crescimentoMensal]);

  useEffect(() => { persistState(); }, [persistState]);

  // Compute delay in months based on prazo
  const delayMeses = useMemo(() => {
    switch (prazoRecebimento) {
      case '30': return 1;
      case '60': return 2;
      case '90': return 3;
      default: return 0;
    }
  }, [prazoRecebimento]);

  const projecao = useMemo(() => {
    const meses = [];
    let saldoAcumulado = saldoInicial;

    // Pre-compute receitas for delay purposes (consider months before month 0 as receita base)
    const receitasPorMes = [];
    for (let i = 0; i < 12; i++) {
      const fatorCrescimento = 1 + (crescimentoMensal / 100 * i);
      receitasPorMes.push(receitaMensal * fatorCrescimento);
    }

    for (let i = 0; i < 12; i++) {
      const receitaGerada = receitasPorMes[i];

      // Receita efetivamente recebida this month (delayed)
      let receitaRecebida;
      if (delayMeses === 0) {
        receitaRecebida = receitaGerada;
      } else {
        const mesOrigem = i - delayMeses;
        if (mesOrigem < 0) {
          // Before our projection: assume same base revenue was being generated
          receitaRecebida = receitaMensal;
        } else {
          receitaRecebida = receitasPorMes[mesOrigem];
        }
      }

      const custosVar = receitaGerada * (custosVariaveisPercent / 100);
      const tributos = receitaGerada * (tributosPercent / 100);
      const totalSaidas = custosFixos + custosVar + tributos;
      const saldoMes = receitaRecebida - totalSaidas;
      saldoAcumulado += saldoMes;

      meses.push({
        mes: MESES[i],
        indice: i,
        receitaGerada,
        receitaRecebida,
        custosFixos,
        custosVariaveis: custosVar,
        tributos,
        totalSaidas,
        saldoMes,
        saldoAcumulado,
        negativo: saldoAcumulado < 0,
      });
    }

    return meses;
  }, [receitaMensal, prazoRecebimento, custosFixos, custosVariaveisPercent,
    tributosPercent, saldoInicial, crescimentoMensal, delayMeses]);

  const mesesNegativos = projecao.filter(m => m.negativo).length;
  const saldoFinal = projecao[projecao.length - 1]?.saldoAcumulado ?? 0;
  const totalEntradas = projecao.reduce((s, m) => s + m.receitaRecebida, 0);
  const totalSaidas = projecao.reduce((s, m) => s + m.totalSaidas, 0);

  const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,.1)',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        icon={Banknote}
        title="Fluxo de Caixa Projetado"
        description="Projeção de 12 meses do caixa da empresa"
      />
      <DisclaimerBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters */}
        <Card className="lg:col-span-1">
          <CardHeader><h2 className="text-slate-800 dark:text-slate-200 font-medium text-sm">Parâmetros</h2></CardHeader>
          <CardBody className="space-y-4">
            <InputField
              label="Receita mensal estimada"
              value={receitaMensal}
              onChange={setReceitaMensal}
              prefix="R$"
              step={5000}
              min={0}
            />

            <SelectField
              label="Prazo de recebimento"
              value={prazoRecebimento}
              onChange={setPrazoRecebimento}
              options={[
                { value: 'avista', label: 'À vista' },
                { value: '30', label: '30 dias' },
                { value: '60', label: '60 dias' },
                { value: '90', label: '90 dias' },
              ]}
              help={delayMeses > 0 ? `Receita entra ${delayMeses} mês(es) depois de gerada` : 'Receita entra no mesmo mês'}
            />

            <InputField
              label="Custos fixos mensais"
              value={custosFixos}
              onChange={setCustosFixos}
              prefix="R$"
              step={1000}
              min={0}
              help="Aluguel, folha, contador, etc."
            />

            <InputField
              label="Custos variáveis (% da receita)"
              value={custosVariaveisPercent}
              onChange={setCustosVariaveisPercent}
              suffix="%"
              step={1}
              min={0}
              max={100}
              help="Comissões, matéria-prima, frete"
            />

            <InputField
              label="Tributos (% da receita)"
              value={tributosPercent}
              onChange={setTributosPercent}
              suffix="%"
              step={0.5}
              min={0}
              max={50}
              help="Carga tributária efetiva"
            />

            <InputField
              label="Saldo inicial em caixa"
              value={saldoInicial}
              onChange={setSaldoInicial}
              prefix="R$"
              step={5000}
              help="Capital disponível no início"
            />

            <InputField
              label="Crescimento mensal da receita"
              value={crescimentoMensal}
              onChange={setCrescimentoMensal}
              suffix="%"
              step={0.5}
              min={-10}
              max={20}
              help="Estimativa de crescimento mês a mês"
            />
          </CardBody>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              icon={TrendingUp}
              label="Total entradas"
              value={formatCurrency(totalEntradas)}
              color="green"
            />
            <StatCard
              icon={TrendingDown}
              label="Total saídas"
              value={formatCurrency(totalSaidas)}
              color="red"
            />
            <StatCard
              icon={DollarSign}
              label="Saldo final"
              value={formatCurrency(saldoFinal)}
              color={saldoFinal >= 0 ? 'blue' : 'red'}
            />
            <StatCard
              icon={AlertTriangle}
              label="Meses negativos"
              value={`${mesesNegativos} mês(es)`}
              color={mesesNegativos > 0 ? 'amber' : 'green'}
            />
          </div>

          {/* Chart */}
          <Card>
            <CardHeader><h2 className="text-slate-800 dark:text-slate-200 font-medium text-sm">Saldo Acumulado (12 meses)</h2></CardHeader>
            <CardBody>
              <div role="img" aria-label="Gráfico: saldo acumulado do caixa ao longo de 12 meses">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={projecao} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickFormatter={(v) => {
                        if (Math.abs(v) >= 1000000) return `R$${(v / 1000000).toFixed(1)}M`;
                        if (Math.abs(v) >= 1000) return `R$${(v / 1000).toFixed(0)}k`;
                        return `R$${v.toFixed(0)}`;
                      }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v) => [formatCurrency(v), 'Saldo']}
                    />
                    <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="saldoAcumulado"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={{ fill: '#4f46e5', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
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
                        <th className="text-right py-1 px-2">Saldo Acumulado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projecao.map((m) => (
                        <tr key={m.mes} className={`border-b border-slate-100 dark:border-slate-700 ${m.negativo ? 'bg-red-50 dark:bg-red-950/20' : ''}`}>
                          <td className="py-1 px-2 text-slate-700 dark:text-slate-300">{m.mes}</td>
                          <td className={`py-1 px-2 text-right font-mono ${m.negativo ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>{formatCurrency(m.saldoAcumulado)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </CardBody>
          </Card>

          {/* Monthly grid */}
          <Card>
            <CardHeader><h2 className="text-slate-800 dark:text-slate-200 font-medium text-sm">Detalhamento Mensal</h2></CardHeader>
            <CardBody className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">Mês</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">Entrada</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">Saídas</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">Saldo Mês</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {projecao.map((m) => (
                    <tr
                      key={m.mes}
                      className={m.negativo ? 'bg-red-50 dark:bg-red-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                    >
                      <td className="py-2 px-2 text-slate-700 dark:text-slate-300 font-medium">{m.mes}</td>
                      <td className="py-2 px-2 text-right text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(m.receitaRecebida)}</td>
                      <td className="py-2 px-2 text-right text-red-500 dark:text-red-400 font-mono">{formatCurrency(m.totalSaidas)}</td>
                      <td className={`py-2 px-2 text-right font-mono font-medium ${m.saldoMes >= 0 ? 'text-slate-700 dark:text-slate-300' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(m.saldoMes)}
                      </td>
                      <td className={`py-2 px-2 text-right font-mono font-bold ${m.negativo ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {formatCurrency(m.saldoAcumulado)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>

          {/* Negative months alert */}
          {mesesNegativos > 0 && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-red-700 dark:text-red-400 font-medium text-sm">Atenção: {mesesNegativos} mês(es) com caixa negativo</p>
                <p className="text-red-600 dark:text-red-500 text-sm mt-0.5">
                  {delayMeses > 0
                    ? `O prazo de recebimento de ${delayMeses * 30} dias causa descasamento entre entradas e saídas. Considere negociar prazos menores ou ter capital de giro.`
                    : 'As saídas superam as entradas em parte do período. Revise custos ou busque aumentar a receita.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
