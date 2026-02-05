import { useState, useMemo, useEffect } from 'react';
import { Tags, DollarSign, TrendingUp, Calculator, AlertTriangle, Info, Clock, ArrowDownUp, Sparkles } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import { InfoTip } from '../components/Tooltip';
import {
  formatCurrency, formatPercent,
  calcSimplesTax, calcLucroPresumido, calcLucroReal, calcMEI,
} from '../data/taxData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

// Fallback helper functions
const _calcCPP = (folha) => folha * 0.20;
const _calcFatorR = (folha12, rbt12) => rbt12 > 0 ? folha12 / rbt12 : 0;
const _getAnexoFR = (fr, anexo) => (anexo === 'V' && fr >= 0.28) ? 'III' : anexo;
const _checkSublimite = (rbt12) => ({
  dentroSimples: rbt12 <= 4800000,
  dentroSublimite: rbt12 <= 3600000,
  mensagem: rbt12 > 4800000 ? 'Faturamento ultrapassa R$ 4,8M (limite Simples)' : rbt12 > 3600000 ? 'Faturamento ultrapassa R$ 3,6M. ISS/ICMS separados.' : null,
});

const LS_KEY = 'precificalc_precificacao';

export default function Precificacao() {
  const [modo, setModo] = useState('normal'); // 'normal', 'hora', 'reverso'
  const [tipo, setTipo] = useState('servico');
  const [custoProduto, setCustoProduto] = useState(100);
  const [despesasFixas, setDespesasFixas] = useState(5000);
  const [despesasVariaveisPercent, setDespesasVariaveisPercent] = useState(10);
  const [margemDesejada, setMargemDesejada] = useState(30);
  const [regime, setRegime] = useState('simples');
  const [anexo, setAnexo] = useState('III');
  const [tipoAtividade, setTipoAtividade] = useState('servicos');
  const [issAliquota, setIssAliquota] = useState(5);
  const [rbt12, setRbt12] = useState(600000);
  const [receitaMensal, setReceitaMensal] = useState(50000);
  const [quantidadeMensal, setQuantidadeMensal] = useState(100);
  const [custosImportados, setCustosImportados] = useState(false);
  const [folhaMensal, setFolhaMensal] = useState(20000);
  const [adicoesLalur, setAdicoesLalur] = useState(0);
  const [exclusoesLalur, setExclusoesLalur] = useState(0);

  // Hourly pricing fields
  const [horasPorServico, setHorasPorServico] = useState(2);
  const [custoHora, setCustoHora] = useState(50);
  const [servicosMensal, setServicosMensal] = useState(40);

  // Reverse pricing fields
  const [precoMercado, setPrecoMercado] = useState(200);

  // Import costs
  useEffect(() => {
    try {
      const saved = localStorage.getItem('precificalc_custos');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.despesasFixas) setDespesasFixas(data.despesasFixas);
        if (data.custoVariavelUnitario) setCustoProduto(data.custoVariavelUnitario);
        if (data.quantidadeMensal) setQuantidadeMensal(data.quantidadeMensal);
        setCustosImportados(true);
      }
    } catch {}
  }, []);

  // localStorage persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.modo !== undefined) setModo(data.modo);
        if (data.tipo !== undefined) setTipo(data.tipo);
        if (data.custoProduto !== undefined) setCustoProduto(data.custoProduto);
        if (data.despesasFixas !== undefined) setDespesasFixas(data.despesasFixas);
        if (data.despesasVariaveisPercent !== undefined) setDespesasVariaveisPercent(data.despesasVariaveisPercent);
        if (data.margemDesejada !== undefined) setMargemDesejada(data.margemDesejada);
        if (data.regime !== undefined) setRegime(data.regime);
        if (data.anexo !== undefined) setAnexo(data.anexo);
        if (data.tipoAtividade !== undefined) setTipoAtividade(data.tipoAtividade);
        if (data.issAliquota !== undefined) setIssAliquota(data.issAliquota);
        if (data.rbt12 !== undefined) setRbt12(data.rbt12);
        if (data.receitaMensal !== undefined) setReceitaMensal(data.receitaMensal);
        if (data.quantidadeMensal !== undefined) setQuantidadeMensal(data.quantidadeMensal);
        if (data.folhaMensal !== undefined) setFolhaMensal(data.folhaMensal);
        if (data.adicoesLalur !== undefined) setAdicoesLalur(data.adicoesLalur);
        if (data.exclusoesLalur !== undefined) setExclusoesLalur(data.exclusoesLalur);
        if (data.horasPorServico !== undefined) setHorasPorServico(data.horasPorServico);
        if (data.custoHora !== undefined) setCustoHora(data.custoHora);
        if (data.servicosMensal !== undefined) setServicosMensal(data.servicosMensal);
        if (data.precoMercado !== undefined) setPrecoMercado(data.precoMercado);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        modo, tipo, custoProduto, despesasFixas, despesasVariaveisPercent, margemDesejada,
        regime, anexo, tipoAtividade, issAliquota, rbt12, receitaMensal, quantidadeMensal,
        folhaMensal, adicoesLalur, exclusoesLalur, horasPorServico, custoHora, servicosMensal, precoMercado,
      }));
    } catch {}
  }, [modo, tipo, custoProduto, despesasFixas, despesasVariaveisPercent, margemDesejada,
    regime, anexo, tipoAtividade, issAliquota, rbt12, receitaMensal, quantidadeMensal,
    folhaMensal, adicoesLalur, exclusoesLalur, horasPorServico, custoHora, servicosMensal, precoMercado]);

  // Fator R and effective Anexo (translated: "Folha%" instead of "Fator R")
  const folhaPercent = regime === 'simples' ? _calcFatorR(folhaMensal * 12, rbt12) : 0;
  const anexoEfetivo = regime === 'simples' ? _getAnexoFR(folhaPercent, anexo) : anexo;
  const migrouAnexo = regime === 'simples' && anexo === 'V' && anexoEfetivo === 'III';

  const cppAnexoIV = (regime === 'simples' && anexoEfetivo === 'IV') ? _calcCPP(folhaMensal) : 0;
  const sublimite = regime === 'simples' ? _checkSublimite(rbt12) : null;
  const receitaMensalEfetiva = regime === 'simples' ? rbt12 / 12 : receitaMensal;

  const aliquotaEfetiva = useMemo(() => {
    switch (regime) {
      case 'mei': {
        const r = calcMEI(receitaMensalEfetiva, tipoAtividade === 'comercio' ? 'comercio' : 'servicos');
        return r && !r.excedeLimite ? r.aliquotaEfetiva : 0;
      }
      case 'simples': {
        const r = calcSimplesTax(rbt12, anexoEfetivo);
        return r && !r.excedeLimite ? r.aliquotaEfetiva : 0;
      }
      case 'presumido': {
        const r = calcLucroPresumido(receitaMensal, tipoAtividade, issAliquota / 100);
        return r && !r.erro ? r.aliquotaEfetiva : 0;
      }
      case 'real': {
        const r = calcLucroReal(receitaMensal, receitaMensal * 0.6, receitaMensal * 0.3, issAliquota / 100);
        return r && !r.erro ? r.aliquotaEfetiva : 0;
      }
      default: return 0;
    }
  }, [regime, rbt12, receitaMensal, receitaMensalEfetiva, anexoEfetivo, tipoAtividade, issAliquota]);

  // Main calculation
  const calculo = useMemo(() => {
    let custoUnitarioBase = custoProduto;
    let qtdEfetiva = quantidadeMensal;

    // In hourly mode, compute cost per service from hourly cost
    if (modo === 'hora') {
      custoUnitarioBase = custoHora * horasPorServico;
      qtdEfetiva = servicosMensal;
    }

    const custoUnitario = custoUnitarioBase;
    const despVariavelUnitario = custoUnitarioBase * (despesasVariaveisPercent / 100);
    const custoFixoUnitario = qtdEfetiva > 0 ? despesasFixas / qtdEfetiva : 0;
    const custoTotal = custoUnitario + despVariavelUnitario + custoFixoUnitario;

    const denominador = 1 - aliquotaEfetiva - (margemDesejada / 100);
    const precoVenda = denominador > 0 ? custoTotal / denominador : custoTotal * 2;

    const impostoUnitario = precoVenda * aliquotaEfetiva;
    const cppUnitario = qtdEfetiva > 0 ? cppAnexoIV / qtdEfetiva : 0;
    const impostoTotalUnitario = impostoUnitario + cppUnitario;
    const lucroUnitario = precoVenda - custoTotal - impostoTotalUnitario;
    const margemReal = precoVenda > 0 ? (lucroUnitario / precoVenda) * 100 : 0;
    const markup = custoUnitario > 0 ? ((precoVenda - custoUnitario) / custoUnitario) * 100 : 0;

    const recMensal = precoVenda * qtdEfetiva;
    const lucroMensal = lucroUnitario * qtdEfetiva;
    const lucroAnual = lucroMensal * 12;
    const impostosMensal = impostoTotalUnitario * qtdEfetiva;

    const margemContribuicao = precoVenda - custoUnitario - despVariavelUnitario - impostoTotalUnitario;
    const pontoEquilibrioQtd = margemContribuicao > 0 ? Math.ceil(despesasFixas / margemContribuicao) : 0;
    const pontoEquilibrioReceita = pontoEquilibrioQtd * precoVenda;

    // Preço por hora
    const precoHora = modo === 'hora' && horasPorServico > 0 ? precoVenda / horasPorServico : 0;

    // Preço mínimo (margem zero)
    const denMin = 1 - aliquotaEfetiva;
    const precoMinimo = denMin > 0 ? custoTotal / denMin : custoTotal;

    // Reverse pricing calculation
    let reverso = null;
    if (modo === 'reverso' && precoMercado > 0) {
      const impostoRev = precoMercado * aliquotaEfetiva;
      const cppRev = qtdEfetiva > 0 ? cppAnexoIV / qtdEfetiva : 0;
      const lucroRev = precoMercado - custoTotal - impostoRev - cppRev;
      const margemRev = precoMercado > 0 ? (lucroRev / precoMercado) * 100 : 0;
      const lucroMensalRev = lucroRev * qtdEfetiva;
      reverso = {
        precoMercado,
        lucroUnitario: lucroRev,
        margemReal: margemRev,
        lucroMensal: lucroMensalRev,
        lucroAnual: lucroMensalRev * 12,
        impostos: impostoRev,
        temLucro: lucroRev > 0,
      };
    }

    // Compare price across all regimes
    const comparativoPrecos = [];
    const regimeCalcs = {};

    // MEI
    if (rbt12 <= 81000) {
      const r = calcMEI(receitaMensalEfetiva, tipoAtividade === 'comercio' ? 'comercio' : 'servicos');
      if (r && !r.excedeLimite) regimeCalcs.mei = r.aliquotaEfetiva;
    }
    // Simples
    if (rbt12 <= 4800000) {
      const aSimples = tipoAtividade === 'comercio' ? 'I' : tipoAtividade === 'industria' ? 'II' : 'III';
      const r = calcSimplesTax(rbt12, aSimples);
      if (r && !r.excedeLimite && !r.migracao) regimeCalcs.simples = r.aliquotaEfetiva;
    }
    const lpComp = calcLucroPresumido(receitaMensalEfetiva, tipoAtividade, issAliquota / 100);
    if (lpComp && !lpComp.erro) regimeCalcs.presumido = lpComp.aliquotaEfetiva;
    const lrComp = calcLucroReal(receitaMensalEfetiva, receitaMensalEfetiva * 0.6, receitaMensalEfetiva * 0.3, issAliquota / 100);
    if (lrComp && !lrComp.erro) regimeCalcs.real = lrComp.aliquotaEfetiva;

    const labels = { mei: 'MEI', simples: 'Simples', presumido: 'L. Presumido', real: 'L. Real' };
    Object.entries(regimeCalcs).forEach(([reg, aliq]) => {
      const den = 1 - aliq - (margemDesejada / 100);
      const preco = den > 0 ? custoTotal / den : custoTotal * 2;
      comparativoPrecos.push({
        regime: labels[reg],
        preco,
        aliquota: aliq,
        isAtual: reg === regime,
      });
    });
    comparativoPrecos.sort((a, b) => a.preco - b.preco);

    return {
      custoUnitario, despVariavelUnitario, custoFixoUnitario, custoTotal,
      precoVenda, impostoUnitario, impostoTotalUnitario, cppUnitario, lucroUnitario, margemReal, markup,
      receitaMensal: recMensal, lucroMensal, lucroAnual, impostosMensal,
      pontoEquilibrioQtd, pontoEquilibrioReceita, margemContribuicao,
      precoHora, precoMinimo, reverso, comparativoPrecos,
      qtdEfetiva,
    };
  }, [custoProduto, despesasFixas, despesasVariaveisPercent, margemDesejada, aliquotaEfetiva,
    quantidadeMensal, cppAnexoIV, modo, custoHora, horasPorServico, servicosMensal, precoMercado,
    rbt12, receitaMensalEfetiva, tipoAtividade, issAliquota, regime]);

  // Sensitivity chart data
  const chartData = useMemo(() => {
    const custoT = calculo.custoTotal;
    return [10, 15, 20, 25, 30, 35, 40, 50].map(m => {
      const den = 1 - aliquotaEfetiva - (m / 100);
      const preco = den > 0 ? custoT / den : custoT * 2;
      return { margem: `${m}%`, preco, atual: m === margemDesejada };
    });
  }, [calculo.custoTotal, aliquotaEfetiva, margemDesejada]);

  const tt = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,.1)' };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Tags className="text-brand-600" size={22} />
          Formar Preço de Venda
        </h1>
        <p className="text-slate-500 text-sm mt-1">Descubra o preço certo considerando seus custos, impostos e lucro desejado</p>
      </div>

      {/* Mode selector */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'normal', label: '🏷️ Preço por Unidade', desc: 'Produto ou serviço por projeto' },
          { id: 'hora', label: '⏰ Preço por Hora', desc: 'Serviços cobrados por hora' },
          { id: 'reverso', label: '🔄 Preço Reverso', desc: 'Mercado cobra X, qual minha margem?' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setModo(m.id)}
            className={`flex-1 min-w-[200px] p-3 rounded-xl border-2 transition-all text-left ${
              modo === m.id
                ? 'border-brand-500 bg-brand-50 shadow-md'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <p className="font-semibold text-sm text-slate-800">{m.label}</p>
            <p className="text-xs text-slate-500">{m.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters */}
        <Card>
          <CardHeader>
            <h2 className="text-slate-800 font-medium text-sm">
              {modo === 'hora' ? '⏰ Dados do Serviço por Hora' : modo === 'reverso' ? '🔄 Preço do Mercado' : '📦 Dados do Produto/Serviço'}
            </h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {custosImportados && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-md">
                <p className="text-xs text-emerald-700">✅ Dados importados de "Meus Gastos"</p>
              </div>
            )}

            {modo === 'hora' ? (
              <>
                <InputField label="💰 Custo por hora do serviço" value={custoHora} onChange={setCustoHora} prefix="R$" step={10}
                  help="Inclua: tempo + materiais + deslocamento" />
                <InputField label="⏱️ Horas por serviço" value={horasPorServico} onChange={setHorasPorServico} step={0.5} min={0.5}
                  help="Quantas horas leva 1 serviço" />
                <InputField label="📅 Serviços por mês" value={servicosMensal} onChange={setServicosMensal} step={5} min={1} />
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    Custo por serviço: <span className="font-bold">{formatCurrency(custoHora * horasPorServico)}</span>
                    ({horasPorServico}h × {formatCurrency(custoHora)})
                  </p>
                </div>
              </>
            ) : modo === 'reverso' ? (
              <>
                <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg">
                  <p className="text-sm text-violet-700 font-medium">💡 Quanto o mercado cobra por esse serviço/produto?</p>
                  <p className="text-xs text-violet-500 mt-1">Vamos calcular se vale a pena pra você nesse preço</p>
                </div>
                <InputField label="Preço do mercado" value={precoMercado} onChange={setPrecoMercado} prefix="R$" step={10} />
                <SelectField label="Tipo" value={tipo} onChange={setTipo} options={[
                  { value: 'servico', label: 'Serviço' },
                  { value: 'produto', label: 'Produto' },
                ]} />
                <InputField label="Custo unitário do produto" value={custoProduto} onChange={setCustoProduto} prefix="R$" step={10} />
              </>
            ) : (
              <>
                <SelectField label="Tipo" value={tipo} onChange={setTipo} options={[
                  { value: 'servico', label: 'Serviço' },
                  { value: 'produto', label: 'Produto / Mercadoria' },
                ]} />
                <InputField
                  label={tipo === 'produto' ? '💰 Custo do produto (unitário)' : '💰 Custo do serviço (unitário)'}
                  value={custoProduto} onChange={setCustoProduto} prefix="R$" step={10}
                  help="Material + mão de obra direta"
                />
              </>
            )}

            <InputField label="🏠 Gastos fixos mensais" value={despesasFixas} onChange={setDespesasFixas} prefix="R$" step={500}
              help="Aluguel, salários, contador, internet, etc." />
            <InputField label="📊 Gastos variáveis (% do custo)" value={despesasVariaveisPercent} onChange={setDespesasVariaveisPercent} suffix="%" step={1}
              help="Comissões, frete, embalagem" />
            {modo !== 'hora' && (
              <InputField label="📈 Quantidade mensal estimada" value={quantidadeMensal} onChange={setQuantidadeMensal} step={10} min={1} />
            )}
            {modo !== 'reverso' && (
              <InputField label="🎯 Margem de lucro desejada" value={margemDesejada} onChange={setMargemDesejada} suffix="%" min={1} max={80} step={1} />
            )}

            <div className="border-t border-slate-200 pt-3 mt-3">
              <p className="text-xs font-bold text-slate-500 mb-2">🏢 Tipo da empresa (impostos)</p>
              <SelectField label="Regime" value={regime} onChange={setRegime} options={[
                { value: 'mei', label: 'MEI' },
                { value: 'simples', label: 'Simples Nacional' },
                { value: 'presumido', label: 'Lucro Presumido' },
                { value: 'real', label: 'Lucro Real' },
              ]} />
              {regime === 'simples' && (
                <>
                  <SelectField label="Anexo" value={anexo} onChange={setAnexo} className="mt-3" options={[
                    { value: 'I', label: 'Anexo I - Comércio' }, { value: 'II', label: 'Anexo II - Indústria' },
                    { value: 'III', label: 'Anexo III - Serviços' }, { value: 'IV', label: 'Anexo IV - Construção' }, { value: 'V', label: 'Anexo V - TI/Eng' },
                  ]} />
                  <div className="mt-3">
                    <div className="flex items-center gap-1 mb-1">
                      <label className="text-xs font-medium text-slate-600">RBT12 (Faturamento últimos 12 meses)</label>
                      <InfoTip text="RBT12 = Receita Bruta Total dos últimos 12 meses. É o que define a faixa de imposto no Simples Nacional." />
                    </div>
                    <InputField value={rbt12} onChange={setRbt12} prefix="R$" step={10000}
                      help={`Alíquota efetiva: ${formatPercent(aliquotaEfetiva)}`} />
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-1 mb-1">
                      <label className="text-xs font-medium text-slate-600">Folha de pagamento mensal</label>
                      <InfoTip text="Soma dos salários + encargos (INSS, FGTS) de todos os funcionários. Usado para calcular o Fator R." />
                    </div>
                    <InputField value={folhaMensal} onChange={setFolhaMensal} prefix="R$" step={1000} />
                  </div>
                </>
              )}
              {regime !== 'simples' && (
                <InputField label="Faturamento mensal" value={receitaMensal} onChange={setReceitaMensal} prefix="R$" step={5000} className="mt-3"
                  help={`Imposto efetivo: ${formatPercent(aliquotaEfetiva)}`} />
              )}
              {(regime === 'presumido' || regime === 'real') && (
                <>
                  <SelectField label="Atividade" value={tipoAtividade} onChange={setTipoAtividade} className="mt-3" options={[
                    { value: 'servicos', label: 'Serviços' }, { value: 'comercio', label: 'Comércio' }, { value: 'industria', label: 'Indústria' },
                  ]} />
                  <InputField label="ISS do município (%)" value={issAliquota} onChange={setIssAliquota} suffix="%" min={2} max={5} step={0.5} className="mt-3" />
                </>
              )}
            </div>

            {/* Fator R display with tooltip */}
            {regime === 'simples' && (
              <div className="mt-3 p-3 bg-slate-50 rounded-md space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    Fator R (% da folha sobre faturamento)
                    <InfoTip text="Fator R = Folha de Pagamento ÷ Faturamento 12 meses. Se ≥ 28%, empresas do Anexo V migram para o Anexo III (imposto menor)." />
                  </span>
                  <span className={`text-xs font-medium ${folhaPercent >= 0.28 ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {(folhaPercent * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Anexo efetivo</span>
                  <span className="text-xs font-medium text-slate-700">Anexo {anexoEfetivo}</span>
                </div>
                {migrouAnexo && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Sparkles size={12} className="text-emerald-600 flex-shrink-0" />
                    <p className="text-xs text-emerald-600">Boa! Fator R ≥ 28% — migrou pro Anexo III com imposto menor! 🎉</p>
                  </div>
                )}
              </div>
            )}

            {/* CPP warning with tooltip */}
            {regime === 'simples' && anexoEfetivo === 'IV' && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-700 font-medium flex items-center gap-1">
                    CPP (Contribuição Patronal Previdenciária) — paga separado no Anexo IV
                    <InfoTip text="CPP = INSS que a empresa paga (20% da folha). No Anexo IV do Simples, essa contribuição NÃO está incluída no DAS e precisa ser paga à parte via GPS." />
                  </p>
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  Custo extra: <span className="font-medium">{formatCurrency(cppAnexoIV)}/mês</span> (20% da folha)
                </p>
              </div>
            )}

            {sublimite && sublimite.mensagem && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />
                  <p className="text-xs text-red-700 font-medium">{sublimite.mensagem}</p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* REVERSE MODE RESULTS */}
          {modo === 'reverso' && calculo.reverso && (
            <>
              <div className={`rounded-2xl p-6 border-2 shadow-lg ${
                calculo.reverso.temLucro
                  ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300'
                  : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-300'
              }`}>
                <p className="text-sm font-bold uppercase tracking-wide mb-2">
                  {calculo.reverso.temLucro ? '✅ O mercado cobra o suficiente!' : '❌ Nesse preço, você teria PREJUÍZO!'}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs opacity-70">Preço do mercado</p>
                    <p className="text-2xl font-bold">{formatCurrency(calculo.reverso.precoMercado)}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Margem real do produto</p>
                    <p className={`text-3xl font-black ${calculo.reverso.margemReal >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {calculo.reverso.margemReal.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Lucro por venda</p>
                    <p className={`text-xl font-bold ${calculo.reverso.lucroUnitario >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {formatCurrency(calculo.reverso.lucroUnitario)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Lucro mensal</p>
                    <p className={`text-xl font-bold ${calculo.reverso.lucroMensal >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {formatCurrency(calculo.reverso.lucroMensal)}
                    </p>
                  </div>
                </div>
                {!calculo.reverso.temLucro && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                    <p className="text-sm font-bold text-red-700">
                      💡 O preço mínimo precisa ser {formatCurrency(calculo.precoMinimo)} para não ter prejuízo.
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      E para ter {margemDesejada}% de lucro, precisa cobrar {formatCurrency(calculo.precoVenda)}.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* NORMAL & HOURLY MODE RESULTS */}
          {modo !== 'reverso' && (
            <>
              {/* Main stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard icon={Tags} label="Preço de Venda" value={formatCurrency(calculo.precoVenda)} color="brand" />
                {modo === 'hora' && (
                  <StatCard icon={Clock} label="Preço por Hora" value={formatCurrency(calculo.precoHora)} color="blue" />
                )}
                {modo !== 'hora' && (
                  <StatCard icon={TrendingUp} label="Markup" value={`${calculo.markup.toFixed(1)}%`} color="blue" />
                )}
                <StatCard icon={DollarSign} label="Lucro Mensal" value={formatCurrency(calculo.lucroMensal)} color="green" />
                <StatCard icon={Calculator} label="Vendas pra empatar" value={`${calculo.pontoEquilibrioQtd} un.`} subvalue={formatCurrency(calculo.pontoEquilibrioReceita)} color="amber" />
              </div>

              {/* QUANTO SOBRA NO BOLSO */}
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">💰</span>
                  <span className="text-sm font-bold text-emerald-800 uppercase tracking-wide">Lucro líquido mensal</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-emerald-600">Por venda</p>
                    <p className={`text-2xl font-bold ${calculo.lucroUnitario >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatCurrency(calculo.lucroUnitario)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600">Por mês</p>
                    <p className={`text-2xl font-bold ${calculo.lucroMensal >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatCurrency(calculo.lucroMensal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600">Por ano</p>
                    <p className={`text-2xl font-bold ${calculo.lucroAnual >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatCurrency(calculo.lucroAnual)}</p>
                  </div>
                </div>
                {calculo.lucroAnual > 0 && (
                  <div className="mt-3 text-center">
                    <p className="text-sm text-emerald-600">
                      🎉 São <span className="font-bold text-emerald-700">{formatCurrency(calculo.lucroAnual)}</span> de lucro líquido anual!
                    </p>
                  </div>
                )}
              </div>

              {/* PREÇO MÍNIMO - Below = LOSS */}
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-red-500" size={24} />
                  <div>
                    <p className="text-sm font-bold text-red-700">⚠️ ABAIXO DISSO = PREJUÍZO</p>
                    <p className="text-xs text-red-500">Preço mínimo (margem zero, só cobre custos + impostos)</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(calculo.precoMinimo)}</p>
              </div>
            </>
          )}

          {/* Price comparison across regimes */}
          {calculo.comparativoPrecos.length > 1 && (
            <Card>
              <CardHeader>
                <h2 className="text-slate-800 font-medium text-sm">📊 Preço em cada tipo de empresa</h2>
                <p className="text-xs text-slate-400">Mesmo produto, mesmo lucro, imposto diferente</p>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {calculo.comparativoPrecos.map((c, i) => (
                    <div key={c.regime} className={`flex items-center justify-between p-3 rounded-lg ${
                      c.isAtual ? 'bg-brand-50 border border-brand-200' : 'bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        {i === 0 && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Melhor</span>}
                        <span className="text-sm font-medium text-slate-700">{c.regime}</span>
                        {c.isAtual && <span className="text-xs text-brand-600 font-medium">(você)</span>}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800">{formatCurrency(c.preco)}</span>
                        <span className="text-xs text-slate-400 ml-2">({(c.aliquota * 100).toFixed(1)}% imposto)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Price composition */}
          <Card>
            <CardHeader><h2 className="text-slate-800 font-medium text-sm">🧮 Como o preço é formado</h2></CardHeader>
            <CardBody>
              <div className="space-y-2">
                <PriceRow label="Custo direto" value={calculo.custoUnitario} total={calculo.precoVenda} color="bg-red-500" />
                <PriceRow label="Gastos variáveis" value={calculo.despVariavelUnitario} total={calculo.precoVenda} color="bg-amber-500" />
                <PriceRow label="Rateio dos fixos" value={calculo.custoFixoUnitario} total={calculo.precoVenda} color="bg-orange-500" />
                <PriceRow label="Impostos" value={calculo.impostoUnitario} total={calculo.precoVenda} color="bg-violet-500" />
                {cppAnexoIV > 0 && (
                  <PriceRow label="INSS patronal (Anexo IV)" value={calculo.cppUnitario} total={calculo.precoVenda} color="bg-rose-500" />
                )}
                <PriceRow label="💰 Lucro do produto" value={calculo.lucroUnitario} total={calculo.precoVenda} color="bg-emerald-500" />
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="text-sm font-bold text-slate-800">= Preço de Venda</span>
                  <span className="text-sm font-bold text-brand-600 font-mono">{formatCurrency(calculo.precoVenda)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-md">
                <p className="text-xs text-slate-500">
                  <span className="text-slate-700 font-medium">Fórmula:</span> Preço = Custo Total ÷ (1 - Imposto% - Lucro%)
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatCurrency(calculo.custoTotal)} ÷ (1 - {(aliquotaEfetiva * 100).toFixed(2)}% - {margemDesejada}%) = {formatCurrency(calculo.precoVenda)}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Monthly projection */}
          <Card>
            <CardHeader>
              <h2 className="text-slate-800 font-medium text-sm">
                📅 Projeção Mensal ({calculo.qtdEfetiva} {modo === 'hora' ? 'serviços' : 'unidades'})
              </h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">Faturamento</p>
                  <p className="text-slate-800 font-medium">{formatCurrency(calculo.receitaMensal)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Custos totais</p>
                  <p className="text-slate-800 font-medium">{formatCurrency(calculo.custoTotal * calculo.qtdEfetiva)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Impostos</p>
                  <p className="text-red-600 font-medium">{formatCurrency(calculo.impostosMensal)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">💰 Lucro líquido</p>
                  <p className={`font-bold ${calculo.lucroMensal > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(calculo.lucroMensal)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Margem real</p>
                  <p className="text-brand-600 font-bold">{calculo.margemReal.toFixed(1)}%</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Sensitivity chart */}
          <Card>
            <CardHeader><h2 className="text-slate-800 font-medium text-sm">📈 E se eu quiser mais lucro?</h2></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="margem" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `R$${v.toFixed(0)}`} />
                  <Tooltip contentStyle={tt} formatter={(v) => [formatCurrency(v), 'Preço']} />
                  <Bar dataKey="preco" radius={[3, 3, 0, 0]} fill="#cbd5e1">
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.atual ? '#4f46e5' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PriceRow({ label, value, total, color }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-xs text-slate-500">{label}</div>
      <div className="flex-1 bg-slate-100 rounded-sm h-5 overflow-hidden">
        <div className={`h-full ${color} opacity-70 rounded-sm`} style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }} />
      </div>
      <div className="w-20 text-right text-xs text-slate-700 font-mono">{formatCurrency(value)}</div>
      <div className="w-12 text-right text-xs text-slate-400">{pct.toFixed(1)}%</div>
    </div>
  );
}
