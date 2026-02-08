import { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, Info, Sparkles, Calculator, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/Card';
import CostBreakdownChart from '../components/CostBreakdownChart';
import InputField, { SelectField } from '../components/InputField';
import { LabelComTermoTecnico } from '../components/TermoTecnico';
import { InfoTip } from '../components/Tooltip';
import {
  formatCurrency, formatPercent,
  calcSimplesTax, calcLucroPresumido, calcLucroReal, calcMEI,
} from '../data/taxData';
import { calcCPPAnexoIV, calcFatorR, getAnexoPorFatorR, checkSublimiteSimples } from '../data/taxHelpers';

const LS_KEY = 'precificalc_markup';

export default function MarkupCalculatorTab() {
  const [regime, setRegime] = useState('simples');
  const [anexo, setAnexo] = useState('III');
  const [rbt12, setRbt12] = useState(600000);
  const [folhaMensal, setFolhaMensal] = useState(20000);
  const [tipoAtividade, setTipoAtividade] = useState('servicos');
  const [issAliquota, setIssAliquota] = useState(5);
  const [adicoesLalur, setAdicoesLalur] = useState(0);
  const [exclusoesLalur, setExclusoesLalur] = useState(0);
  const [despesasFixas, setDespesasFixas] = useState(5000);
  const [custosVariaveis, setCustosVariaveis] = useState(10);
  const [margem, setMargem] = useState(20);
  const [receitaEsperada, setReceitaEsperada] = useState(50000);
  const [consultaCmv, setConsultaCmv] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.regime !== undefined) setRegime(data.regime);
        if (data.anexo !== undefined) setAnexo(data.anexo);
        if (data.rbt12 !== undefined) setRbt12(data.rbt12);
        if (data.folhaMensal !== undefined) setFolhaMensal(data.folhaMensal);
        if (data.tipoAtividade !== undefined) setTipoAtividade(data.tipoAtividade);
        if (data.issAliquota !== undefined) setIssAliquota(data.issAliquota);
        if (data.adicoesLalur !== undefined) setAdicoesLalur(data.adicoesLalur);
        // Migrate old receitaMensal to receitaEsperada if present
        if (data.receitaMensal !== undefined && data.receitaEsperada === undefined) setReceitaEsperada(data.receitaMensal);
        if (data.exclusoesLalur !== undefined) setExclusoesLalur(data.exclusoesLalur);
        if (data.despesasFixas !== undefined) setDespesasFixas(data.despesasFixas);
        if (data.custosVariaveis !== undefined) setCustosVariaveis(data.custosVariaveis);
        if (data.margem !== undefined) setMargem(data.margem);
        if (data.receitaEsperada !== undefined) setReceitaEsperada(data.receitaEsperada);
        if (data.consultaCmv !== undefined) setConsultaCmv(data.consultaCmv);
      }
    } catch {}
  }, []);

  // Save to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        regime, anexo, rbt12, folhaMensal, tipoAtividade, issAliquota,
        adicoesLalur, exclusoesLalur, despesasFixas,
        custosVariaveis, margem, receitaEsperada, consultaCmv,
      }));
    } catch {}
  }, [regime, anexo, rbt12, folhaMensal, tipoAtividade, issAliquota,
    adicoesLalur, exclusoesLalur, despesasFixas,
    custosVariaveis, margem, receitaEsperada, consultaCmv]);

  // Tax helpers
  const folhaPercent = regime === 'simples' ? calcFatorR(folhaMensal * 12, rbt12) : 0;
  const anexoEfetivo = regime === 'simples' ? getAnexoPorFatorR(folhaPercent, anexo) : anexo;
  const migrouAnexo = regime === 'simples' && anexo === 'V' && anexoEfetivo === 'III';
  const cppAnexoIV = (regime === 'simples' && anexoEfetivo === 'IV') ? calcCPPAnexoIV(folhaMensal) : 0;
  const sublimite = regime === 'simples' ? checkSublimiteSimples(rbt12) : null;

  // MEI DAS fixed
  const meiDasFixo = useMemo(() => {
    if (regime !== 'mei') return 0;
    const r = calcMEI(receitaEsperada, tipoAtividade === 'comercio' ? 'comercio' : 'servicos');
    return r && !r.excedeLimite ? r.dasFixo : 0;
  }, [regime, receitaEsperada, tipoAtividade]);

  // Aliquota efetiva
  const aliquotaEfetiva = useMemo(() => {
    switch (regime) {
      case 'mei': return 0;
      case 'simples': {
        const r = calcSimplesTax(rbt12, anexoEfetivo);
        return r && !r.excedeLimite ? r.aliquotaEfetiva : 0;
      }
      case 'presumido': {
        const r = calcLucroPresumido(receitaEsperada, tipoAtividade, issAliquota / 100);
        return r && !r.erro ? r.aliquotaEfetiva : 0;
      }
      case 'real': {
        const r = calcLucroReal(receitaEsperada, receitaEsperada * 0.6, receitaEsperada * 0.3, issAliquota / 100, adicoesLalur, exclusoesLalur);
        return r && !r.erro ? r.aliquotaEfetiva : 0;
      }
      default: return 0;
    }
  }, [regime, rbt12, anexoEfetivo, receitaEsperada, tipoAtividade, issAliquota, adicoesLalur, exclusoesLalur]);

  // Individual tax breakdown
  const taxDetail = useMemo(() => {
    switch (regime) {
      case 'mei': {
        if (meiDasFixo <= 0) return [];
        return [{ name: 'DAS MEI', value: meiDasFixo, percent: receitaEsperada > 0 ? (meiDasFixo / receitaEsperada) * 100 : 0 }];
      }
      case 'simples': {
        const r = calcSimplesTax(rbt12, anexoEfetivo);
        if (!r || r.excedeLimite) return [];
        const dist = r.distribuicaoTributos || {};
        return Object.entries(dist).map(([name, pct]) => ({
          name, value: r.valorMensal * pct, percent: r.aliquotaEfetiva * pct * 100,
        }));
      }
      case 'presumido': {
        const r = calcLucroPresumido(receitaEsperada, tipoAtividade, issAliquota / 100);
        if (!r || r.erro) return [];
        return [
          { name: 'IRPJ', value: r.irpj.valorMensal },
          { name: 'CSLL', value: r.csll.valorMensal },
          { name: 'PIS', value: r.pis.valorMensal },
          { name: 'COFINS', value: r.cofins.valorMensal },
          { name: 'ISS', value: r.iss.valorMensal },
        ].filter(t => t.value > 0).map(t => ({ ...t, percent: receitaEsperada > 0 ? (t.value / receitaEsperada) * 100 : 0 }));
      }
      case 'real': {
        const r = calcLucroReal(receitaEsperada, receitaEsperada * 0.6, receitaEsperada * 0.3, issAliquota / 100, adicoesLalur, exclusoesLalur);
        if (!r || r.erro) return [];
        return [
          { name: 'IRPJ', value: r.irpj.valorMensal },
          { name: 'CSLL', value: r.csll.valorMensal },
          { name: 'PIS', value: r.pis.valorMensal },
          { name: 'COFINS', value: r.cofins.valorMensal },
          { name: 'ISS', value: r.iss.valorMensal },
        ].filter(t => t.value > 0).map(t => ({ ...t, percent: receitaEsperada > 0 ? (t.value / receitaEsperada) * 100 : 0 }));
      }
      default: return [];
    }
  }, [regime, meiDasFixo, rbt12, anexoEfetivo, receitaEsperada, tipoAtividade, issAliquota, adicoesLalur, exclusoesLalur]);

  // Main markup calculation
  const resultado = useMemo(() => {
    const custosFixosAjustados = despesasFixas + meiDasFixo + cppAnexoIV;
    const percentualFixos = receitaEsperada > 0 ? custosFixosAjustados / receitaEsperada : 0;
    const percentualVariaveis = custosVariaveis / 100;
    const margemDecimal = margem / 100;

    const denominador = 1 - aliquotaEfetiva - percentualFixos - percentualVariaveis - margemDecimal;
    const inviavel = denominador <= 0;

    const fator = inviavel ? 0 : 1 / denominador;
    const markupPercent = inviavel ? 0 : (fator - 1) * 100;

    // Composition percentages (of the selling price)
    const cmvPercent = inviavel ? 0 : (1 / fator) * 100;
    const impostosPercent = aliquotaEfetiva * 100;
    const fixosPercent = percentualFixos * 100;
    const variaveisPercent = percentualVariaveis * 100;
    const lucroPercent = margemDecimal * 100;

    // Price table for standard CMV values
    const faixas = [10, 25, 50, 100, 250, 500, 1000];
    const tabela = faixas.map(cmv => ({
      cmv,
      precoVenda: inviavel ? 0 : cmv * fator,
      lucro: inviavel ? 0 : cmv * fator * margemDecimal,
    }));

    return {
      fator, markupPercent, denominador, inviavel,
      cmvPercent, impostosPercent, fixosPercent, variaveisPercent, lucroPercent,
      tabela, percentualFixos, custosFixosAjustados,
    };
  }, [despesasFixas, meiDasFixo, cppAnexoIV, receitaEsperada, custosVariaveis, margem, aliquotaEfetiva]);

  // Quick lookup
  const consultaResultado = useMemo(() => {
    const val = parseFloat(consultaCmv);
    if (!val || val <= 0 || resultado.inviavel) return null;
    return {
      precoVenda: val * resultado.fator,
      lucro: val * resultado.fator * (margem / 100),
    };
  }, [consultaCmv, resultado.fator, resultado.inviavel, margem]);

  // Composition data
  const composicaoItems = [
    { label: 'CMV', value: resultado.cmvPercent },
    { label: 'Tributos', value: resultado.impostosPercent },
    { label: 'Custos Fixos', value: resultado.fixosPercent },
    { label: 'Custos Variaveis', value: resultado.variaveisPercent },
    { label: 'Lucro', value: resultado.lucroPercent },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-1">Markup e Margem: qual a diferenca?</h3>
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Markup</strong> e o fator multiplicador aplicado sobre o <strong>custo</strong> do produto/servico (CMV) para chegar ao preco de venda.
          Ja a <strong>margem de lucro</strong> e a porcentagem do lucro em relacao ao <strong>preco de venda</strong>.
          Exemplo: um produto com custo de R$ 100 e markup de 2x sera vendido por R$ 200. A margem de lucro depende dos tributos e despesas embutidos nesse preco.
        </p>
      </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT COLUMN - Parameters */}
      <Card>
        <CardHeader>
          <h2 className="text-slate-800 font-medium text-sm flex items-center gap-2">
            <Calculator size={16} className="text-brand-600" />
            Parametros do Markup
          </h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {/* Section 1 - Regime Tributario */}
          <p className="text-xs font-bold text-slate-500 mb-2">Regime Tributario da Empresa</p>

          <LabelComTermoTecnico termo="simples" textoExplicativo="Regime da empresa" />
          <SelectField value={regime} onChange={setRegime} options={[
            { value: 'mei', label: 'MEI (ate R$ 81 mil/ano)' },
            { value: 'simples', label: 'Simples Nacional (ate R$ 4,8 mi/ano)' },
            { value: 'presumido', label: 'Lucro Presumido' },
            { value: 'real', label: 'Lucro Real' },
          ]} />

          {regime === 'mei' && meiDasFixo > 0 && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2">
                <Info size={14} className="text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-700">DAS MEI: {formatCurrency(meiDasFixo)}/mes (fixo, incluido nos gastos fixos)</p>
              </div>
            </div>
          )}

          {regime === 'simples' && (
            <>
              <LabelComTermoTecnico termo="anexo" textoExplicativo="Categoria da atividade" />
              <SelectField value={anexo} onChange={setAnexo} options={[
                { value: 'I', label: 'Anexo I - Comercio' },
                { value: 'II', label: 'Anexo II - Industria' },
                { value: 'III', label: 'Anexo III - Servicos' },
                { value: 'IV', label: 'Anexo IV - Construcao/Obras' },
                { value: 'V', label: 'Anexo V - TI/Engenharia' },
              ]} />

              <div>
                <LabelComTermoTecnico termo="rbt12" textoExplicativo="Faturamento ultimos 12 meses" />
                <InputField
                  value={rbt12}
                  onChange={setRbt12}
                  prefix="R$"
                  step={10000}
                  help={`Sua aliquota atual: ${formatPercent(aliquotaEfetiva)}`}
                />
              </div>

              <div>
                <LabelComTermoTecnico termo="cpp" textoExplicativo="Folha de pagamento mensal" />
                <InputField
                  value={folhaMensal}
                  onChange={setFolhaMensal}
                  prefix="R$"
                  step={1000}
                  help="Soma de salarios + encargos de todos os funcionarios"
                />
              </div>
            </>
          )}

          {(regime === 'presumido' || regime === 'real') && (
            <>
              <SelectField label="Atividade" value={tipoAtividade} onChange={setTipoAtividade} options={[
                { value: 'servicos', label: 'Servicos' },
                { value: 'comercio', label: 'Comercio' },
                { value: 'industria', label: 'Industria' },
              ]} />
              <InputField label="ISS do municipio (%)" value={issAliquota} onChange={setIssAliquota} suffix="%" min={2} max={5} step={0.5} />
            </>
          )}

          {regime === 'real' && (
            <>
              <InputField label="Adicoes ao LALUR" value={adicoesLalur} onChange={setAdicoesLalur} prefix="R$" step={1000} />
              <InputField label="Exclusoes do LALUR" value={exclusoesLalur} onChange={setExclusoesLalur} prefix="R$" step={1000} />
            </>
          )}

          {/* Fator R display */}
          {regime === 'simples' && (
            <div className="p-3 bg-slate-50 rounded-md space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  Fator R (% da folha sobre faturamento)
                  <InfoTip text="Fator R = Folha de Pagamento / Faturamento 12 meses. Se >= 28%, empresas do Anexo V migram para o Anexo III (tributo menor)." />
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
                  <p className="text-xs text-emerald-600">Fator R {'>='} 28% — migrou para o Anexo III (tributo menor).</p>
                </div>
              )}
            </div>
          )}

          {/* CPP warning for Anexo IV */}
          {regime === 'simples' && anexoEfetivo === 'IV' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-700 font-medium flex items-center gap-1">
                  CPP (Contribuicao Patronal Previdenciaria) — paga separado no Anexo IV
                  <InfoTip text="CPP = INSS que a empresa paga (20% da folha). No Anexo IV do Simples, essa contribuicao NAO esta incluida no DAS e precisa ser paga a parte via GPS." />
                </p>
              </div>
              <p className="text-xs text-amber-600 mt-1">
                Custo extra: <span className="font-medium">{formatCurrency(cppAnexoIV)}/mes</span> (20% da folha)
              </p>
            </div>
          )}

          {/* Sublimite warning */}
          {sublimite && sublimite.mensagem && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />
                <p className="text-xs text-red-700 font-medium">{sublimite.mensagem}</p>
              </div>
            </div>
          )}

          {/* Section 2 - Custos do Negocio */}
          <div className="border-t border-slate-200 pt-3 mt-3">
            <p className="text-xs font-bold text-slate-500 mb-2">Custos do Negocio</p>

            <div className="space-y-3">
              <InputField
                label="Despesas fixas mensais"
                value={despesasFixas}
                onChange={setDespesasFixas}
                prefix="R$"
                step={500}
                help="Aluguel, salarios, contador, internet"
              />
              <InputField
                label="Custos variaveis (%)"
                value={custosVariaveis}
                onChange={setCustosVariaveis}
                suffix="%"
                step={1}
                help="Frete, comissoes, embalagens"
              />
              <InputField
                label="Margem de lucro desejada"
                value={margem}
                onChange={setMargem}
                suffix="%"
                min={1}
                max={80}
                step={1}
              />
              <InputField
                label="Receita mensal esperada"
                value={receitaEsperada}
                onChange={setReceitaEsperada}
                prefix="R$"
                step={5000}
                help={regime !== 'simples' ? `Tributo efetivo: ${formatPercent(aliquotaEfetiva)} | Peso dos custos fixos no preco` : 'Para calcular o peso dos custos fixos'}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* RIGHT COLUMN - Results */}
      <div className="lg:col-span-2 space-y-4">
        {/* Card 1 - Main Result */}
        {resultado.inviavel ? (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="text-red-600" size={24} />
              <h3 className="text-base font-bold text-red-700">Calculo inviavel</h3>
            </div>
            <p className="text-sm text-red-600 mb-3">
              A soma de tributos + custos fixos + custos variaveis + margem excede 100% do preco de venda. Reduza algum componente.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/60 rounded-lg p-2 text-center">
                <p className="text-xs text-red-500">Tributos</p>
                <p className="text-sm font-bold text-red-700">{(aliquotaEfetiva * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-white/60 rounded-lg p-2 text-center">
                <p className="text-xs text-red-500">Custos Fixos</p>
                <p className="text-sm font-bold text-red-700">{(resultado.percentualFixos * 100).toFixed(1)}%</p>
              </div>
              <div className="bg-white/60 rounded-lg p-2 text-center">
                <p className="text-xs text-red-500">Custos Variaveis</p>
                <p className="text-sm font-bold text-red-700">{custosVariaveis.toFixed(1)}%</p>
              </div>
              <div className="bg-white/60 rounded-lg p-2 text-center">
                <p className="text-xs text-red-500">Margem</p>
                <p className="text-sm font-bold text-red-700">{margem.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-6 shadow-lg">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Fator Multiplicador</p>
            <div className="flex items-baseline gap-3">
              <p className="text-5xl font-black text-emerald-800">{resultado.fator.toFixed(2)}x</p>
              <p className="text-lg text-emerald-600 font-medium">Markup: {resultado.markupPercent.toFixed(1)}%</p>
            </div>
            <p className="text-sm text-emerald-700 mt-3">
              Multiplique o CMV (custo de compra) por <span className="font-bold">{resultado.fator.toFixed(2)}</span> para obter o preco de venda.
            </p>
            {resultado.markupPercent > 200 && (
              <div className="mt-3 p-2.5 bg-yellow-50 border border-yellow-300 rounded-lg flex items-center gap-2">
                <AlertTriangle size={14} className="text-yellow-600 flex-shrink-0" />
                <p className="text-xs text-yellow-700">Markup elevado (acima de 200%) pode dificultar vendas.</p>
              </div>
            )}
          </div>
        )}

        {/* Card 2 - Price composition */}
        {!resultado.inviavel && (
          <Card>
            <CardHeader>
              <h2 className="text-slate-800 font-medium text-sm flex items-center gap-2">
                <DollarSign size={16} className="text-brand-600" />
                Composicao do Preco de Venda
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Para cada R$ 1,00 vendido</p>
            </CardHeader>
            <CardBody>
              <CostBreakdownChart
                items={composicaoItems}
                total={100}
                formatValue={(v) => v.toFixed(1) + '%'}
              />
              {taxDetail.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Detalhamento dos Tributos ({formatPercent(aliquotaEfetiva)} efetiva)</p>
                  <div className="space-y-1">
                    {taxDetail.map((t, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">{t.name}</span>
                        <span className="text-slate-700 dark:text-slate-300 font-mono">
                          {t.percent.toFixed(2)}%
                          {receitaEsperada > 0 && <span className="text-slate-400 ml-1">({formatCurrency(t.value)}/mes)</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Card 3 - Price table */}
        {!resultado.inviavel && (
          <Card>
            <CardHeader>
              <h2 className="text-slate-800 font-medium text-sm flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-600" />
                Tabela de Precos por CMV
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Precos calculados com o fator {resultado.fator.toFixed(2)}x</p>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">CMV</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Preco de Venda</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Lucro Liquido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.tabela.map((row) => (
                      <tr key={row.cmv} className="border-b border-slate-100 even:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-700 font-mono">{formatCurrency(row.cmv)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-800 font-medium font-mono">{formatCurrency(row.precoVenda)}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-600 font-medium font-mono">{formatCurrency(row.lucro)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quick lookup */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-600 mb-2">Consulta rapida: digite qualquer CMV</p>
                <InputField
                  value={consultaCmv}
                  onChange={setConsultaCmv}
                  prefix="R$"
                  type="text"
                  placeholder="Ex: 75"
                />
                {consultaResultado && (
                  <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-4">
                    <div>
                      <p className="text-xs text-emerald-600">Preco de Venda</p>
                      <p className="text-sm font-bold text-emerald-800">{formatCurrency(consultaResultado.precoVenda)}</p>
                    </div>
                    <div className="w-px h-8 bg-emerald-200" />
                    <div>
                      <p className="text-xs text-emerald-600">Lucro</p>
                      <p className="text-sm font-bold text-emerald-800">{formatCurrency(consultaResultado.lucro)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
    </div>
  );
}
