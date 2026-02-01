import { useState, useMemo } from 'react';
import { Tags, DollarSign, TrendingUp, Calculator } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import {
  formatCurrency, formatPercent,
  calcSimplesTax, calcLucroPresumido, calcLucroReal, calcMEI,
} from '../data/taxData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function Precificacao() {
  const [tipo, setTipo] = useState('servico'); // servico ou produto
  const [custoProduto, setCustoProduto] = useState(100);
  const [despesasFixas, setDespesasFixas] = useState(5000);
  const [despesasVariaveisPercent, setDespesasVariaveisPercent] = useState(10);
  const [margemDesejada, setMargemDesejada] = useState(30);
  const [regime, setRegime] = useState('simples');
  const [anexo, setAnexo] = useState('III');
  const [tipoAtividade, setTipoAtividade] = useState('servicos');
  const [issAliquota, setIssAliquota] = useState(5);
  const [receitaMensalEstimada, setReceitaMensalEstimada] = useState(50000);
  const [quantidadeMensal, setQuantidadeMensal] = useState(100);

  // Calcula aliquota efetiva com base no regime e receita estimada
  const aliquotaEfetiva = useMemo(() => {
    const receitaAnual = receitaMensalEstimada * 12;
    switch (regime) {
      case 'mei': {
        const r = calcMEI(receitaMensalEstimada, tipoAtividade === 'comercio' ? 'comercio' : 'servicos');
        return r && !r.excedeLimite ? r.aliquotaEfetiva : 0;
      }
      case 'simples': {
        const r = calcSimplesTax(receitaAnual, anexo);
        return r && !r.excedeLimite ? r.aliquotaEfetiva : 0;
      }
      case 'presumido': {
        const r = calcLucroPresumido(receitaMensalEstimada, tipoAtividade, issAliquota / 100);
        return r && !r.erro ? r.aliquotaEfetiva : 0;
      }
      case 'real': {
        const r = calcLucroReal(receitaMensalEstimada, receitaMensalEstimada * 0.6, receitaMensalEstimada * 0.3, issAliquota / 100);
        return r && !r.erro ? r.aliquotaEfetiva : 0;
      }
      default: return 0;
    }
  }, [regime, receitaMensalEstimada, anexo, tipoAtividade, issAliquota]);

  // Calculo do preco de venda
  const calculo = useMemo(() => {
    const custoUnitario = custoProduto;
    const despVariavelUnitario = custoProduto * (despesasVariaveisPercent / 100);
    const custoFixoUnitario = quantidadeMensal > 0 ? despesasFixas / quantidadeMensal : 0;
    const custoTotal = custoUnitario + despVariavelUnitario + custoFixoUnitario;

    // Preco = CustoTotal / (1 - aliquota - margem)
    const denominador = 1 - aliquotaEfetiva - (margemDesejada / 100);
    const precoVenda = denominador > 0 ? custoTotal / denominador : custoTotal * 2;

    const impostoUnitario = precoVenda * aliquotaEfetiva;
    const lucroUnitario = precoVenda - custoTotal - impostoUnitario;
    const margemReal = precoVenda > 0 ? (lucroUnitario / precoVenda) * 100 : 0;
    const markup = custoUnitario > 0 ? ((precoVenda - custoUnitario) / custoUnitario) * 100 : 0;

    // Receita e lucro mensal
    const receitaMensal = precoVenda * quantidadeMensal;
    const lucroMensal = lucroUnitario * quantidadeMensal;
    const impostosMensal = impostoUnitario * quantidadeMensal;

    // Ponto de equilibrio (quantidade)
    const margemContribuicao = precoVenda - custoUnitario - despVariavelUnitario - impostoUnitario;
    const pontoEquilibrioQtd = margemContribuicao > 0 ? Math.ceil(despesasFixas / margemContribuicao) : 0;
    const pontoEquilibrioReceita = pontoEquilibrioQtd * precoVenda;

    return {
      custoUnitario, despVariavelUnitario, custoFixoUnitario, custoTotal,
      precoVenda, impostoUnitario, lucroUnitario, margemReal, markup,
      receitaMensal, lucroMensal, impostosMensal,
      pontoEquilibrioQtd, pontoEquilibrioReceita, margemContribuicao,
    };
  }, [custoProduto, despesasFixas, despesasVariaveisPercent, margemDesejada, aliquotaEfetiva, quantidadeMensal]);

  // Dados para grafico de sensibilidade de margem
  const chartData = useMemo(() => {
    return [10, 15, 20, 25, 30, 35, 40, 50].map(m => {
      const den = 1 - aliquotaEfetiva - (m / 100);
      const custoTotal = custoProduto + custoProduto * (despesasVariaveisPercent / 100) + (quantidadeMensal > 0 ? despesasFixas / quantidadeMensal : 0);
      const preco = den > 0 ? custoTotal / den : custoTotal * 2;
      return { margem: `${m}%`, preco, atual: m === margemDesejada };
    });
  }, [custoProduto, despesasFixas, despesasVariaveisPercent, aliquotaEfetiva, quantidadeMensal, margemDesejada]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-surface-700 pb-4">
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Tags className="text-brand-400" size={22} />
          Precificacao
        </h1>
        <p className="text-surface-400 text-sm mt-1">Calcule o preco de venda considerando custos, impostos e margem desejada</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parametros */}
        <Card>
          <CardHeader><h2 className="text-white font-medium text-sm">Parametros do Produto/Servico</h2></CardHeader>
          <CardBody className="space-y-3">
            <SelectField label="Tipo" value={tipo} onChange={setTipo} options={[
              { value: 'servico', label: 'Servico' },
              { value: 'produto', label: 'Produto / Mercadoria' },
            ]} />
            <InputField label={tipo === 'produto' ? 'Custo do Produto (unitario)' : 'Custo do Servico (unitario)'} value={custoProduto} onChange={setCustoProduto} prefix="R$" step={10} />
            <InputField label="Despesas Fixas Mensais" value={despesasFixas} onChange={setDespesasFixas} prefix="R$" step={500} help="Aluguel, salarios, etc." />
            <InputField label="Despesas Variaveis (% do custo)" value={despesasVariaveisPercent} onChange={setDespesasVariaveisPercent} suffix="%" step={1} help="Comissoes, frete, etc." />
            <InputField label="Quantidade Mensal Estimada" value={quantidadeMensal} onChange={setQuantidadeMensal} step={10} min={1} />
            <InputField label="Margem de Lucro Desejada" value={margemDesejada} onChange={setMargemDesejada} suffix="%" min={1} max={80} step={1} />

            <div className="border-t border-surface-700 pt-3 mt-3">
              <p className="text-xs font-medium text-surface-400 mb-2">Regime Tributario do Cliente</p>
              <SelectField label="Regime" value={regime} onChange={setRegime} options={[
                { value: 'mei', label: 'MEI' },
                { value: 'simples', label: 'Simples Nacional' },
                { value: 'presumido', label: 'Lucro Presumido' },
                { value: 'real', label: 'Lucro Real' },
              ]} />
              {regime === 'simples' && (
                <SelectField label="Anexo" value={anexo} onChange={setAnexo} options={[
                  { value: 'I', label: 'Anexo I' }, { value: 'II', label: 'Anexo II' },
                  { value: 'III', label: 'Anexo III' }, { value: 'IV', label: 'Anexo IV' }, { value: 'V', label: 'Anexo V' },
                ]} className="mt-3" />
              )}
              {(regime === 'presumido' || regime === 'real') && (
                <>
                  <SelectField label="Atividade" value={tipoAtividade} onChange={setTipoAtividade} options={[
                    { value: 'servicos', label: 'Servicos' }, { value: 'comercio', label: 'Comercio' }, { value: 'industria', label: 'Industria' },
                  ]} className="mt-3" />
                  <InputField label="ISS (%)" value={issAliquota} onChange={setIssAliquota} suffix="%" min={2} max={5} step={0.5} className="mt-3" />
                </>
              )}
              <InputField label="Receita Mensal Estimada" value={receitaMensalEstimada} onChange={setReceitaMensalEstimada} prefix="R$" step={5000} className="mt-3" help={`Aliquota efetiva: ${formatPercent(aliquotaEfetiva)}`} />
            </div>
          </CardBody>
        </Card>

        {/* Resultado */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Tags} label="Preco de Venda" value={formatCurrency(calculo.precoVenda)} color="brand" />
            <StatCard icon={TrendingUp} label="Markup" value={`${calculo.markup.toFixed(1)}%`} color="blue" />
            <StatCard icon={DollarSign} label="Lucro Mensal" value={formatCurrency(calculo.lucroMensal)} color="green" />
            <StatCard icon={Calculator} label="Ponto Equilibrio" value={`${calculo.pontoEquilibrioQtd} un.`} subvalue={formatCurrency(calculo.pontoEquilibrioReceita)} color="amber" />
          </div>

          {/* Composicao do preco */}
          <Card>
            <CardHeader><h2 className="text-white font-medium text-sm">Composicao do Preco de Venda</h2></CardHeader>
            <CardBody>
              <div className="space-y-2">
                <PriceRow label="Custo unitario" value={calculo.custoUnitario} total={calculo.precoVenda} color="bg-red-500" />
                <PriceRow label="Despesas variaveis" value={calculo.despVariavelUnitario} total={calculo.precoVenda} color="bg-amber-500" />
                <PriceRow label="Rateio despesas fixas" value={calculo.custoFixoUnitario} total={calculo.precoVenda} color="bg-orange-500" />
                <PriceRow label="Impostos" value={calculo.impostoUnitario} total={calculo.precoVenda} color="bg-violet-500" />
                <PriceRow label="Lucro" value={calculo.lucroUnitario} total={calculo.precoVenda} color="bg-emerald-500" />
                <div className="border-t border-surface-700 pt-2 flex justify-between">
                  <span className="text-sm font-medium text-white">Preco de Venda</span>
                  <span className="text-sm font-semibold text-brand-400 font-mono">{formatCurrency(calculo.precoVenda)}</span>
                </div>
              </div>

              {/* Formula */}
              <div className="mt-4 p-3 bg-surface-900 rounded-md">
                <p className="text-xs text-surface-500">
                  <span className="text-surface-300 font-medium">Formula:</span> Preco = Custo Total / (1 - Aliquota Efetiva - Margem Desejada)
                </p>
                <p className="text-xs text-surface-500 mt-1">
                  {formatCurrency(calculo.custoTotal)} / (1 - {(aliquotaEfetiva * 100).toFixed(2)}% - {margemDesejada}%) = {formatCurrency(calculo.precoVenda)}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Resumo mensal */}
          <Card>
            <CardHeader><h2 className="text-white font-medium text-sm">Projecao Mensal ({quantidadeMensal} unidades)</h2></CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-surface-500 text-xs">Receita</p>
                  <p className="text-white font-medium">{formatCurrency(calculo.receitaMensal)}</p>
                </div>
                <div>
                  <p className="text-surface-500 text-xs">Custos Totais</p>
                  <p className="text-white font-medium">{formatCurrency(calculo.custoTotal * quantidadeMensal)}</p>
                </div>
                <div>
                  <p className="text-surface-500 text-xs">Impostos</p>
                  <p className="text-white font-medium">{formatCurrency(calculo.impostosMensal)}</p>
                </div>
                <div>
                  <p className="text-surface-500 text-xs">Lucro Liquido</p>
                  <p className={`font-medium ${calculo.lucroMensal > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(calculo.lucroMensal)}</p>
                </div>
                <div>
                  <p className="text-surface-500 text-xs">Margem Real</p>
                  <p className="text-brand-400 font-medium">{calculo.margemReal.toFixed(1)}%</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Sensibilidade */}
          <Card>
            <CardHeader><h2 className="text-white font-medium text-sm">Sensibilidade: Preco x Margem</h2></CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="margem" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `R$${v.toFixed(0)}`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '6px' }} formatter={(v) => [formatCurrency(v), 'Preco']} />
                  <Bar dataKey="preco" radius={[3, 3, 0, 0]} fill="#3b82f6">
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.atual ? '#2563eb' : '#374151'} />
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
      <div className="w-24 text-xs text-surface-400">{label}</div>
      <div className="flex-1 bg-surface-900 rounded-sm h-5 overflow-hidden">
        <div className={`h-full ${color} opacity-60 rounded-sm`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <div className="w-20 text-right text-xs text-surface-300 font-mono">{formatCurrency(value)}</div>
      <div className="w-12 text-right text-xs text-surface-500">{pct.toFixed(1)}%</div>
    </div>
  );
}
