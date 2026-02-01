import { useState, useMemo } from 'react';
import { Scale, DollarSign, TrendingUp, Target } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import {
  formatCurrency, formatPercent,
  calcSimplesTax, calcLucroPresumido, calcLucroReal, calcMEI,
} from '../data/taxData';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

export default function PontoEquilibrio() {
  const [custoFixoMensal, setCustoFixoMensal] = useState(15000);
  const [custoVariavelPercent, setCustoVariavelPercent] = useState(30);
  const [precoVendaUnitario, setPrecoVendaUnitario] = useState(200);
  const [regime, setRegime] = useState('simples');
  const [anexo, setAnexo] = useState('III');
  const [tipoAtividade, setTipoAtividade] = useState('servicos');
  const [issAliquota, setIssAliquota] = useState(5);
  const [rbt12, setRbt12] = useState(600000);
  const [receitaMensal, setReceitaMensal] = useState(50000);

  const receitaMensalEfetiva = regime === 'simples' ? rbt12 / 12 : receitaMensal;

  // Calcula alíquota efetiva
  const aliquotaEfetiva = useMemo(() => {
    switch (regime) {
      case 'mei': {
        const r = calcMEI(receitaMensalEfetiva, tipoAtividade === 'comercio' ? 'comercio' : 'servicos');
        return r && !r.excedeLimite ? r.aliquotaEfetiva : 0;
      }
      case 'simples': {
        const r = calcSimplesTax(rbt12, anexo);
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
  }, [regime, rbt12, receitaMensal, receitaMensalEfetiva, anexo, tipoAtividade, issAliquota]);

  const resultado = useMemo(() => {
    const custoVariavelUnitario = precoVendaUnitario * (custoVariavelPercent / 100);
    const impostoUnitario = precoVendaUnitario * aliquotaEfetiva;
    const margemContribuicao = precoVendaUnitario - custoVariavelUnitario - impostoUnitario;
    const margemContribuicaoPercent = precoVendaUnitario > 0 ? (margemContribuicao / precoVendaUnitario) * 100 : 0;

    const peQuantidade = margemContribuicao > 0 ? Math.ceil(custoFixoMensal / margemContribuicao) : 0;
    const peReceita = peQuantidade * precoVendaUnitario;

    const quantidadeEstimada = receitaMensalEfetiva > 0 ? Math.floor(receitaMensalEfetiva / precoVendaUnitario) : 0;
    const margemSeguranca = quantidadeEstimada > 0 && peQuantidade > 0
      ? ((quantidadeEstimada - peQuantidade) / quantidadeEstimada) * 100 : 0;

    const maxQtd = Math.max(peQuantidade * 2, quantidadeEstimada * 1.5, 100);
    const chartData = [];
    for (let q = 0; q <= maxQtd; q += Math.max(1, Math.floor(maxQtd / 20))) {
      const receita = q * precoVendaUnitario;
      const custoTotal = custoFixoMensal + (q * custoVariavelUnitario) + (q * impostoUnitario);
      chartData.push({ quantidade: q, receita, custoTotal, lucro: receita - custoTotal });
    }

    return {
      custoVariavelUnitario, impostoUnitario, margemContribuicao, margemContribuicaoPercent,
      peQuantidade, peReceita, margemSeguranca, quantidadeEstimada, chartData,
    };
  }, [custoFixoMensal, custoVariavelPercent, precoVendaUnitario, aliquotaEfetiva, receitaMensalEfetiva]);

  const tt = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,.1)' };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Scale className="text-brand-600" size={22} />
          Ponto de Equilíbrio
        </h1>
        <p className="text-slate-500 text-sm mt-1">Determine a receita mínima para cobrir custos e começar a lucrar</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parâmetros */}
        <Card>
          <CardHeader><h2 className="text-slate-800 font-medium text-sm">Parâmetros</h2></CardHeader>
          <CardBody className="space-y-3">
            <InputField label="Custo Fixo Mensal" value={custoFixoMensal} onChange={setCustoFixoMensal} prefix="R$" step={1000} />
            <InputField label="Custo Variável (% do preço)" value={custoVariavelPercent} onChange={setCustoVariavelPercent} suffix="%" step={5} help="CMV, comissões, frete" />
            <InputField label="Preço de Venda Unitário" value={precoVendaUnitario} onChange={setPrecoVendaUnitario} prefix="R$" step={10} />

            <div className="border-t border-slate-200 pt-3">
              <p className="text-xs font-medium text-slate-500 mb-2">Regime Tributário</p>
              <SelectField value={regime} onChange={setRegime} options={[
                { value: 'mei', label: 'MEI' }, { value: 'simples', label: 'Simples Nacional' },
                { value: 'presumido', label: 'Lucro Presumido' }, { value: 'real', label: 'Lucro Real' },
              ]} />
              {regime === 'simples' && (
                <>
                  <SelectField label="Anexo" value={anexo} onChange={setAnexo} className="mt-3" options={[
                    { value: 'I', label: 'Anexo I' }, { value: 'II', label: 'Anexo II' },
                    { value: 'III', label: 'Anexo III' }, { value: 'IV', label: 'Anexo IV' }, { value: 'V', label: 'Anexo V' },
                  ]} />
                  <InputField label="Receita Bruta 12 Meses (RBT12)" value={rbt12} onChange={setRbt12} prefix="R$" step={10000} className="mt-3" />
                </>
              )}
              {regime !== 'simples' && (
                <InputField label="Receita Mensal Estimada" value={receitaMensal} onChange={setReceitaMensal} prefix="R$" step={5000} className="mt-3" />
              )}
              {(regime === 'presumido' || regime === 'real') && (
                <>
                  <SelectField label="Atividade" value={tipoAtividade} onChange={setTipoAtividade} className="mt-3" options={[
                    { value: 'servicos', label: 'Serviços' }, { value: 'comercio', label: 'Comércio' }, { value: 'industria', label: 'Indústria' },
                  ]} />
                  <InputField label="ISS (%)" value={issAliquota} onChange={setIssAliquota} suffix="%" min={2} max={5} className="mt-3" />
                </>
              )}
              <div className="mt-3 p-2 bg-slate-50 rounded-md">
                <p className="text-xs text-slate-500">Alíquota Efetiva: <span className="text-brand-600 font-medium">{formatPercent(aliquotaEfetiva)}</span></p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Resultados */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Scale} label="PE em Quantidade" value={`${resultado.peQuantidade} un.`} color="brand" />
            <StatCard icon={DollarSign} label="PE em Receita" value={formatCurrency(resultado.peReceita)} color="blue" />
            <StatCard icon={TrendingUp} label="Margem Contribuição" value={`${resultado.margemContribuicaoPercent.toFixed(1)}%`} subvalue={formatCurrency(resultado.margemContribuicao) + '/un.'} color="green" />
            <StatCard icon={Target} label="Margem Segurança" value={`${resultado.margemSeguranca.toFixed(1)}%`} color={resultado.margemSeguranca > 20 ? 'green' : resultado.margemSeguranca > 0 ? 'amber' : 'red'} />
          </div>

          {/* Detalhamento */}
          <Card>
            <CardHeader><h2 className="text-slate-800 font-medium text-sm">Detalhamento por Unidade</h2></CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">Preço de Venda</p>
                  <p className="text-slate-800 font-medium">{formatCurrency(precoVendaUnitario)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">(-) Custo Variável</p>
                  <p className="text-red-600 font-medium">{formatCurrency(resultado.custoVariavelUnitario)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">(-) Impostos</p>
                  <p className="text-red-600 font-medium">{formatCurrency(resultado.impostoUnitario)}</p>
                </div>
                <div className="col-span-2 md:col-span-3 border-t border-slate-200 pt-2">
                  <p className="text-slate-400 text-xs">= Margem de Contribuição</p>
                  <p className="text-emerald-600 font-semibold text-lg">{formatCurrency(resultado.margemContribuicao)}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Ponto de equilíbrio = {formatCurrency(custoFixoMensal)} / {formatCurrency(resultado.margemContribuicao)} = <span className="text-brand-600 font-medium">{resultado.peQuantidade} unidades</span>
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Gráfico */}
          <Card>
            <CardHeader>
              <h2 className="text-slate-800 font-medium text-sm">Receita vs Custos</h2>
              <p className="text-slate-400 text-xs mt-0.5">O ponto onde as linhas se cruzam é o ponto de equilíbrio</p>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={resultado.chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="quantidade" tick={{ fill: '#64748b', fontSize: 11 }} label={{ value: 'Quantidade', position: 'bottom', fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={tt}
                    formatter={(v, name) => [formatCurrency(v), name === 'receita' ? 'Receita' : name === 'custoTotal' ? 'Custo Total' : 'Lucro']}
                    labelFormatter={(v) => `${v} unidades`}
                  />
                  <ReferenceLine x={resultado.peQuantidade} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'PE', fill: '#f59e0b', fontSize: 11 }} />
                  <Area type="monotone" dataKey="receita" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.08} strokeWidth={2} name="Receita" />
                  <Area type="monotone" dataKey="custoTotal" stroke="#ef4444" fill="#ef4444" fillOpacity={0.08} strokeWidth={2} name="Custo Total" />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
