import { useState, useMemo, useEffect } from 'react';
import { Tags, DollarSign, TrendingUp, Calculator, AlertTriangle, Info } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import {
  formatCurrency, formatPercent,
  calcSimplesTax, calcLucroPresumido, calcLucroReal, calcMEI,
} from '../data/taxData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

// Fallback helper functions for CPP, Fator R, sublimite
const _calcCPP = (folha) => folha * 0.20;
const _calcFatorR = (folha12, rbt12) => rbt12 > 0 ? folha12 / rbt12 : 0;
const _getAnexoFR = (fr, anexo) => (anexo === 'V' && fr >= 0.28) ? 'III' : anexo;
const _checkSublimite = (rbt12) => ({
  dentroSimples: rbt12 <= 4800000,
  dentroSublimite: rbt12 <= 3600000,
  mensagem: rbt12 > 4800000 ? 'Excede limite Simples (R$ 4.8M)' : rbt12 > 3600000 ? 'Excede sublimite (R$ 3.6M). ISS/ICMS separados.' : null,
});

const LS_KEY = 'precificalc_precificacao';

export default function Precificacao() {
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

  // Importar dados de CustosOperacionais via localStorage
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
    } catch { /* ignore */ }
  }, []);

  // localStorage persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const data = JSON.parse(saved);
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
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        tipo, custoProduto, despesasFixas, despesasVariaveisPercent, margemDesejada,
        regime, anexo, tipoAtividade, issAliquota, rbt12, receitaMensal, quantidadeMensal,
        folhaMensal, adicoesLalur, exclusoesLalur,
      }));
    } catch { /* ignore */ }
  }, [tipo, custoProduto, despesasFixas, despesasVariaveisPercent, margemDesejada,
    regime, anexo, tipoAtividade, issAliquota, rbt12, receitaMensal, quantidadeMensal,
    folhaMensal, adicoesLalur, exclusoesLalur]);

  // Fator R e Anexo Efetivo
  const fatorR = regime === 'simples' ? _calcFatorR(folhaMensal * 12, rbt12) : 0;
  const anexoEfetivo = regime === 'simples' ? _getAnexoFR(fatorR, anexo) : anexo;
  const migrouAnexo = regime === 'simples' && anexo === 'V' && anexoEfetivo === 'III';

  // CPP para Anexo IV
  const cppAnexoIV = (regime === 'simples' && anexoEfetivo === 'IV') ? _calcCPP(folhaMensal) : 0;

  // Sublimite check
  const sublimite = regime === 'simples' ? _checkSublimite(rbt12) : null;

  const receitaMensalEfetiva = regime === 'simples' ? rbt12 / 12 : receitaMensal;

  // Calcula aliquota efetiva com base no regime e receita
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

  // Calculo do preco de venda
  const calculo = useMemo(() => {
    const custoUnitario = custoProduto;
    const despVariavelUnitario = custoProduto * (despesasVariaveisPercent / 100);
    const custoFixoUnitario = quantidadeMensal > 0 ? despesasFixas / quantidadeMensal : 0;
    const custoTotal = custoUnitario + despVariavelUnitario + custoFixoUnitario;

    const denominador = 1 - aliquotaEfetiva - (margemDesejada / 100);
    const precoVenda = denominador > 0 ? custoTotal / denominador : custoTotal * 2;

    const impostoUnitario = precoVenda * aliquotaEfetiva;
    const cppUnitario = quantidadeMensal > 0 ? cppAnexoIV / quantidadeMensal : 0;
    const impostoTotalUnitario = impostoUnitario + cppUnitario;
    const lucroUnitario = precoVenda - custoTotal - impostoTotalUnitario;
    const margemReal = precoVenda > 0 ? (lucroUnitario / precoVenda) * 100 : 0;
    const markup = custoUnitario > 0 ? ((precoVenda - custoUnitario) / custoUnitario) * 100 : 0;

    const recMensal = precoVenda * quantidadeMensal;
    const lucroMensal = lucroUnitario * quantidadeMensal;
    const impostosMensal = impostoTotalUnitario * quantidadeMensal;

    const margemContribuicao = precoVenda - custoUnitario - despVariavelUnitario - impostoTotalUnitario;
    const pontoEquilibrioQtd = margemContribuicao > 0 ? Math.ceil(despesasFixas / margemContribuicao) : 0;
    const pontoEquilibrioReceita = pontoEquilibrioQtd * precoVenda;

    return {
      custoUnitario, despVariavelUnitario, custoFixoUnitario, custoTotal,
      precoVenda, impostoUnitario, impostoTotalUnitario, cppUnitario, lucroUnitario, margemReal, markup,
      receitaMensal: recMensal, lucroMensal, impostosMensal,
      pontoEquilibrioQtd, pontoEquilibrioReceita, margemContribuicao,
    };
  }, [custoProduto, despesasFixas, despesasVariaveisPercent, margemDesejada, aliquotaEfetiva, quantidadeMensal, cppAnexoIV]);

  // Dados para grafico de sensibilidade
  const chartData = useMemo(() => {
    return [10, 15, 20, 25, 30, 35, 40, 50].map(m => {
      const den = 1 - aliquotaEfetiva - (m / 100);
      const custoTotal = custoProduto + custoProduto * (despesasVariaveisPercent / 100) + (quantidadeMensal > 0 ? despesasFixas / quantidadeMensal : 0);
      const preco = den > 0 ? custoTotal / den : custoTotal * 2;
      return { margem: `${m}%`, preco, atual: m === margemDesejada };
    });
  }, [custoProduto, despesasFixas, despesasVariaveisPercent, aliquotaEfetiva, quantidadeMensal, margemDesejada]);

  const tt = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,.1)' };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Tags className="text-brand-600" size={22} />
          Precificacao
        </h1>
        <p className="text-slate-500 text-sm mt-1">Calcule o preco de venda considerando custos, impostos e margem desejada</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parametros */}
        <Card>
          <CardHeader><h2 className="text-slate-800 font-medium text-sm">Parametros do Produto/Servico</h2></CardHeader>
          <CardBody className="space-y-3">
            {custosImportados && (
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-md">
                <p className="text-xs text-emerald-700">Dados importados de Custos Operacionais</p>
              </div>
            )}
            <SelectField label="Tipo" value={tipo} onChange={setTipo} options={[
              { value: 'servico', label: 'Servico' },
              { value: 'produto', label: 'Produto / Mercadoria' },
            ]} />
            <InputField label={tipo === 'produto' ? 'Custo do Produto (unitario)' : 'Custo do Servico (unitario)'} value={custoProduto} onChange={setCustoProduto} prefix="R$" step={10} />
            <InputField label="Despesas Fixas Mensais" value={despesasFixas} onChange={setDespesasFixas} prefix="R$" step={500} help="Aluguel, salarios, etc." />
            <InputField label="Despesas Variaveis (% do custo)" value={despesasVariaveisPercent} onChange={setDespesasVariaveisPercent} suffix="%" step={1} help="Comissoes, frete, etc." />
            <InputField label="Quantidade Mensal Estimada" value={quantidadeMensal} onChange={setQuantidadeMensal} step={10} min={1} />
            <InputField label="Margem de Lucro Desejada" value={margemDesejada} onChange={setMargemDesejada} suffix="%" min={1} max={80} step={1} />

            <div className="border-t border-slate-200 pt-3 mt-3">
              <p className="text-xs font-medium text-slate-500 mb-2">Regime Tributario</p>
              <SelectField label="Regime" value={regime} onChange={setRegime} options={[
                { value: 'mei', label: 'MEI' },
                { value: 'simples', label: 'Simples Nacional' },
                { value: 'presumido', label: 'Lucro Presumido' },
                { value: 'real', label: 'Lucro Real' },
              ]} />
              {regime === 'simples' && (
                <>
                  <SelectField label="Anexo" value={anexo} onChange={setAnexo} className="mt-3" options={[
                    { value: 'I', label: 'Anexo I' }, { value: 'II', label: 'Anexo II' },
                    { value: 'III', label: 'Anexo III' }, { value: 'IV', label: 'Anexo IV' }, { value: 'V', label: 'Anexo V' },
                  ]} />
                  <InputField label="Receita Bruta 12 Meses (RBT12)" value={rbt12} onChange={setRbt12} prefix="R$" step={10000} className="mt-3" help={`Aliquota efetiva: ${formatPercent(aliquotaEfetiva)}`} />
                  <InputField label="Folha de Pagamento Mensal" value={folhaMensal} onChange={setFolhaMensal} prefix="R$" step={1000} className="mt-3" />
                </>
              )}
              {regime !== 'simples' && (
                <InputField label="Receita Mensal Estimada" value={receitaMensal} onChange={setReceitaMensal} prefix="R$" step={5000} className="mt-3" help={`Aliquota efetiva: ${formatPercent(aliquotaEfetiva)}`} />
              )}
              {(regime === 'presumido' || regime === 'real') && (
                <>
                  <SelectField label="Atividade" value={tipoAtividade} onChange={setTipoAtividade} className="mt-3" options={[
                    { value: 'servicos', label: 'Servicos' }, { value: 'comercio', label: 'Comercio' }, { value: 'industria', label: 'Industria' },
                  ]} />
                  <InputField label="Aliquota ISS (%)" value={issAliquota} onChange={setIssAliquota} suffix="%" min={2} max={5} step={0.5} className="mt-3" />
                </>
              )}
              {regime === 'real' && (
                <>
                  <InputField label="Adicoes LALUR" value={adicoesLalur} onChange={setAdicoesLalur} prefix="R$" className="mt-3" help="Despesas nao dedutiveis, multas" />
                  <InputField label="Exclusoes LALUR" value={exclusoesLalur} onChange={setExclusoesLalur} prefix="R$" className="mt-3" help="Receitas nao tributaveis, incentivos" />
                </>
              )}
            </div>

            {/* Fator R display */}
            {regime === 'simples' && (
              <div className="mt-3 p-3 bg-slate-50 rounded-md space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Fator R</span>
                  <span className={`text-xs font-medium ${fatorR >= 0.28 ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {(fatorR * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Anexo Efetivo</span>
                  <span className="text-xs font-medium text-slate-700">Anexo {anexoEfetivo}</span>
                </div>
                {migrouAnexo && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Info size={12} className="text-emerald-600 flex-shrink-0" />
                    <p className="text-xs text-emerald-600">Fator R &ge; 28% - migrado do Anexo V para III (aliquota menor)</p>
                  </div>
                )}
              </div>
            )}

            {/* CPP Anexo IV warning */}
            {regime === 'simples' && anexoEfetivo === 'IV' && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">Anexo IV - CPP nao inclusa no DAS</p>
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  CPP separada (20% da folha): <span className="font-medium">{formatCurrency(cppAnexoIV)}/mes</span>
                </p>
              </div>
            )}

            {/* Sublimite warning */}
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

        {/* Resultado */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Tags} label="Preco de Venda" value={formatCurrency(calculo.precoVenda)} color="brand" />
            <StatCard icon={TrendingUp} label="Markup" value={`${calculo.markup.toFixed(1)}%`} color="blue" />
            <StatCard icon={DollarSign} label="Lucro Mensal" value={formatCurrency(calculo.lucroMensal)} color="green" />
            <StatCard icon={Calculator} label="Ponto de Equilibrio" value={`${calculo.pontoEquilibrioQtd} un.`} subvalue={formatCurrency(calculo.pontoEquilibrioReceita)} color="amber" />
          </div>

          {/* Composicao do preco */}
          <Card>
            <CardHeader><h2 className="text-slate-800 font-medium text-sm">Composicao do Preco de Venda</h2></CardHeader>
            <CardBody>
              <div className="space-y-2">
                <PriceRow label="Custo unitario" value={calculo.custoUnitario} total={calculo.precoVenda} color="bg-red-500" />
                <PriceRow label="Despesas variaveis" value={calculo.despVariavelUnitario} total={calculo.precoVenda} color="bg-amber-500" />
                <PriceRow label="Rateio despesas fixas" value={calculo.custoFixoUnitario} total={calculo.precoVenda} color="bg-orange-500" />
                <PriceRow label="Impostos" value={calculo.impostoUnitario} total={calculo.precoVenda} color="bg-violet-500" />
                {cppAnexoIV > 0 && (
                  <PriceRow label="CPP Anexo IV" value={calculo.cppUnitario} total={calculo.precoVenda} color="bg-rose-500" />
                )}
                <PriceRow label="Lucro" value={calculo.lucroUnitario} total={calculo.precoVenda} color="bg-emerald-500" />
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="text-sm font-medium text-slate-800">Preco de Venda</span>
                  <span className="text-sm font-semibold text-brand-600 font-mono">{formatCurrency(calculo.precoVenda)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-md">
                <p className="text-xs text-slate-500">
                  <span className="text-slate-700 font-medium">Formula:</span> Preco = Custo Total / (1 - Aliquota Efetiva - Margem Desejada)
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatCurrency(calculo.custoTotal)} / (1 - {(aliquotaEfetiva * 100).toFixed(2)}% - {margemDesejada}%) = {formatCurrency(calculo.precoVenda)}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Projecao mensal */}
          <Card>
            <CardHeader><h2 className="text-slate-800 font-medium text-sm">Projecao Mensal ({quantidadeMensal} unidades)</h2></CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">Receita</p>
                  <p className="text-slate-800 font-medium">{formatCurrency(calculo.receitaMensal)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Custos Totais</p>
                  <p className="text-slate-800 font-medium">{formatCurrency(calculo.custoTotal * quantidadeMensal)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Impostos</p>
                  <p className="text-slate-800 font-medium">{formatCurrency(calculo.impostosMensal)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Lucro Liquido</p>
                  <p className={`font-medium ${calculo.lucroMensal > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(calculo.lucroMensal)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Margem Real</p>
                  <p className="text-brand-600 font-medium">{calculo.margemReal.toFixed(1)}%</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Sensibilidade */}
          <Card>
            <CardHeader><h2 className="text-slate-800 font-medium text-sm">Sensibilidade: Preco x Margem</h2></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="margem" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `R$${v.toFixed(0)}`} />
                  <Tooltip contentStyle={tt} formatter={(v) => [formatCurrency(v), 'Preco']} />
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
      <div className="w-28 text-xs text-slate-500">{label}</div>
      <div className="flex-1 bg-slate-100 rounded-sm h-5 overflow-hidden">
        <div className={`h-full ${color} opacity-70 rounded-sm`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <div className="w-20 text-right text-xs text-slate-700 font-mono">{formatCurrency(value)}</div>
      <div className="w-12 text-right text-xs text-slate-400">{pct.toFixed(1)}%</div>
    </div>
  );
}
