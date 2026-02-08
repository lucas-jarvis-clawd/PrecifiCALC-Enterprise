import { useState, useEffect, useMemo } from 'react';
import { History, Save, Trash2 } from 'lucide-react';
import { Card, CardBody, CardHeader } from './Card';
import { formatCurrency } from '../data/taxData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STORAGE_KEY = 'precificalc_historico_mensal';
const MAX_MONTHS = 12;

function loadHistorico() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistorico(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function captureCurrentMonth() {
  const now = new Date();
  const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  let receita = 0;
  let custos = 0;
  let tributos = 0;

  try {
    const sim = JSON.parse(localStorage.getItem('precificalc_simulador') || '{}');
    receita = sim.receitaMensal || sim.receita || 0;
    tributos = sim.totalTributos || sim.valorDAS || 0;
  } catch { /* empty */ }

  try {
    const cust = JSON.parse(localStorage.getItem('precificalc_custos') || '{}');
    custos = cust.totalGeral || 0;
  } catch { /* empty */ }

  const lucro = receita - custos - tributos;

  return { mes, receita, custos, tributos, lucro, timestamp: Date.now() };
}

function formatMesLabel(mes) {
  const [year, month] = mes.split('-');
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${meses[parseInt(month, 10) - 1]}/${year.slice(2)}`;
}

export default function HistoricoCalcMensal() {
  const [historico, setHistorico] = useState([]);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    setHistorico(loadHistorico());
  }, []);

  const chartData = useMemo(() => {
    const sorted = [...historico].sort((a, b) => a.mes.localeCompare(b.mes));
    return sorted.slice(-MAX_MONTHS).map(entry => ({
      ...entry,
      label: formatMesLabel(entry.mes),
    }));
  }, [historico]);

  function handleSave() {
    const entry = captureCurrentMonth();
    if (entry.receita === 0 && entry.custos === 0) {
      setSaveMsg('Preencha o Simulador e Custos antes de salvar.');
      setTimeout(() => setSaveMsg(''), 3000);
      return;
    }

    const updated = [...historico];
    const existingIndex = updated.findIndex(h => h.mes === entry.mes);
    if (existingIndex >= 0) {
      updated[existingIndex] = entry;
    } else {
      updated.push(entry);
    }

    // Keep only last MAX_MONTHS
    const sorted = updated.sort((a, b) => a.mes.localeCompare(b.mes)).slice(-MAX_MONTHS);
    setHistorico(sorted);
    saveHistorico(sorted);
    setSaveMsg('Mês salvo com sucesso!');
    setTimeout(() => setSaveMsg(''), 3000);
  }

  function handleClear() {
    setHistorico([]);
    saveHistorico([]);
  }

  const tt = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,.1)' };

  if (historico.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-slate-800 dark:text-slate-200 font-medium text-sm flex items-center gap-2">
              <History size={16} className="text-brand-600 dark:text-brand-400" />
              Historico Mensal
            </h2>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-700 rounded-md text-xs font-medium hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors"
            >
              <Save size={14} /> Salvar mes atual
            </button>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
            Nenhum registro ainda. Clique em "Salvar mes atual" para comecar a acompanhar a evolucao mensal.
          </p>
          {saveMsg && (
            <p className="text-xs text-center mt-2 text-amber-600 dark:text-amber-400 font-medium">{saveMsg}</p>
          )}
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-slate-800 dark:text-slate-200 font-medium text-sm flex items-center gap-2">
            <History size={16} className="text-brand-600 dark:text-brand-400" />
            Historico Mensal ({historico.length} meses)
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-2 py-1 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 text-xs transition-colors"
              title="Limpar historico"
            >
              <Trash2 size={12} /> Limpar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-700 rounded-md text-xs font-medium hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors"
            >
              <Save size={14} /> Salvar mes atual
            </button>
          </div>
        </div>
        {saveMsg && (
          <p className="text-xs mt-2 text-emerald-600 dark:text-emerald-400 font-medium">{saveMsg}</p>
        )}
      </CardHeader>
      <CardBody>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tt} formatter={v => [formatCurrency(v), '']} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="receita" name="Receita" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="custos" name="Custos" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="lucro" name="Lucro" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>

        {/* Data table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Mes</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Receita</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Custos</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Tributos</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Lucro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {chartData.map(entry => (
                <tr key={entry.mes} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{entry.label}</td>
                  <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-300">{formatCurrency(entry.receita)}</td>
                  <td className="py-2 px-3 text-right text-red-500">{formatCurrency(entry.custos)}</td>
                  <td className="py-2 px-3 text-right text-amber-600 dark:text-amber-400">{formatCurrency(entry.tributos)}</td>
                  <td className={`py-2 px-3 text-right font-semibold ${entry.lucro >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
                    {formatCurrency(entry.lucro)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
