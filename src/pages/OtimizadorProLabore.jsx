import { useState, useMemo, useEffect, useCallback } from 'react';
import { Users, DollarSign, TrendingDown, Calculator, Info, AlertTriangle } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import { InfoTip } from '../components/Tooltip';
import PageHeader from '../components/PageHeader';
import DisclaimerBanner from '../components/DisclaimerBanner';
import {
  formatCurrency, formatPercent,
  constantesTributarias2026, encargosTrabalhistas, irrf,
} from '../data/taxData';

const STORAGE_KEY = 'precificalc_otimizador_prolabore';

function calcIRPFProLabore(baseCalculo) {
  const faixas = irrf.pessoaFisica.faixas;
  const reducao = irrf.pessoaFisica.reducaoLei15270;

  // Lei 15.270/2025 - isenção total até R$ 5.000
  if (baseCalculo <= reducao.limiteIsencao) return { imposto: 0, aliquotaEfetiva: 0, faixa: 1 };

  let imposto = 0;
  let faixaIdx = 0;
  for (let i = 0; i < faixas.length; i++) {
    if (baseCalculo >= faixas[i].de) {
      faixaIdx = i;
    }
  }
  const faixa = faixas[faixaIdx];
  imposto = baseCalculo * faixa.aliquota - faixa.deducao;

  // Redução parcial (Lei 15.270/2025) entre R$ 5.000 e R$ 7.350
  if (baseCalculo > reducao.limiteIsencao && baseCalculo <= reducao.limiteFaseout) {
    const reducaoValor = reducao.valorBase - (baseCalculo * reducao.fator);
    imposto = Math.max(0, imposto - Math.max(0, reducaoValor));
  }

  imposto = Math.max(0, imposto);

  return {
    imposto,
    aliquotaEfetiva: baseCalculo > 0 ? imposto / baseCalculo : 0,
    faixa: faixaIdx + 1,
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

export default function OtimizadorProLabore() {
  const saved = loadState();

  const [lucroDisponivel, setLucroDisponivel] = useState(saved?.lucroDisponivel ?? 30000);
  const [regime, setRegime] = useState(saved?.regime || 'presumido');
  const [numSocios, setNumSocios] = useState(saved?.numSocios ?? 1);

  const persistState = useCallback(() => {
    const state = { lucroDisponivel, regime, numSocios };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [lucroDisponivel, regime, numSocios]);

  useEffect(() => { persistState(); }, [persistState]);

  const tetoINSS = constantesTributarias2026.tetoINSS;
  const salarioMinimo = constantesTributarias2026.salarioMinimo;
  const inssAliquotaSocio = encargosTrabalhistas.proLabore.inss;
  const tetoInssContribuicao = encargosTrabalhistas.proLabore.tetoInss2026;
  const inssPatronal = regime === 'simples'
    ? encargosTrabalhistas.proLabore.inssPatronalSimples
    : encargosTrabalhistas.proLabore.inssPatronal;

  // Simulate different pro-labore values to find optimal
  const otimizacao = useMemo(() => {
    const lucroTotal = lucroDisponivel;
    if (lucroTotal <= 0) return null;

    const resultados = [];

    // Test pro-labore values from salario minimo up to lucro total, in steps
    const maxPL = Math.min(lucroTotal, tetoINSS * 2);
    const step = Math.max(100, Math.round(maxPL / 50));

    for (let plPorSocio = salarioMinimo; plPorSocio <= maxPL; plPorSocio += step) {
      const plTotal = plPorSocio * numSocios;
      if (plTotal > lucroTotal) break;

      // INSS socio: 11% capped at teto
      const inssSocioPorSocio = Math.min(plPorSocio * inssAliquotaSocio, tetoInssContribuicao);
      const inssSocioTotal = inssSocioPorSocio * numSocios;

      // INSS patronal: 20% if LP/LR, 0% if Simples
      const inssPatronalTotal = plTotal * inssPatronal;

      // IRPF on pro-labore (per partner, after INSS deduction)
      const baseIRPF = plPorSocio - inssSocioPorSocio;
      const irpfCalc = calcIRPFProLabore(baseIRPF);
      const irpfTotal = irpfCalc.imposto * numSocios;

      // Total cost of pro-labore
      const custoProLabore = inssSocioTotal + inssPatronalTotal + irpfTotal;

      // Distribution as dividends (tax-free per Lei 9.249/95 Art. 10)
      const lucroDistribuicao = lucroTotal - plTotal - inssPatronalTotal;
      const lucroDistribuicaoPorSocio = numSocios > 0 ? lucroDistribuicao / numSocios : 0;

      // Net received per partner
      const liquidoPorSocio = (plPorSocio - inssSocioPorSocio - irpfCalc.imposto) + Math.max(0, lucroDistribuicaoPorSocio);

      // Total net for all partners
      const liquidoTotal = liquidoPorSocio * numSocios;

      // Carga total (tudo que se perde)
      const cargaTotal = custoProLabore;
      const cargaPercentual = lucroTotal > 0 ? cargaTotal / lucroTotal : 0;

      resultados.push({
        proLaborePorSocio: plPorSocio,
        proLaboreTotal: plTotal,
        inssSocioPorSocio,
        inssSocioTotal,
        inssPatronalTotal,
        irpfPorSocio: irpfCalc.imposto,
        irpfTotal,
        faixaIRPF: irpfCalc.faixa,
        custoProLabore,
        lucroDistribuicao: Math.max(0, lucroDistribuicao),
        lucroDistribuicaoPorSocio: Math.max(0, lucroDistribuicaoPorSocio),
        liquidoPorSocio,
        liquidoTotal,
        cargaTotal,
        cargaPercentual,
      });
    }

    if (resultados.length === 0) return null;

    // Find optimal: maximum liquidoTotal
    const melhor = resultados.reduce((best, curr) =>
      curr.liquidoTotal > best.liquidoTotal ? curr : best, resultados[0]);

    // Also compute the minimum (salario minimo) scenario for comparison
    const minimo = resultados[0];

    return { resultados, melhor, minimo };
  }, [lucroDisponivel, regime, numSocios, tetoINSS, salarioMinimo, inssAliquotaSocio, tetoInssContribuicao, inssPatronal]);

  const melhor = otimizacao?.melhor;

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        icon={Users}
        title="Otimizador de Pró-labore"
        description="Encontre a divisão ideal entre pró-labore e distribuição de lucros"
      />
      <DisclaimerBanner />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters */}
        <Card className="lg:col-span-1">
          <CardHeader><h2 className="text-slate-800 dark:text-slate-200 font-medium text-sm">Parâmetros</h2></CardHeader>
          <CardBody className="space-y-4">
            <InputField
              label="Lucro mensal disponível"
              value={lucroDisponivel}
              onChange={setLucroDisponivel}
              prefix="R$"
              step={1000}
              min={0}
              help="Lucro da empresa disponível para retirada dos sócios"
            />

            <SelectField
              label="Regime Tributário"
              value={regime}
              onChange={setRegime}
              options={[
                { value: 'simples', label: 'Simples Nacional' },
                { value: 'presumido', label: 'Lucro Presumido' },
                { value: 'real', label: 'Lucro Real' },
              ]}
              help={regime === 'simples'
                ? 'Simples: sem INSS patronal sobre pró-labore'
                : 'LP/LR: 20% de INSS patronal sobre pró-labore'}
            />

            <InputField
              label="Número de sócios"
              value={numSocios}
              onChange={setNumSocios}
              step={1}
              min={1}
              max={10}
            />

            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                  <p>A <strong>distribuição de lucros</strong> é isenta de IR para o sócio (Lei 9.249/95, Art. 10).</p>
                  <p>O <strong>pró-labore</strong> tem incidência de INSS (11% sócio, até o teto) e IRPF progressivo.</p>
                  {regime !== 'simples' && (
                    <p>No {regime === 'presumido' ? 'Lucro Presumido' : 'Lucro Real'}, há ainda 20% de INSS patronal sobre o pró-labore.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <p>Teto INSS 2026: {formatCurrency(tetoINSS)}</p>
              <p>INSS sócio: 11% (máx. {formatCurrency(tetoInssContribuicao)})</p>
              <p>INSS patronal: {regime === 'simples' ? '0% (Simples)' : '20%'}</p>
              <p>Salário mínimo: {formatCurrency(salarioMinimo)}</p>
            </div>
          </CardBody>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {melhor && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  icon={DollarSign}
                  label="Pró-labore ideal/sócio"
                  value={formatCurrency(melhor.proLaborePorSocio)}
                  color="brand"
                />
                <StatCard
                  icon={Users}
                  label="Dividendos/sócio"
                  value={formatCurrency(melhor.lucroDistribuicaoPorSocio)}
                  subvalue="Isento de IR"
                  color="green"
                />
                <StatCard
                  icon={Calculator}
                  label="Líquido/sócio"
                  value={formatCurrency(melhor.liquidoPorSocio)}
                  color="blue"
                />
                <StatCard
                  icon={TrendingDown}
                  label="Carga tributária"
                  value={formatPercent(melhor.cargaPercentual)}
                  subvalue={formatCurrency(melhor.cargaTotal)}
                  color="red"
                />
              </div>

              {/* Detailed breakdown */}
              <Card>
                <CardHeader>
                  <h2 className="text-slate-800 dark:text-slate-200 font-medium text-sm">Divisão Ótima (por sócio)</h2>
                </CardHeader>
                <CardBody className="space-y-2">
                  <DetailRow label="Pró-labore bruto" value={formatCurrency(melhor.proLaborePorSocio)} />
                  <DetailRow label="(-) INSS sócio (11%)" value={formatCurrency(melhor.inssSocioPorSocio)} negative />
                  <DetailRow label={`(-) IRPF (faixa ${melhor.faixaIRPF})`} value={formatCurrency(melhor.irpfPorSocio)} negative />
                  <DetailRow label="= Pró-labore líquido" value={formatCurrency(melhor.proLaborePorSocio - melhor.inssSocioPorSocio - melhor.irpfPorSocio)} highlight />
                  <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                  <DetailRow label="(+) Distribuição de lucros (isento IR)" value={formatCurrency(melhor.lucroDistribuicaoPorSocio)} />
                  <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                  <DetailRow label="= Total líquido por sócio" value={formatCurrency(melhor.liquidoPorSocio)} highlight />

                  {numSocios > 1 && (
                    <>
                      <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                      <DetailRow label={`Total líquido (${numSocios} sócios)`} value={formatCurrency(melhor.liquidoTotal)} highlight />
                    </>
                  )}
                </CardBody>
              </Card>

              {/* Company cost */}
              <Card>
                <CardHeader>
                  <h2 className="text-slate-800 dark:text-slate-200 font-medium text-sm">Custo para a Empresa</h2>
                </CardHeader>
                <CardBody className="space-y-2">
                  <DetailRow label="Pró-labore total" value={formatCurrency(melhor.proLaboreTotal)} />
                  {melhor.inssPatronalTotal > 0 && (
                    <DetailRow label="INSS patronal (20%)" value={formatCurrency(melhor.inssPatronalTotal)} negative />
                  )}
                  <DetailRow label="Distribuição de lucros" value={formatCurrency(melhor.lucroDistribuicao)} />
                  <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
                  <DetailRow label="Total saída de caixa" value={formatCurrency(melhor.proLaboreTotal + melhor.inssPatronalTotal + melhor.lucroDistribuicao)} highlight />
                </CardBody>
              </Card>

              {/* Comparison: minimum vs optimal */}
              {otimizacao.minimo && melhor.proLaborePorSocio > otimizacao.minimo.proLaborePorSocio && (
                <Card>
                  <CardHeader>
                    <h2 className="text-slate-800 dark:text-slate-200 font-medium text-sm">Comparação: Mínimo vs. Ótimo</h2>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div />
                      <div className="text-center">
                        <p className="text-xs text-slate-400 mb-1">Mínimo (1 SM)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-1">Ótimo</p>
                      </div>

                      <p className="text-slate-500 dark:text-slate-400 text-xs">Pró-labore/sócio</p>
                      <p className="text-center font-mono text-slate-700 dark:text-slate-300">{formatCurrency(otimizacao.minimo.proLaborePorSocio)}</p>
                      <p className="text-center font-mono text-brand-600 dark:text-brand-400 font-medium">{formatCurrency(melhor.proLaborePorSocio)}</p>

                      <p className="text-slate-500 dark:text-slate-400 text-xs">Líquido/sócio</p>
                      <p className="text-center font-mono text-slate-700 dark:text-slate-300">{formatCurrency(otimizacao.minimo.liquidoPorSocio)}</p>
                      <p className="text-center font-mono text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(melhor.liquidoPorSocio)}</p>

                      <p className="text-slate-500 dark:text-slate-400 text-xs">Carga tributária</p>
                      <p className="text-center font-mono text-slate-700 dark:text-slate-300">{formatPercent(otimizacao.minimo.cargaPercentual)}</p>
                      <p className="text-center font-mono text-slate-700 dark:text-slate-300">{formatPercent(melhor.cargaPercentual)}</p>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
                      Diferença líquida por sócio: <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(melhor.liquidoPorSocio - otimizacao.minimo.liquidoPorSocio)}/mês</span>
                    </p>
                  </CardBody>
                </Card>
              )}

              {/* Legal note */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
                <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                  <p><strong>Pró-labore mínimo:</strong> Não há valor mínimo definido em lei, mas a Receita Federal e o INSS costumam entender que 1 salário mínimo é o piso.</p>
                  <p><strong>Distribuição de lucros isenta:</strong> Lei 9.249/95, Art. 10 -- lucros distribuídos são isentos de IR para o beneficiário PF, desde que apurados conforme legislação comercial.</p>
                </div>
              </div>
            </>
          )}

          {!otimizacao && (
            <Card>
              <CardBody className="text-center py-8">
                <p className="text-slate-400 dark:text-slate-500">Informe um lucro disponível maior que zero para ver a otimização.</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, highlight, negative }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${highlight ? 'text-slate-800 dark:text-slate-200 font-medium' : negative ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>{label}</span>
      <span className={`text-sm font-mono ${highlight ? 'text-slate-800 dark:text-slate-200 font-semibold' : negative ? 'text-red-500 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>{value}</span>
    </div>
  );
}
