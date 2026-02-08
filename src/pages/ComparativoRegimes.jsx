import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { BarChart3, Award, Save, Trash2, FolderOpen, AlertTriangle, Info, Calculator, TrendingUp } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import { calcSimplesTax, calcMEI, calcLucroPresumido, calcLucroReal, formatCurrency, formatPercent, simplesNacional } from '../data/taxData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, LineChart, Line, Legend } from 'recharts';

import { calcCPPAnexoIV, calcFatorR, getAnexoPorFatorR, checkSublimiteSimples } from '../data/taxHelpers';
import PageHeader from '../components/PageHeader';
import DisclaimerBanner from '../components/DisclaimerBanner';
import ConfirmDialog from '../components/ConfirmDialog';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
const STORAGE_KEY = 'precificalc_comparativo';
const CENARIOS_KEY = 'precificalc_cenarios';
const MAX_CENARIOS = 10;

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

function loadCustosDefaults() {
  try {
    const saved = localStorage.getItem('precificalc_custos');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

function loadCenarios() {
  try {
    const saved = localStorage.getItem(CENARIOS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [];
}

function saveCenarios(cenarios) {
  try { localStorage.setItem(CENARIOS_KEY, JSON.stringify(cenarios)); } catch { /* ignore */ }
}

export default function ComparativoRegimes() {
  const savedState = loadState();
  const custosData = loadCustosDefaults();

  const [receitaMensal, setReceitaMensal] = useState(savedState?.receitaMensal ?? 30000);
  const [rbt12, setRbt12] = useState(savedState?.rbt12 ?? 360000);
  const [tipoAtividade, setTipoAtividade] = useState(savedState?.tipoAtividade ?? 'servicos');
  const [anexo, setAnexo] = useState(savedState?.anexo ?? 'III');
  const [issAliquota, setIssAliquota] = useState(savedState?.issAliquota ?? 5);
  const [despesasPercent, setDespesasPercent] = useState(
    savedState?.despesasPercent ?? (custosData ? Math.round((custosData.despesasFixas / (custosData.totalGeral || 1)) * 100) || 40 : 40)
  );
  const [creditosPercent, setCreditosPercent] = useState(savedState?.creditosPercent ?? 20);
  const [folhaMensal, setFolhaMensal] = useState(
    savedState?.folhaMensal ?? (custosData?.custoFolha ?? 10000)
  );

  // Growth simulation
  const [crescimentoAtivo, setCrescimentoAtivo] = useState(savedState?.crescimentoAtivo ?? false);
  const [crescimentoPercent, setCrescimentoPercent] = useState(savedState?.crescimentoPercent ?? 20);

  // Scenario management state
  const [cenarios, setCenarios] = useState(loadCenarios);
  const [nomeCenario, setNomeCenario] = useState('');
  const [showSalvar, setShowSalvar] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, nome: '' });

  // Undo toast state
  const [undoItem, setUndoItem] = useState(null);
  const undoTimerRef = useRef(null);

  // Persist input state to localStorage
  const persistState = useCallback(() => {
    const state = {
      receitaMensal, rbt12, tipoAtividade, anexo, issAliquota,
      despesasPercent, creditosPercent, folhaMensal,
      crescimentoAtivo, crescimentoPercent,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [receitaMensal, rbt12, tipoAtividade, anexo, issAliquota, despesasPercent, creditosPercent, folhaMensal, crescimentoAtivo, crescimentoPercent]);

  useEffect(() => { persistState(); }, [persistState]);

  // Fator R
  const folha12 = folhaMensal * 12;
  const fatorR = rbt12 > 0 ? calcFatorR(folha12, rbt12) : 0;
  const anexoEfetivo = getAnexoPorFatorR(fatorR, anexo);

  // Sublimite check
  const sublimite = useMemo(() => checkSublimiteSimples(rbt12), [rbt12]);

  // CPP for Anexo IV
  const cppAnexoIV = useMemo(() => {
    if (anexoEfetivo !== 'IV') return 0;
    return calcCPPAnexoIV(folhaMensal);
  }, [anexoEfetivo, folhaMensal]);

  function calcComparativo(rm, ra, effAnexo, cppVal) {
    const despesas = rm * (despesasPercent / 100);
    const creditos = rm * (creditosPercent / 100);
    const resultados = [];

    if (ra <= 81000) {
      const r = calcMEI(rm, 'servicos');
      if (r && !r.excedeLimite) resultados.push({ regime: 'MEI', impostoMensal: r.dasFixo, impostoAnual: r.dasAnual, aliquotaEfetiva: r.aliquotaEfetiva, liquidoMensal: rm - r.dasFixo, color: COLORS[0] });
    }
    if (ra <= 4800000) {
      const r = calcSimplesTax(ra, effAnexo);
      if (r && !r.excedeLimite && !r.migracao) {
        let impostoTotal = r.valorMensal;
        let label = `Simples (${effAnexo})`;
        if (effAnexo === 'IV') {
          impostoTotal += cppVal;
          label += ' + CPP';
        }
        if (effAnexo !== anexo) {
          label += ` [Fator R]`;
        }
        resultados.push({ regime: label, impostoMensal: impostoTotal, impostoAnual: impostoTotal * 12, aliquotaEfetiva: impostoTotal / (ra / 12), liquidoMensal: (ra / 12) - impostoTotal, color: COLORS[1] });
      }
    }
    const lp = calcLucroPresumido(rm, tipoAtividade, issAliquota / 100);
    if (lp && !lp.erro) resultados.push({ regime: 'L. Presumido', impostoMensal: lp.totalMensal, impostoAnual: lp.totalAnual, aliquotaEfetiva: lp.aliquotaEfetiva, liquidoMensal: rm - lp.totalMensal, color: COLORS[2] });
    const lr = calcLucroReal(rm, despesas, creditos, issAliquota / 100);
    if (lr && !lr.erro) resultados.push({ regime: 'L. Real', impostoMensal: lr.totalMensal, impostoAnual: lr.totalAnual, aliquotaEfetiva: lr.aliquotaEfetiva, liquidoMensal: rm - lr.totalMensal, color: COLORS[3] });

    resultados.sort((a, b) => a.impostoMensal - b.impostoMensal);
    return resultados;
  }

  const comparativo = useMemo(() => {
    return calcComparativo(receitaMensal, rbt12, anexoEfetivo, cppAnexoIV);
  }, [receitaMensal, rbt12, tipoAtividade, anexo, anexoEfetivo, issAliquota, despesasPercent, creditosPercent, cppAnexoIV, folhaMensal]);

  // Growth simulation
  const comparativoCrescimento = useMemo(() => {
    if (!crescimentoAtivo) return null;
    const fator = 1 + crescimentoPercent / 100;
    const rmCrescido = receitaMensal * fator;
    const raCrescido = rbt12 * fator;

    // Recalculate Fator R and Anexo Efetivo with new revenue
    const folha12Crescido = folhaMensal * 12;
    const fatorRCrescido = raCrescido > 0 ? calcFatorR(folha12Crescido, raCrescido) : 0;
    const anexoEfetivoCrescido = getAnexoPorFatorR(fatorRCrescido, anexo);
    const cppCrescido = anexoEfetivoCrescido === 'IV' ? calcCPPAnexoIV(folhaMensal) : 0;

    return calcComparativo(rmCrescido, raCrescido, anexoEfetivoCrescido, cppCrescido);
  }, [crescimentoAtivo, crescimentoPercent, receitaMensal, rbt12, tipoAtividade, anexo, issAliquota, despesasPercent, creditosPercent, folhaMensal]);

  const regimeMudouComCrescimento = useMemo(() => {
    if (!comparativoCrescimento || comparativoCrescimento.length === 0 || comparativo.length === 0) return false;
    return comparativo[0].regime !== comparativoCrescimento[0].regime;
  }, [comparativo, comparativoCrescimento]);

  const evolucao = useMemo(() => {
    return [5000, 10000, 20000, 30000, 50000, 80000, 100000, 150000, 200000, 300000, 400000].map((rm) => {
      const ra = rm * 12;
      const ponto = { receita: rm };
      if (ra <= 81000) { const m = calcMEI(rm, 'servicos'); if (m && !m.excedeLimite) ponto['MEI'] = m.aliquotaEfetiva * 100; }
      if (ra <= 4800000) {
        const effAnexo = getAnexoPorFatorR(fatorR, anexo);
        const s = calcSimplesTax(ra, effAnexo);
        if (s && !s.excedeLimite && !s.migracao) {
          let aliq = s.aliquotaEfetiva * 100;
          if (effAnexo === 'IV') {
            const cppVal = calcCPPAnexoIV(folhaMensal);
            aliq = ((s.valorMensal + cppVal) / (ra / 12)) * 100;
          }
          ponto[`Simples ${effAnexo}`] = aliq;
        }
      }
      const lp = calcLucroPresumido(rm, tipoAtividade, issAliquota / 100);
      if (lp && !lp.erro) ponto['L. Presumido'] = lp.aliquotaEfetiva * 100;
      const lr = calcLucroReal(rm, rm * (despesasPercent / 100), rm * (creditosPercent / 100), issAliquota / 100);
      if (lr && !lr.erro) ponto['L. Real'] = lr.aliquotaEfetiva * 100;
      return ponto;
    });
  }, [anexo, tipoAtividade, issAliquota, fatorR, folhaMensal, despesasPercent, creditosPercent]);

  const melhor = comparativo[0];
  const pior = comparativo[comparativo.length - 1];
  const economia = pior && melhor ? pior.impostoMensal - melhor.impostoMensal : 0;
  const tt = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,.1)' };

  const showFatorRInfo = anexo === 'V' && fatorR >= 0.28;
  const evolucaoAnexoKey = `Simples ${getAnexoPorFatorR(fatorR, anexo)}`;

  // Scenario functions
  function salvarCenario() {
    if (!nomeCenario.trim()) return;
    const novo = {
      id: Date.now(),
      nome: nomeCenario.trim(),
      data: new Date().toLocaleDateString('pt-BR'),
      params: { receitaMensal, rbt12, tipoAtividade, anexo, issAliquota, despesasPercent, creditosPercent, folhaMensal },
      resultados: comparativo.map(r => ({ regime: r.regime, impostoMensal: r.impostoMensal, aliquotaEfetiva: r.aliquotaEfetiva })),
      melhorRegime: melhor?.regime || '',
    };
    const updated = [novo, ...cenarios].slice(0, MAX_CENARIOS);
    setCenarios(updated);
    saveCenarios(updated);
    setNomeCenario('');
    setShowSalvar(false);
  }

  function carregarCenario(cenario) {
    const p = cenario.params;
    setReceitaMensal(p.receitaMensal);
    setRbt12(p.rbt12);
    setTipoAtividade(p.tipoAtividade);
    setAnexo(p.anexo);
    setIssAliquota(p.issAliquota);
    setDespesasPercent(p.despesasPercent);
    setCreditosPercent(p.creditosPercent);
    setFolhaMensal(p.folhaMensal ?? 10000);
  }

  function excluirCenario(id) {
    const idx = cenarios.findIndex(c => c.id === id);
    if (idx === -1) return;
    const item = cenarios[idx];
    const updated = cenarios.filter(c => c.id !== id);
    setCenarios(updated);
    saveCenarios(updated);
    setUndoItem({ item, idx });
    clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setUndoItem(null), 5000);
  }

  function handleUndo() {
    if (undoItem) {
      setCenarios(prev => {
        const restored = [...prev.slice(0, undoItem.idx), undoItem.item, ...prev.slice(undoItem.idx)];
        saveCenarios(restored);
        return restored;
      });
      setUndoItem(null);
      clearTimeout(undoTimerRef.current);
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader icon={BarChart3} title="Comparar Tributos" description="Descubra qual regime tributário paga menos tributo para esta empresa" />
      <DisclaimerBanner />

      {/* Sublimite warning */}
      {sublimite.mensagem && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-amber-700 font-medium text-sm">Atenção ao Sublimite</p>
            <p className="text-amber-600 text-sm mt-0.5">{sublimite.mensagem}</p>
          </div>
        </div>
      )}

      <Card>
        <CardBody>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField label="Receita Bruta Mensal" value={receitaMensal} onChange={setReceitaMensal} prefix="R$" step={5000} help="Receita Bruta (Faturamento) mensal da empresa" />
            <InputField label="RBT12 (Faturamento últimos 12 meses)" value={rbt12} onChange={setRbt12} prefix="R$" step={10000} help="Receita Bruta Total acumulada — define a faixa no Simples" />
            <SelectField label="Atividade da empresa" value={tipoAtividade} onChange={setTipoAtividade} options={[
              { value: 'servicos', label: 'Serviços' }, { value: 'comercio', label: 'Comércio' }, { value: 'industria', label: 'Indústria' },
            ]} />
            <SelectField label="Anexo do Simples" value={anexo} onChange={setAnexo} options={[
              { value: 'I', label: 'Anexo I - Comércio' }, { value: 'II', label: 'Anexo II - Indústria' },
              { value: 'III', label: 'Anexo III - Serviços' }, { value: 'IV', label: 'Anexo IV - Construção/Limpeza' }, { value: 'V', label: 'Anexo V - TI/Eng/Consultoria' },
            ]} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {tipoAtividade === 'servicos' && <InputField label="ISS do município (%)" value={issAliquota} onChange={setIssAliquota} suffix="%" min={2} max={5} step={0.5} help="Tributo municipal da empresa" />}
            <InputField label="Despesas dedutíveis (% do faturamento)" value={despesasPercent} onChange={setDespesasPercent} suffix="%" min={0} max={95} step={5} help="Gastos que abaixam o tributo no L. Real" />
            <InputField label="Créditos de PIS/COFINS (%)" value={creditosPercent} onChange={setCreditosPercent} suffix="%" min={0} max={80} step={5} help="Compras que geram crédito no L. Real" />
            <InputField label="Folha de Pagamento Mensal" value={folhaMensal} onChange={setFolhaMensal} prefix="R$" step={1000} min={0} help="Salários + encargos — usado para CPP (Anexo IV) e Fator R" />
          </div>

          {/* Fator R display */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md">
              <span className="text-xs text-slate-500">Fator R (% da folha sobre faturamento):</span>
              <span className={`text-sm font-semibold font-mono ${fatorR >= 0.28 ? 'text-emerald-600' : 'text-slate-700'}`}>
                {(fatorR * 100).toFixed(2)}%
              </span>
            </div>
            {showFatorRInfo && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                <Info size={14} />
                <span>Fator R ≥ 28% → usa Anexo III ao invés do V (tributo menor)</span>
              </div>
            )}
            {anexoEfetivo !== anexo && (
              <span className="text-xs text-brand-600 font-medium">
                Anexo efetivo: {simplesNacional.anexos[anexoEfetivo]?.nome}
              </span>
            )}
            {cppAnexoIV > 0 && (
              <span className="text-xs text-amber-600">
                CPP (INSS Patronal) Anexo IV: {formatCurrency(cppAnexoIV)}/mês — pago separado via GPS
              </span>
            )}
          </div>
        </CardBody>
      </Card>

      {melhor && (
        <div className="bg-gradient-to-r from-brand-50 to-white border-2 border-brand-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
              <Award size={28} className="text-brand-600" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">O melhor pro seu caso</p>
              <p className="text-slate-800 text-xl font-bold">{melhor.regime}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-slate-400 text-xs">Tributo efetivo</p>
              <p className="text-brand-600 font-bold">{formatPercent(melhor.aliquotaEfetiva)}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs">Economia/mês</p>
              <p className="text-emerald-600 font-bold">{formatCurrency(economia)}</p>
            </div>
            <button
              onClick={() => setShowSalvar(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-brand-600 bg-brand-50 border border-brand-200 rounded-md hover:bg-brand-100 transition-colors"
            >
              <Save size={14} />
              Salvar Cenário
            </button>
          </div>
        </div>
      )}

      {/* Save scenario modal */}
      {showSalvar && (
        <Card>
          <CardBody>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <InputField
                  label="Nome do Cenário"
                  value={nomeCenario}
                  onChange={setNomeCenario}
                  type="text"
                  placeholder="Ex: Cenário base - Serviços 30k"
                />
              </div>
              <button
                onClick={salvarCenario}
                disabled={!nomeCenario.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Salvar
              </button>
              <button
                onClick={() => { setShowSalvar(false); setNomeCenario(''); }}
                className="px-4 py-2 text-sm font-medium text-slate-500 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="text-slate-800 font-medium text-sm">Quanto de tributo em cada tipo</h2></CardHeader>
          <CardBody>
            <div role="img" aria-label="Gráfico: tributo mensal por regime tributário">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={comparativo} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="regime" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tt} formatter={(v) => [formatCurrency(v), 'Tributo Mensal']} />
                  <Bar dataKey="impostoMensal" radius={[4, 4, 0, 0]}>
                    {comparativo.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
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
                      <th className="text-left py-1 px-2">Regime</th>
                      <th className="text-right py-1 px-2">Tributo Mensal</th>
                      <th className="text-right py-1 px-2">Alíquota Efetiva</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparativo.map((item, i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                        <td className="py-1 px-2 text-slate-700 dark:text-slate-300">{item.regime}</td>
                        <td className="py-1 px-2 text-right text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(item.impostoMensal)}</td>
                        <td className="py-1 px-2 text-right text-slate-700 dark:text-slate-300 font-mono">{formatPercent(item.aliquotaEfetiva)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h2 className="text-slate-800 font-medium text-sm">Do melhor pro pior</h2></CardHeader>
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
              <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-xl text-center">
                <p className="text-xs text-emerald-600 font-medium">Escolhendo {melhor.regime} você economiza:</p>
                <p className="text-2xl font-black text-emerald-700">{formatCurrency(economia * 12)}/ano</p>
                <p className="text-sm text-emerald-600 mt-1">
                  São {formatCurrency(economia)}/mês que ficam no caixa da empresa.
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-slate-800 font-medium text-sm">Alíquota Efetiva (% real de tributo) por Receita Bruta (Faturamento)</h2>
          <p className="text-slate-400 text-xs mt-0.5">Como o percentual de tributo muda conforme a receita cresce</p>
        </CardHeader>
        <CardBody>
          <div role="img" aria-label="Gráfico: alíquota efetiva por receita bruta mensal em cada regime">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={evolucao} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="receita" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${v.toFixed(1)}%`} />
                <Tooltip contentStyle={tt} formatter={(v) => [`${v.toFixed(1)}%`, '']} labelFormatter={(v) => `Receita: ${formatCurrency(v)}/mês`} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="MEI" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                <Line type="monotone" dataKey={evolucaoAnexoKey} stroke={COLORS[1]} strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                <Line type="monotone" dataKey="L. Presumido" stroke={COLORS[2]} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="L. Real" stroke={COLORS[3]} strokeWidth={2} dot={{ r: 3 }} />
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
                    <th className="text-left py-1 px-2">Receita</th>
                    <th className="text-right py-1 px-2">MEI</th>
                    <th className="text-right py-1 px-2">{evolucaoAnexoKey}</th>
                    <th className="text-right py-1 px-2">L. Presumido</th>
                    <th className="text-right py-1 px-2">L. Real</th>
                  </tr>
                </thead>
                <tbody>
                  {evolucao.map((row, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                      <td className="py-1 px-2 text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(row.receita)}</td>
                      <td className="py-1 px-2 text-right text-slate-700 dark:text-slate-300 font-mono">{row.MEI != null ? `${row.MEI.toFixed(1)}%` : '-'}</td>
                      <td className="py-1 px-2 text-right text-slate-700 dark:text-slate-300 font-mono">{row[evolucaoAnexoKey] != null ? `${row[evolucaoAnexoKey].toFixed(1)}%` : '-'}</td>
                      <td className="py-1 px-2 text-right text-slate-700 dark:text-slate-300 font-mono">{row['L. Presumido'] != null ? `${row['L. Presumido'].toFixed(1)}%` : '-'}</td>
                      <td className="py-1 px-2 text-right text-slate-700 dark:text-slate-300 font-mono">{row['L. Real'] != null ? `${row['L. Real'].toFixed(1)}%` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </CardBody>
      </Card>

      {/* Growth simulation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-slate-800 dark:text-slate-200 font-medium text-sm flex items-center gap-2">
              <TrendingUp size={14} className="text-slate-400" />
              Simular crescimento
            </h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={crescimentoAtivo}
                onChange={(e) => setCrescimentoAtivo(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ativar</span>
            </label>
          </div>
        </CardHeader>
        {crescimentoAtivo && (
          <CardBody className="space-y-4">
            <div className="flex items-end gap-4">
              <SelectField
                label="Percentual de crescimento"
                value={crescimentoPercent}
                onChange={(v) => setCrescimentoPercent(Number(v))}
                options={[
                  { value: 10, label: '10%' },
                  { value: 20, label: '20%' },
                  { value: 30, label: '30%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' },
                ]}
              />
              <div className="pb-1">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Receita projetada: {formatCurrency(receitaMensal * (1 + crescimentoPercent / 100))}/mês
                  ({formatCurrency(rbt12 * (1 + crescimentoPercent / 100))}/ano)
                </p>
              </div>
            </div>

            {regimeMudouComCrescimento && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  O regime mais vantajoso <strong>muda</strong> com o crescimento: de <strong>{comparativo[0]?.regime}</strong> para <strong>{comparativoCrescimento[0]?.regime}</strong>.
                </p>
              </div>
            )}

            {comparativoCrescimento && comparativoCrescimento.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Current */}
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Atual ({formatCurrency(receitaMensal)}/mês)</p>
                  <div className="space-y-1.5">
                    {comparativo.map((item, i) => (
                      <div key={i} className={`flex items-center justify-between p-2.5 rounded-md border ${i === 0 ? 'border-brand-200 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-950/30' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'}`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded text-[10px] flex items-center justify-center font-semibold ${i === 0 ? 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>{i + 1}</span>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.regime}</span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">{formatCurrency(item.impostoMensal)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* With growth */}
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Com crescimento de {crescimentoPercent}% ({formatCurrency(receitaMensal * (1 + crescimentoPercent / 100))}/mês)</p>
                  <div className="space-y-1.5">
                    {comparativoCrescimento.map((item, i) => (
                      <div key={i} className={`flex items-center justify-between p-2.5 rounded-md border ${i === 0 ? 'border-emerald-200 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'}`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded text-[10px] flex items-center justify-center font-semibold ${i === 0 ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>{i + 1}</span>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.regime}</span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">{formatCurrency(item.impostoMensal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        )}
      </Card>

      {/* Saved Scenarios */}
      {cenarios.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-slate-800 font-medium text-sm flex items-center gap-2">
              <FolderOpen size={14} className="text-slate-400" />
              Cenários Salvos
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">Até {MAX_CENARIOS} cenários armazenados localmente</p>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {cenarios.map((cenario) => (
                <div key={cenario.id} className="flex items-center justify-between p-3 rounded-md border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-slate-700 truncate">{cenario.nome}</p>
                      <span className="text-[10px] px-1.5 py-0.5 bg-brand-50 text-brand-600 border border-brand-200 rounded-full whitespace-nowrap">
                        {cenario.melhorRegime}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {cenario.data} - Receita: {formatCurrency(cenario.params.receitaMensal)}/mês | RBT12: {formatCurrency(cenario.params.rbt12)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button
                      onClick={() => carregarCenario(cenario)}
                      className="p-1.5 text-brand-500 hover:bg-brand-50 rounded-md transition-colors"
                      title="Carregar cenário"
                    >
                      <FolderOpen size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ open: true, id: cenario.id, nome: cenario.nome })}
                      className="p-1.5 text-red-400 hover:bg-red-50 rounded-md transition-colors"
                      title="Excluir cenário"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Empty state when no results */}
      {comparativo.length === 0 && (
        <Card className="flex items-center justify-center h-40">
          <div className="text-center">
            <Calculator size={32} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Nenhum regime disponível para os parâmetros informados.</p>
            <p className="text-slate-400 text-xs mt-1">Ajuste a receita ou o RBT12 para ver os resultados.</p>
          </div>
        </Card>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title="Excluir cenário?"
        message={`Excluir "${deleteConfirm.nome}"?`}
        confirmLabel="Excluir"
        onConfirm={() => { excluirCenario(deleteConfirm.id); setDeleteConfirm({ open: false, id: null, nome: '' }); }}
        onCancel={() => setDeleteConfirm({ open: false, id: null, nome: '' })}
      />

      {undoItem && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-800 dark:bg-slate-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fadeIn">
          <span className="text-sm">Item excluído.</span>
          <button onClick={handleUndo} className="text-sm font-medium text-brand-400 hover:text-brand-300">
            Desfazer
          </button>
        </div>
      )}
    </div>
  );
}
