import { useState, useMemo, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Sparkles, ArrowDown } from 'lucide-react';
import { formatCurrency } from '../data/taxData';

/**
 * "QUANTO SOBRA NO BOLSO" — Giant card showing the entrepreneur's real net profit.
 * Reads data from localStorage (simulador, custos, precificacao) and calculates.
 */
export default function QuantoSobraCard({ perfilEmpresa }) {
  const [dados, setDados] = useState(null);

  useEffect(() => {
    try {
      // Try reading from different localStorage sources
      const precif = localStorage.getItem('precificalc_precificacao');
      const custos = localStorage.getItem('precificalc_custos');
      const sim = localStorage.getItem('precificalc_simulador');
      const perfil = perfilEmpresa || JSON.parse(localStorage.getItem('precificalc_perfil') || '{}');

      let faturamentoMensal = 0;
      let custosFixos = 0;
      let custosVariaveis = 0;
      let impostos = 0;
      let lucroUnit = 0;
      let qtdMensal = 0;
      let precoVenda = 0;
      let hasData = false;

      if (precif) {
        const p = JSON.parse(precif);
        precoVenda = p.custoProduto || 0;
        custosFixos = p.despesasFixas || 0;
        qtdMensal = p.quantidadeMensal || 1;
        const margem = (p.margemDesejada || 30) / 100;
        faturamentoMensal = p.receitaMensal || (p.rbt12 ? p.rbt12 / 12 : 0);
        hasData = faturamentoMensal > 0;
      }

      if (custos) {
        const c = JSON.parse(custos);
        if (c.despesasFixas) custosFixos = c.despesasFixas;
        if (c.totalGeral) {
          custosVariaveis = c.totalGeral - (c.despesasFixas || 0);
        }
        hasData = true;
      }

      if (sim) {
        const s = JSON.parse(sim);
        if (s.receitaMensal) faturamentoMensal = s.receitaMensal;
        if (s.impostoMensal) impostos = s.impostoMensal;
        hasData = true;
      }

      if (!hasData && perfil.receitaAnual) {
        faturamentoMensal = perfil.receitaAnual / 12;
        hasData = true;
      }

      // Estimate impostos if not set
      if (impostos === 0 && faturamentoMensal > 0) {
        // Rough estimate based on regime
        const regime = perfil?.regime || 'simples';
        const taxRates = { mei: 0.05, simples: 0.10, presumido: 0.14, real: 0.20 };
        impostos = faturamentoMensal * (taxRates[regime] || 0.10);
      }

      if (!hasData) {
        setDados(null);
        return;
      }

      const lucroMensal = faturamentoMensal - custosFixos - custosVariaveis - impostos;
      const lucroAnual = lucroMensal * 12;
      const margemReal = faturamentoMensal > 0 ? (lucroMensal / faturamentoMensal) * 100 : 0;

      setDados({
        faturamentoMensal,
        custosFixos,
        custosVariaveis,
        impostos,
        lucroMensal,
        lucroAnual,
        margemReal,
        hasData: true,
      });
    } catch {
      setDados(null);
    }
  }, [perfilEmpresa]);

  // Empty state — no data
  if (!dados || !dados.hasData) {
    return (
      <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 border-2 border-dashed border-slate-300">
        <div className="text-center">
          <span className="text-4xl">💰</span>
          <h3 className="text-lg font-bold text-slate-600 mt-2">Lucro Líquido do Empresário</h3>
          <p className="text-slate-400 text-xs mt-0.5">(Quanto sobra no seu bolso após todos os gastos e impostos)</p>
          <p className="text-slate-500 text-sm mt-2">
            Use o botão <strong>"Quero Precificar!"</strong> para descobrir
          </p>
        </div>
      </div>
    );
  }

  const isPositive = dados.lucroMensal > 0;
  const isGood = dados.margemReal >= 20;
  const isOk = dados.margemReal >= 10;

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 border-2 shadow-lg ${
      isPositive
        ? 'bg-gradient-to-br from-emerald-50 via-emerald-100 to-teal-50 border-emerald-300'
        : 'bg-gradient-to-br from-red-50 via-red-100 to-orange-50 border-red-300'
    }`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <DollarSign size={128} className={isPositive ? 'text-emerald-600' : 'text-red-600'} />
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{isPositive ? '💰' : '⚠️'}</span>
        <div>
          <h3 className={`text-sm font-bold uppercase tracking-wider ${
            isPositive ? 'text-emerald-800' : 'text-red-800'
          }`}>
            Lucro Líquido do Empresário
          </h3>
          <p className={`text-[10px] ${isPositive ? 'text-emerald-600' : 'text-red-600'} opacity-70`}>
            (Quanto sobra no seu bolso após todos os gastos e impostos)
          </p>
        </div>
      </div>

      {/* Main numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className={`text-xs ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>Por mês</p>
          <p className={`text-3xl font-black ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
            {formatCurrency(dados.lucroMensal)}
          </p>
        </div>
        <div>
          <p className={`text-xs ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>Por ano</p>
          <p className={`text-3xl font-black ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
            {formatCurrency(dados.lucroAnual)}
          </p>
        </div>
        <div>
          <p className={`text-xs ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>Margem real</p>
          <div className="flex items-center gap-2">
            <p className={`text-3xl font-black ${isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
              {dados.margemReal.toFixed(1)}%
            </p>
            {isPositive ? (
              <TrendingUp className="text-emerald-500" size={24} />
            ) : (
              <TrendingDown className="text-red-500" size={24} />
            )}
          </div>
        </div>
      </div>

      {/* Breakdown bar */}
      <div className="mt-4 pt-4 border-t border-emerald-300/50">
        <div className="flex items-center gap-1 text-xs mb-2">
          <span className="text-slate-600 font-medium">De cada {formatCurrency(dados.faturamentoMensal)} que entra:</span>
        </div>
        <div className="flex h-6 rounded-lg overflow-hidden">
          {dados.custosFixos > 0 && (
            <div
              className="bg-orange-400 flex items-center justify-center"
              style={{ width: `${(dados.custosFixos / dados.faturamentoMensal) * 100}%` }}
              title={`Gastos fixos: ${formatCurrency(dados.custosFixos)}`}
            />
          )}
          {dados.custosVariaveis > 0 && (
            <div
              className="bg-amber-400 flex items-center justify-center"
              style={{ width: `${(dados.custosVariaveis / dados.faturamentoMensal) * 100}%` }}
              title={`Gastos variáveis: ${formatCurrency(dados.custosVariaveis)}`}
            />
          )}
          {dados.impostos > 0 && (
            <div
              className="bg-red-400 flex items-center justify-center"
              style={{ width: `${(dados.impostos / dados.faturamentoMensal) * 100}%` }}
              title={`Impostos: ${formatCurrency(dados.impostos)}`}
            />
          )}
          <div
            className={`${isPositive ? 'bg-emerald-500' : 'bg-red-500'} flex items-center justify-center`}
            style={{ width: `${Math.max(Math.abs(dados.margemReal), 2)}%` }}
            title={`Lucro: ${formatCurrency(dados.lucroMensal)}`}
          />
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" /> Fixos</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Variáveis</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Impostos</span>
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {isPositive ? 'Lucro' : 'Prejuízo'}
          </span>
        </div>
      </div>

      {/* Emotional feedback */}
      {!isPositive && (
        <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-sm font-bold text-red-700">😰 Atenção! Você está no prejuízo!</p>
          <p className="text-xs text-red-600 mt-1">Revise seus preços ou reduza custos. Você precisa cobrar mais ou gastar menos.</p>
        </div>
      )}
      {isPositive && isGood && (
        <div className="mt-3 p-3 bg-emerald-200/50 border border-emerald-300 rounded-lg">
          <p className="text-sm font-bold text-emerald-700">🎉 Excelente! Margem saudável!</p>
          <p className="text-xs text-emerald-600 mt-1">Sua margem está acima de 20%. Negócio bem precificado!</p>
        </div>
      )}
      {isPositive && !isGood && isOk && (
        <div className="mt-3 p-3 bg-amber-100 border border-amber-300 rounded-lg">
          <p className="text-sm font-bold text-amber-700">⚡ Pode melhorar!</p>
          <p className="text-xs text-amber-600 mt-1">Margem entre 10-20%. Considere ajustar seus preços para cima.</p>
        </div>
      )}
    </div>
  );
}
