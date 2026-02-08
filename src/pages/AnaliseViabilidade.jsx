import { useState } from 'react';
import { Target, Calculator, DollarSign, Clock, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import { calcMEI, calcSimplesTax, calcLucroPresumido, calcLucroReal, formatCurrency, formatPercent } from '../data/taxData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { calcCPPAnexoIV, calcFatorR, getAnexoPorFatorR, checkSublimiteSimples } from '../data/taxHelpers';
import PageHeader from '../components/PageHeader';
import CostBreakdownChart from '../components/CostBreakdownChart';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Seasonality multipliers
const sazonal = {
  nenhuma: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  comercio: [0.8, 0.7, 0.8, 0.85, 0.9, 0.85, 0.8, 0.85, 0.9, 0.95, 1.2, 1.5],
  servicos: [0.9, 0.95, 1, 1, 1, 1, 1, 1, 1, 1, 0.95, 0.9],
  educacao: [0.7, 1.3, 1.2, 1, 1, 0.8, 0.7, 1.3, 1.1, 1, 0.9, 0.7],
};

// Viability thresholds by segment
const thresholds = {
  comercio: { excelente: 10, boa: 5 },
  industria: { excelente: 15, boa: 8 },
  servicos: { excelente: 25, boa: 15 },
};

export default function AnaliseViabilidade() {
  const [state, setState] = useLocalStorage('precificalc_viabilidade', {
    dados: {
      investimentoInicial: '', receitaMensal: '', custoFixoMensal: '', custoVariavelPercent: '',
      atividade: 'servicos', regime: 'simples', anexo: 'III', rbt12: '',
      issAliquota: '5', despesasDedutiveis: '', creditosPisCofins: '',
      folhaMensal: '20000',
    },
    taxaCrescimento: 3, tipoSazonalidade: 'nenhuma', taxaDesconto: 12, segmento: 'servicos',
  });
  const [resultado, setResultado] = useState(null);
  const { dados, taxaCrescimento, tipoSazonalidade, taxaDesconto, segmento } = state;
  const setDados = (v) => setState(prev => ({ ...prev, dados: typeof v === 'function' ? v(prev.dados) : v }));
  const setTaxaCrescimento = (v) => setState(prev => ({ ...prev, taxaCrescimento: v }));
  const setTipoSazonalidade = (v) => setState(prev => ({ ...prev, tipoSazonalidade: v }));
  const setTaxaDesconto = (v) => setState(prev => ({ ...prev, taxaDesconto: v }));
  const setSegmento = (v) => setState(prev => ({ ...prev, segmento: v }));

  // Fator R e Anexo Efetivo
  const folhaMensal = parseFloat(dados.folhaMensal) || 0;
  const rbt12Num = parseFloat(dados.rbt12) || 0;
  const fatorR = dados.regime === 'simples' ? calcFatorR(folhaMensal * 12, rbt12Num) : 0;
  const anexoEfetivo = dados.regime === 'simples' ? getAnexoPorFatorR(fatorR, dados.anexo) : dados.anexo;
  const migrouAnexo = dados.regime === 'simples' && dados.anexo === 'V' && anexoEfetivo === 'III';

  // CPP para Anexo IV
  const cppAnexoIV = (dados.regime === 'simples' && anexoEfetivo === 'IV') ? calcCPPAnexoIV(folhaMensal) : 0;

  // Sublimite check
  const sublimite = dados.regime === 'simples' ? checkSublimiteSimples(rbt12Num) : null;

  const calcularViabilidade = () => {
    const receita = parseFloat(dados.receitaMensal) || 0;
    const custoFixo = parseFloat(dados.custoFixoMensal) || 0;
    const custoVariavel = (receita * (parseFloat(dados.custoVariavelPercent) || 0)) / 100;
    const investimento = parseFloat(dados.investimentoInicial) || 0;
    if (receita <= 0) return;

    let impostos = 0;
    let taxDetail = [];
    const receitaAnual = dados.regime === 'simples' ? (parseFloat(dados.rbt12) || receita * 12) : receita * 12;

    switch (dados.regime) {
      case 'mei': {
        const r = calcMEI(receita, dados.atividade);
        impostos = r && !r.excedeLimite ? r.dasFixo : 0;
        if (impostos > 0) taxDetail = [{ name: 'DAS MEI', value: impostos }];
        break;
      }
      case 'simples': {
        const r = calcSimplesTax(receitaAnual, anexoEfetivo);
        if (r && !r.excedeLimite) {
          impostos = r.valorMensal;
          const dist = r.distribuicaoTributos || {};
          taxDetail = Object.entries(dist).map(([name, pct]) => ({
            name, value: r.valorMensal * pct, percent: (r.aliquotaEfetiva * pct * 100),
          }));
        }
        break;
      }
      case 'presumido': {
        const r = calcLucroPresumido(receita, dados.atividade, (parseFloat(dados.issAliquota) || 5) / 100);
        if (r && !r.erro) {
          impostos = r.totalMensal;
          taxDetail = [
            { name: 'IRPJ', value: r.irpj.valorMensal },
            { name: 'CSLL', value: r.csll.valorMensal },
            { name: 'PIS', value: r.pis.valorMensal },
            { name: 'COFINS', value: r.cofins.valorMensal },
            { name: 'ISS', value: r.iss.valorMensal },
          ].filter(t => t.value > 0);
        }
        break;
      }
      case 'real': {
        const r = calcLucroReal(receita, parseFloat(dados.despesasDedutiveis) || custoFixo, parseFloat(dados.creditosPisCofins) || 0, (parseFloat(dados.issAliquota) || 5) / 100);
        if (r && !r.erro) {
          impostos = r.totalMensal;
          taxDetail = [
            { name: 'IRPJ', value: r.irpj.valorMensal },
            { name: 'CSLL', value: r.csll.valorMensal },
            { name: 'PIS', value: r.pis.valorMensal },
            { name: 'COFINS', value: r.cofins.valorMensal },
            { name: 'ISS', value: r.iss.valorMensal },
          ].filter(t => t.value > 0);
        }
        break;
      }
    }

    // Add CPP for Anexo IV
    impostos += cppAnexoIV;

    const custoBase = custoFixo + custoVariavel; // Without taxes (applied separately in projection)
    const custoTotal = custoBase + impostos; // For display/summary only
    const lucroMensal = receita - custoTotal;
    const margemLucro = receita > 0 ? (lucroMensal / receita) * 100 : 0;
    const payback = lucroMensal > 0 && investimento > 0 ? investimento / lucroMensal : 0;
    const aliquotaEfetiva = receita > 0 ? impostos / receita : 0;
    const margemContribuicao = 1 - ((parseFloat(dados.custoVariavelPercent) || 0) / 100) - aliquotaEfetiva;
    const pontoEquilibrio = margemContribuicao > 0 ? custoFixo / margemContribuicao : 0;

    // Improved 12-month projection with compound growth + seasonality
    const sazonalMults = sazonal[tipoSazonalidade] || sazonal.nenhuma;
    const projecao = Array.from({ length: 12 }, (_, i) => {
      const mult = sazonalMults[i];
      const crescimento = Math.pow(1 + taxaCrescimento / 100, i);
      const receitaMes = receita * crescimento * mult;
      // Fixed costs don't scale with seasonality; only variable costs do
      const custoMes = custoFixo + (custoVariavel * crescimento * mult);
      const impostoMes = receitaMes * aliquotaEfetiva;
      const lucroMes = receitaMes - custoMes - impostoMes;
      const fatorDesconto = Math.pow(1 + (taxaDesconto / 100 / 12), -(i + 1));
      const lucroDescontado = lucroMes * fatorDesconto;
      return { mes: `M${i + 1}`, receita: receitaMes, custo: custoMes, lucro: lucroMes, lucroDescontado, acumulado: 0 };
    });

    // Calculate cumulative
    let acum = -investimento;
    projecao.forEach(p => { acum += p.lucroDescontado; p.acumulado = acum; });

    // VPL (Net Present Value)
    const vpl = projecao.reduce((sum, p) => sum + p.lucroDescontado, 0) - investimento;

    const distribuicao = [
      { name: 'Custos Fixos', value: custoFixo },
      { name: 'Custos Variaveis', value: custoVariavel },
      { name: 'Tributos', value: impostos },
      { name: 'Lucro', value: Math.max(0, lucroMensal) },
    ];

    // Viability based on segment thresholds
    const segThreshold = thresholds[segmento] || thresholds.servicos;
    let viabilidade;
    if (margemLucro >= segThreshold.excelente) {
      viabilidade = 'excelente';
    } else if (margemLucro >= segThreshold.boa) {
      viabilidade = 'boa';
    } else if (margemLucro > 0) {
      viabilidade = 'limitada';
    } else {
      viabilidade = 'inviavel';
    }

    setResultado({
      lucroMensal, margemLucro, payback, pontoEquilibrio, impostos, aliquotaEfetiva, custoTotal,
      projecao, distribuicao, viabilidade, vpl, taxDetail,
    });
  };

  const viabTexto = { excelente: 'Excelente', boa: 'Boa', limitada: 'Limitada', inviavel: 'Inviavel' };
  const viabColor = { excelente: 'green', boa: 'blue', limitada: 'amber', inviavel: 'red' };
  const update = (field, value) => setDados({ ...dados, [field]: value });
  const tt = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,.1)' }; // Used by LineChart Tooltip

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader icon={Target} title="Analise de Viabilidade" description="Avalie a viabilidade do negocio com calculos tributarios reais" />
      <DisclaimerBanner />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h2 className="font-medium text-slate-800 text-sm">Dados do Negocio</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <InputField label="Investimento Inicial" value={dados.investimentoInicial} onChange={(v) => update('investimentoInicial', v)} prefix="R$" step={5000} placeholder="50000" />
            <InputField label="Receita Mensal Esperada" value={dados.receitaMensal} onChange={(v) => update('receitaMensal', v)} prefix="R$" step={5000} placeholder="30000" />
            <InputField label="Custo Fixo Mensal" value={dados.custoFixoMensal} onChange={(v) => update('custoFixoMensal', v)} prefix="R$" step={1000} placeholder="8000" />
            <InputField label="Custo Variavel (% receita)" value={dados.custoVariavelPercent} onChange={(v) => update('custoVariavelPercent', v)} suffix="%" step={5} placeholder="20" />
            <SelectField label="Atividade" value={dados.atividade} onChange={(v) => update('atividade', v)} options={[
              { value: 'servicos', label: 'Servicos' }, { value: 'comercio', label: 'Comercio' }, { value: 'industria', label: 'Industria' },
            ]} />
            <SelectField label="Regime Tributario" value={dados.regime} onChange={(v) => update('regime', v)} options={[
              { value: 'mei', label: 'MEI' }, { value: 'simples', label: 'Simples Nacional' },
              { value: 'presumido', label: 'Lucro Presumido' }, { value: 'real', label: 'Lucro Real' },
            ]} />
            {dados.regime === 'simples' && (
              <>
                <InputField label="RBT12 (Receita 12 meses)" value={dados.rbt12} onChange={(v) => update('rbt12', v)} prefix="R$" step={10000} placeholder="360000" help="Receita bruta dos ultimos 12 meses" />
                <SelectField label="Anexo" value={dados.anexo} onChange={(v) => update('anexo', v)} options={[
                  { value: 'I', label: 'Anexo I' }, { value: 'II', label: 'Anexo II' },
                  { value: 'III', label: 'Anexo III' }, { value: 'IV', label: 'Anexo IV' }, { value: 'V', label: 'Anexo V' },
                ]} />
                <InputField label="Folha de Pagamento Mensal" value={dados.folhaMensal} onChange={(v) => update('folhaMensal', v)} prefix="R$" step={1000} placeholder="20000" />
              </>
            )}
            {(dados.regime === 'presumido' || dados.regime === 'real') && (
              <InputField label="Aliquota ISS (%)" value={dados.issAliquota} onChange={(v) => update('issAliquota', v)} suffix="%" min={2} max={5} step={0.5} />
            )}
            {dados.regime === 'real' && (
              <>
                <InputField label="Despesas Dedutiveis" value={dados.despesasDedutiveis} onChange={(v) => update('despesasDedutiveis', v)} prefix="R$" step={1000} />
                <InputField label="Creditos PIS/COFINS" value={dados.creditosPisCofins} onChange={(v) => update('creditosPisCofins', v)} prefix="R$" step={1000} />
              </>
            )}

            {/* Fator R display */}
            {dados.regime === 'simples' && (
              <div className="p-3 bg-slate-50 rounded-md space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Fator R (% da folha sobre faturamento)</span>
                  <span className={`text-xs font-medium ${fatorR >= 0.28 ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {(fatorR * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Anexo efetivo</span>
                  <span className="text-xs font-medium text-slate-700">Anexo {anexoEfetivo}</span>
                </div>
                {migrouAnexo && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Info size={12} className="text-emerald-600 flex-shrink-0" />
                    <p className="text-xs text-emerald-600">Fator R ≥ 28% — migrou pro Anexo III (tributo menor)</p>
                  </div>
                )}
              </div>
            )}

            {/* CPP Anexo IV warning */}
            {dados.regime === 'simples' && anexoEfetivo === 'IV' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
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
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />
                  <p className="text-xs text-red-700 font-medium">{sublimite.mensagem}</p>
                </div>
              </div>
            )}

            <div className="border-t border-slate-200 pt-3">
              <p className="text-xs font-medium text-slate-500 mb-2">Parametros de Projecao</p>
              <InputField label="Taxa de Crescimento Mensal (%)" value={taxaCrescimento} onChange={setTaxaCrescimento} suffix="%" step={0.5} min={0} max={20} />
              <SelectField label="Sazonalidade" value={tipoSazonalidade} onChange={setTipoSazonalidade} className="mt-3" options={[
                { value: 'nenhuma', label: 'Nenhuma' },
                { value: 'comercio', label: 'Comercio (pico em dez)' },
                { value: 'servicos', label: 'Servicos (estavel)' },
                { value: 'educacao', label: 'Educacao (picos fev/ago)' },
              ]} />
              <InputField label="Taxa de Desconto Anual (%)" value={taxaDesconto} onChange={setTaxaDesconto} suffix="%" step={1} min={0} max={50} className="mt-3" help="Para calculo do VPL" />
              <SelectField label="Segmento" value={segmento} onChange={setSegmento} className="mt-3" options={[
                { value: 'servicos', label: 'Servicos' },
                { value: 'comercio', label: 'Comercio' },
                { value: 'industria', label: 'Industria' },
              ]} />
            </div>

            <button onClick={calcularViabilidade} className="w-full px-4 py-2.5 bg-brand-600 text-white rounded-md font-medium hover:bg-brand-700 transition-colors text-sm">
              Analisar Viabilidade
            </button>
          </CardBody>
        </Card>

        <div className="xl:col-span-2 space-y-4">
          {resultado ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard icon={resultado.viabilidade === 'inviavel' || resultado.viabilidade === 'limitada' ? AlertCircle : CheckCircle} label="Viabilidade" value={viabTexto[resultado.viabilidade]} color={viabColor[resultado.viabilidade]} />
                <StatCard icon={DollarSign} label="Lucro Mensal" value={formatCurrency(resultado.lucroMensal)} subvalue={`${resultado.margemLucro.toFixed(1)}% margem`} color={resultado.lucroMensal > 0 ? 'green' : 'red'} />
                <StatCard icon={Clock} label="Payback" value={resultado.payback > 0 ? `${resultado.payback.toFixed(1)} meses` : 'N/A'} color="blue" />
                <StatCard icon={Target} label="Ponto de Equilibrio" value={formatCurrency(resultado.pontoEquilibrio)} subvalue="Receita minima" color="amber" />
              </div>

              <Card>
                <CardBody>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div><p className="text-slate-400 text-xs">Tributos Mensais</p><p className="text-slate-800 font-medium">{formatCurrency(resultado.impostos)}</p></div>
                    <div><p className="text-slate-400 text-xs">Aliquota Efetiva</p><p className="text-slate-800 font-medium">{formatPercent(resultado.aliquotaEfetiva)}</p></div>
                    <div><p className="text-slate-400 text-xs">Custos Totais</p><p className="text-slate-800 font-medium">{formatCurrency(resultado.custoTotal)}</p></div>
                    <div><p className="text-slate-400 text-xs">VPL (12 meses)</p><p className={`font-medium ${resultado.vpl > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(resultado.vpl)}</p></div>
                    <div><p className="text-slate-400 text-xs">Lucro Anual Est.</p><p className={`font-medium ${resultado.lucroMensal > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(resultado.lucroMensal * 12)}</p></div>
                  </div>
                </CardBody>
              </Card>

              {/* Segment threshold info */}
              <Card>
                <CardBody>
                  <div className="flex items-start gap-2">
                    <Info size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-slate-500">
                      <p className="font-medium text-slate-700 mb-1">Criterios de viabilidade para {segmento}</p>
                      <p>Excelente: margem &ge; {(thresholds[segmento] || thresholds.servicos).excelente}% | Boa: margem &ge; {(thresholds[segmento] || thresholds.servicos).boa}% | Limitada: margem &gt; 0% | Inviavel: margem &le; 0%</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><h3 className="font-medium text-slate-800 text-sm">Projecao 12 Meses</h3></CardHeader>
                  <CardBody>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={resultado.projecao}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={tt} formatter={(v) => formatCurrency(v)} />
                        <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={2} name="Lucro Mensal" dot={false} />
                        <Line type="monotone" dataKey="acumulado" stroke="#3b82f6" strokeWidth={2} name="Acumulado (VPL)" dot={false} />
                        <Line type="monotone" dataKey="receita" stroke="#8b5cf6" strokeWidth={1} strokeDasharray="4 4" name="Receita" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                    {tipoSazonalidade !== 'nenhuma' && (
                      <p className="text-xs text-slate-400 mt-2">Sazonalidade aplicada: {tipoSazonalidade}</p>
                    )}
                  </CardBody>
                </Card>
                <Card>
                  <CardHeader><h3 className="font-medium text-slate-800 text-sm">Distribuicao de Custos</h3></CardHeader>
                  <CardBody>
                    <CostBreakdownChart
                      items={resultado.distribuicao.map(d => ({ label: d.name, value: d.value }))}
                      total={parseFloat(dados.receitaMensal) || 0}
                    />
                    {resultado.taxDetail && resultado.taxDetail.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Detalhamento dos Tributos</p>
                        <div className="space-y-1">
                          {resultado.taxDetail.map((t, i) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span className="text-slate-600 dark:text-slate-400">{t.name}</span>
                              <span className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(t.value)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs font-medium border-t border-slate-100 dark:border-slate-700 pt-1 mt-1">
                            <span className="text-slate-700 dark:text-slate-300">Total Tributos</span>
                            <span className="text-violet-600 dark:text-violet-400 font-mono">{formatCurrency(resultado.impostos)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            </>
          ) : (
            <Card className="flex items-center justify-center h-64">
              <div className="text-center">
                <Calculator size={40} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Preencha os dados e clique em Analisar</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
