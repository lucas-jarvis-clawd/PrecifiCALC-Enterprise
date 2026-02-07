import { useMemo } from 'react';
import { Scale, DollarSign, TrendingUp, Target, AlertTriangle, Info } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import {
  formatCurrency, formatPercent,
  calcSimplesTax, calcLucroPresumido, calcLucroReal, calcMEI,
} from '../data/taxData';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

import { calcCPPAnexoIV, calcFatorR, getAnexoPorFatorR, checkSublimiteSimples } from '../data/taxHelpers';
import PageHeader from '../components/PageHeader';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function PontoEquilibrio() {
  const [state, setState] = useLocalStorage('precificalc_pontoequilibrio', {
    custoFixoMensal: 15000, custoVariavelPercent: 30, precoVendaUnitario: 200,
    regime: 'simples', anexo: 'III', tipoAtividade: 'servicos',
    issAliquota: 5, rbt12: 600000, receitaMensal: 50000, folhaMensal: 20000,
  });
  const update = (field, value) => setState(prev => ({ ...prev, [field]: value }));
  const { custoFixoMensal, custoVariavelPercent, precoVendaUnitario,
    regime, anexo, tipoAtividade, issAliquota, rbt12, receitaMensal, folhaMensal } = state;

  // Fator R e Anexo Efetivo
  const fatorR = regime === 'simples' ? calcFatorR(folhaMensal * 12, rbt12) : 0;
  const anexoEfetivo = regime === 'simples' ? getAnexoPorFatorR(fatorR, anexo) : anexo;
  const migrouAnexo = regime === 'simples' && anexo === 'V' && anexoEfetivo === 'III';

  // CPP para Anexo IV
  const cppAnexoIV = (regime === 'simples' && anexoEfetivo === 'IV') ? calcCPPAnexoIV(folhaMensal) : 0;

  // Sublimite check
  const sublimite = regime === 'simples' ? checkSublimiteSimples(rbt12) : null;

  const receitaMensalEfetiva = regime === 'simples' ? rbt12 / 12 : receitaMensal;

  // Calcula aliquota efetiva
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

  const resultado = useMemo(() => {
    const custoVariavelUnitario = precoVendaUnitario * (custoVariavelPercent / 100);
    const impostoUnitario = precoVendaUnitario * aliquotaEfetiva;
    const cppUnitario = receitaMensalEfetiva > 0 && precoVendaUnitario > 0
      ? cppAnexoIV / Math.floor(receitaMensalEfetiva / precoVendaUnitario || 1)
      : 0;
    const impostoTotalUnitario = impostoUnitario + cppUnitario;
    const margemContribuicao = precoVendaUnitario - custoVariavelUnitario - impostoTotalUnitario;
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
      const custoTotal = custoFixoMensal + (q * custoVariavelUnitario) + (q * impostoTotalUnitario);
      chartData.push({ quantidade: q, receita, custoTotal, lucro: receita - custoTotal });
    }

    return {
      custoVariavelUnitario, impostoUnitario, impostoTotalUnitario, cppUnitario,
      margemContribuicao, margemContribuicaoPercent,
      peQuantidade, peReceita, margemSeguranca, quantidadeEstimada, chartData,
    };
  }, [custoFixoMensal, custoVariavelPercent, precoVendaUnitario, aliquotaEfetiva, receitaMensalEfetiva, cppAnexoIV]);

  const tt = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,.1)' };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader icon={Scale} title="Ponto de Equilibrio" description="Determine a receita minima para cobrir custos e comecar a lucrar" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parametros */}
        <Card>
          <CardHeader><h2 className="text-slate-800 font-medium text-sm">Parametros</h2></CardHeader>
          <CardBody className="space-y-3">
            <InputField label="Custo Fixo Mensal" value={custoFixoMensal} onChange={v => update('custoFixoMensal', v)} prefix="R$" step={1000} />
            <InputField label="Custo Variavel (% do preco)" value={custoVariavelPercent} onChange={v => update('custoVariavelPercent', v)} suffix="%" step={5} help="CMV, comissoes, frete" />
            <InputField label="Preco de Venda Unitario" value={precoVendaUnitario} onChange={v => update('precoVendaUnitario', v)} prefix="R$" step={10} />

            <div className="border-t border-slate-200 pt-3">
              <p className="text-xs font-medium text-slate-500 mb-2">Regime Tributario</p>
              <SelectField value={regime} onChange={v => update('regime', v)} options={[
                { value: 'mei', label: 'MEI' }, { value: 'simples', label: 'Simples Nacional' },
                { value: 'presumido', label: 'Lucro Presumido' }, { value: 'real', label: 'Lucro Real' },
              ]} />
              {regime === 'simples' && (
                <>
                  <SelectField label="Anexo" value={anexo} onChange={v => update('anexo', v)} className="mt-3" options={[
                    { value: 'I', label: 'Anexo I' }, { value: 'II', label: 'Anexo II' },
                    { value: 'III', label: 'Anexo III' }, { value: 'IV', label: 'Anexo IV' }, { value: 'V', label: 'Anexo V' },
                  ]} />
                  <InputField label="RBT12 (Faturamento últimos 12 meses)" value={rbt12} onChange={v => update('rbt12', v)} prefix="R$" step={10000} className="mt-3" help="Receita Bruta Total dos últimos 12 meses — define a faixa do Simples" />
                  <InputField label="Folha de Pagamento Mensal" value={folhaMensal} onChange={v => update('folhaMensal', v)} prefix="R$" step={1000} className="mt-3" />
                </>
              )}
              {regime !== 'simples' && (
                <InputField label="Receita Mensal Estimada" value={receitaMensal} onChange={v => update('receitaMensal', v)} prefix="R$" step={5000} className="mt-3" />
              )}
              {(regime === 'presumido' || regime === 'real') && (
                <>
                  <SelectField label="Atividade" value={tipoAtividade} onChange={v => update('tipoAtividade', v)} className="mt-3" options={[
                    { value: 'servicos', label: 'Servicos' }, { value: 'comercio', label: 'Comercio' }, { value: 'industria', label: 'Industria' },
                  ]} />
                  <InputField label="Aliquota ISS (%)" value={issAliquota} onChange={v => update('issAliquota', v)} suffix="%" min={2} max={5} step={0.5} className="mt-3" />
                </>
              )}
              <div className="mt-3 p-2 bg-slate-50 rounded-md">
                <p className="text-xs text-slate-500">Aliquota Efetiva: <span className="text-brand-600 font-medium">{formatPercent(aliquotaEfetiva)}</span></p>
              </div>
            </div>

            {/* Fator R display */}
            {regime === 'simples' && (
              <div className="mt-3 p-3 bg-slate-50 rounded-md space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Fator R (% da folha sobre faturamento)</span>
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
                    <Sparkles size={12} className="text-emerald-600 flex-shrink-0" />
                    <p className="text-xs text-emerald-600">Fator R ≥ 28% — migrou pro Anexo III (imposto menor)</p>
                  </div>
                )}
              </div>
            )}

            {/* CPP Anexo IV warning */}
            {regime === 'simples' && anexoEfetivo === 'IV' && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">Anexo IV — CPP (INSS Patronal) paga separado do DAS</p>
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  CPP (20% sobre a folha): <span className="font-medium">{formatCurrency(cppAnexoIV)}/mês</span> — recolhimento via GPS
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

        {/* Resultados */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Scale} label="PE em Quantidade" value={`${resultado.peQuantidade} un.`} color="brand" />
            <StatCard icon={DollarSign} label="PE em Receita" value={formatCurrency(resultado.peReceita)} color="blue" />
            <StatCard icon={TrendingUp} label="Margem Contribuicao" value={`${resultado.margemContribuicaoPercent.toFixed(1)}%`} subvalue={formatCurrency(resultado.margemContribuicao) + '/un.'} color="green" />
            <StatCard icon={Target} label="Margem Seguranca" value={`${resultado.margemSeguranca.toFixed(1)}%`} color={resultado.margemSeguranca > 20 ? 'green' : resultado.margemSeguranca > 0 ? 'amber' : 'red'} />
          </div>

          {/* Detalhamento */}
          <Card>
            <CardHeader><h2 className="text-slate-800 font-medium text-sm">Detalhamento por Unidade</h2></CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs">Preco de Venda</p>
                  <p className="text-slate-800 font-medium">{formatCurrency(precoVendaUnitario)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">(-) Custo Variavel</p>
                  <p className="text-red-600 font-medium">{formatCurrency(resultado.custoVariavelUnitario)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs">(-) Tributos</p>
                  <p className="text-red-600 font-medium">{formatCurrency(resultado.impostoUnitario)}</p>
                </div>
                {cppAnexoIV > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs">(-) CPP Anexo IV</p>
                    <p className="text-red-600 font-medium">{formatCurrency(resultado.cppUnitario)}</p>
                  </div>
                )}
                <div className="col-span-2 md:col-span-3 border-t border-slate-200 pt-2">
                  <p className="text-slate-400 text-xs">= Margem de Contribuicao</p>
                  <p className="text-emerald-600 font-semibold text-lg">{formatCurrency(resultado.margemContribuicao)}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Ponto de equilibrio = {formatCurrency(custoFixoMensal)} / {formatCurrency(resultado.margemContribuicao)} = <span className="text-brand-600 font-medium">{resultado.peQuantidade} unidades</span>
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Grafico */}
          <Card>
            <CardHeader>
              <h2 className="text-slate-800 font-medium text-sm">Receita vs Custos</h2>
              <p className="text-slate-400 text-xs mt-0.5">O ponto onde as linhas se cruzam e o ponto de equilibrio</p>
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
