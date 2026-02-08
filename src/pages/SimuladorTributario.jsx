import { useState, useMemo, useEffect, useCallback } from 'react';
import { Calculator, AlertTriangle, Info, BookOpen, HelpCircle, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import { InfoTip } from '../components/Tooltip';
import PageHeader from '../components/PageHeader';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  formatCurrency, formatPercent,
  calcSimplesTax, calcLucroPresumido, calcLucroReal, calcMEI,
  calcDIFAL, icmsInternoPorEstado,
  simplesNacional, mei, lucroPresumido, lucroReal,
} from '../data/taxData';

import { calcCPPAnexoIV, calcFatorR, getAnexoPorFatorR, checkSublimiteSimples } from '../data/taxHelpers';

const UF_OPTIONS = Object.keys(icmsInternoPorEstado).sort().map(uf => ({ value: uf, label: uf }));

const STORAGE_KEY = 'precificalc_simulador';

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

export default function SimuladorTributario() {
  const saved = loadState();

  const [regime, setRegime] = useState(saved?.regime || 'simples');
  const [receitaMensal, setReceitaMensal] = useState(saved?.receitaMensal ?? 50000);
  const [rbt12, setRbt12] = useState(saved?.rbt12 ?? 600000);
  const [anexo, setAnexo] = useState(saved?.anexo || 'III');
  const [atividadeMEI, setAtividadeMEI] = useState(saved?.atividadeMEI || 'servicos');
  const [tipoAtividade, setTipoAtividade] = useState(saved?.tipoAtividade || 'servicos');
  const [issAliquota, setIssAliquota] = useState(saved?.issAliquota ?? 5);
  const [despesasDedutiveis, setDespesasDedutiveis] = useState(saved?.despesasDedutiveis ?? 20000);
  const [creditosPisCofins, setCreditosPisCofins] = useState(saved?.creditosPisCofins ?? 10000);
  const [despesasOperacionais, setDespesasOperacionais] = useState(saved?.despesasOperacionais ?? 15000);

  // Lucro Real: apuração mensal por estimativa + prejuízo fiscal
  const [apuracaoMensal, setApuracaoMensal] = useState(saved?.apuracaoMensal ?? false);
  const [prejuizoFiscal, setPrejuizoFiscal] = useState(saved?.prejuizoFiscal ?? 0);

  // New fields: Folha / Fator R / LALUR
  const [folhaMensal, setFolhaMensal] = useState(saved?.folhaMensal ?? 10000);
  const [folha12Meses, setFolha12Meses] = useState(saved?.folha12Meses ?? 120000);
  const [usarFolha12Auto, setUsarFolha12Auto] = useState(saved?.usarFolha12Auto ?? true);
  const [adicoesLalur, setAdicoesLalur] = useState(saved?.adicoesLalur ?? 0);
  const [exclusoesLalur, setExclusoesLalur] = useState(saved?.exclusoesLalur ?? 0);

  // DIFAL - Venda interestadual
  const [vendaInterestadual, setVendaInterestadual] = useState(saved?.vendaInterestadual ?? false);
  const [ufOrigem, setUfOrigem] = useState(saved?.ufOrigem || 'SP');
  const [ufDestino, setUfDestino] = useState(saved?.ufDestino || 'RJ');

  // Sublimite UF (for Simples)
  const [estadoEmpresa, setEstadoEmpresa] = useState(saved?.estadoEmpresa || '');

  // Comparação de regimes (collapsible section)
  const [mostrarComparacao, setMostrarComparacao] = useState(saved?.mostrarComparacao ?? false);

  // Sync folha12Meses when usarFolha12Auto is on
  useEffect(() => {
    if (usarFolha12Auto) {
      setFolha12Meses(folhaMensal * 12);
    }
  }, [folhaMensal, usarFolha12Auto]);

  // Persist to localStorage
  const persistState = useCallback(() => {
    const state = {
      regime, receitaMensal, rbt12, anexo, atividadeMEI, tipoAtividade,
      issAliquota, despesasDedutiveis, creditosPisCofins, despesasOperacionais,
      folhaMensal, folha12Meses, usarFolha12Auto, adicoesLalur, exclusoesLalur,
      vendaInterestadual, ufOrigem, ufDestino, estadoEmpresa,
      apuracaoMensal, prejuizoFiscal, mostrarComparacao,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [regime, receitaMensal, rbt12, anexo, atividadeMEI, tipoAtividade, issAliquota,
    despesasDedutiveis, creditosPisCofins, despesasOperacionais, folhaMensal,
    folha12Meses, usarFolha12Auto, adicoesLalur, exclusoesLalur,
    vendaInterestadual, ufOrigem, ufDestino, estadoEmpresa,
    apuracaoMensal, prejuizoFiscal, mostrarComparacao]);

  useEffect(() => { persistState(); }, [persistState]);

  // Fator R calculation
  const fatorR = useMemo(() => {
    if (regime !== 'simples' || rbt12 === 0) return 0;
    return calcFatorR(folha12Meses, rbt12);
  }, [regime, folha12Meses, rbt12]);

  // Effective anexo based on Fator R
  const anexoEfetivo = useMemo(() => {
    if (regime !== 'simples') return anexo;
    return getAnexoPorFatorR(fatorR, anexo);
  }, [regime, fatorR, anexo]);

  // Sublimite check (with UF if provided)
  const sublimite = useMemo(() => {
    if (regime !== 'simples') return { dentroSimples: true, dentroSublimite: true, mensagem: null };
    return checkSublimiteSimples(rbt12, estadoEmpresa || null);
  }, [regime, rbt12, estadoEmpresa]);

  // CPP for Anexo IV
  const cppAnexoIV = useMemo(() => {
    if (regime !== 'simples' || anexoEfetivo !== 'IV') return 0;
    return calcCPPAnexoIV(folhaMensal);
  }, [regime, anexoEfetivo, folhaMensal]);

  // DIFAL calculation
  const difalResult = useMemo(() => {
    if (!vendaInterestadual) return null;
    const valorVenda = regime === 'simples' ? rbt12 / 12 : receitaMensal;
    return calcDIFAL(valorVenda, ufOrigem, ufDestino);
  }, [vendaInterestadual, regime, rbt12, receitaMensal, ufOrigem, ufDestino]);

  // Faixa change alert for Simples Nacional
  const faixaAlert = useMemo(() => {
    if (regime !== 'simples') return null;
    const anexoData = simplesNacional.anexos[anexoEfetivo];
    if (!anexoData) return null;
    const faixas = anexoData.faixas;
    const currentFaixa = faixas.find(f => rbt12 >= f.de && rbt12 <= f.ate);
    if (!currentFaixa) return null;
    const currentIndex = faixas.indexOf(currentFaixa);
    if (currentIndex >= faixas.length - 1) return null;
    const nextFaixa = faixas[currentIndex + 1];
    const distancia = currentFaixa.ate - rbt12;
    const threshold = currentFaixa.ate * 0.10;
    if (distancia > threshold) return null;
    return {
      distancia,
      faixaAtual: currentIndex + 1,
      proximaFaixa: currentIndex + 2,
      aliquotaProximaFaixa: nextFaixa.aliquota,
    };
  }, [regime, rbt12, anexoEfetivo]);

  const receitaMensalEfetiva = regime === 'simples' ? rbt12 / 12 : receitaMensal;

  // Prejuízo fiscal compensation (Lei 9.065/95, Art. 15: limit 30% of taxable profit)
  const prejuizoCompensado = useMemo(() => {
    if (regime !== 'real' || prejuizoFiscal <= 0) return 0;
    const rm = receitaMensal;
    const lucroContabil = rm - despesasDedutiveis;
    const lucroTributavel = lucroContabil + adicoesLalur - exclusoesLalur;
    if (lucroTributavel <= 0) return 0;
    return Math.min(prejuizoFiscal, lucroTributavel * 0.30);
  }, [regime, receitaMensal, despesasDedutiveis, adicoesLalur, exclusoesLalur, prejuizoFiscal]);

  const resultado = useMemo(() => {
    const receitaAnual = regime === 'simples' ? rbt12 : receitaMensal * 12;
    const rm = regime === 'simples' ? rbt12 / 12 : receitaMensal;
    switch (regime) {
      case 'mei': return { tipo: 'mei', data: calcMEI(receitaMensal, atividadeMEI) };
      case 'simples': return { tipo: 'simples', data: calcSimplesTax(receitaAnual, anexoEfetivo) };
      case 'presumido': return { tipo: 'presumido', data: calcLucroPresumido(rm, tipoAtividade, issAliquota / 100) };
      case 'real': {
        if (apuracaoMensal) {
          // Monthly estimation using presunção percentages (like Lucro Presumido)
          const presuncao = lucroPresumido.presuncao[tipoAtividade] || lucroPresumido.presuncao.servicos;
          const baseIRPJ = rm * presuncao.irpj;
          const baseCSLL = rm * presuncao.csll;

          // Apply prejuízo fiscal compensation to the presunção bases
          const baseIRPJAjustada = Math.max(0, baseIRPJ - prejuizoCompensado);
          const baseCSLLAjustada = Math.max(0, baseCSLL - prejuizoCompensado);

          // IRPJ: 15% + additional 10% above R$20k/month
          let irpjMensal = baseIRPJAjustada * lucroReal.irpj.aliquota;
          if (baseIRPJAjustada > lucroReal.irpj.limiteAdicionalMensal) {
            irpjMensal += (baseIRPJAjustada - lucroReal.irpj.limiteAdicionalMensal) * lucroReal.irpj.adicional;
          }

          // CSLL: 9%
          const csllMensal = baseCSLLAjustada * lucroReal.csll.aliquota;

          // PIS/COFINS non-cumulative (same as regular Lucro Real)
          const pisBruto = rm * lucroReal.pis.aliquota;
          const cofinsBruto = rm * lucroReal.cofins.aliquota;
          const creditoPis = creditosPisCofins * lucroReal.pis.aliquota;
          const creditoCofins = creditosPisCofins * lucroReal.cofins.aliquota;
          const pisMensal = Math.max(0, pisBruto - creditoPis);
          const cofinsMensal = Math.max(0, cofinsBruto - creditoCofins);

          // ISS
          const isServico = !['comercio', 'industria', 'transporteCarga', 'revendaCombustiveis'].includes(tipoAtividade);
          const issMensal = isServico ? rm * (issAliquota / 100) : 0;

          const totalMensal = irpjMensal + csllMensal + pisMensal + cofinsMensal + issMensal;

          return {
            tipo: 'real',
            estimativaMensal: true,
            data: {
              regime: 'Lucro Real (Estimativa Mensal)',
              lucroMensal: baseIRPJ, // presunção base for display
              irpj: { baseMensal: baseIRPJAjustada, valorMensal: irpjMensal, temAdicional: baseIRPJAjustada > lucroReal.irpj.limiteAdicionalMensal },
              csll: { baseMensal: baseCSLLAjustada, valorMensal: csllMensal },
              pis: { bruto: pisBruto, creditos: creditoPis, valorMensal: pisMensal },
              cofins: { bruto: cofinsBruto, creditos: creditoCofins, valorMensal: cofinsMensal },
              iss: { aliquota: issAliquota / 100, valorMensal: issMensal },
              totalMensal,
              totalAnual: totalMensal * 12,
              aliquotaEfetiva: rm > 0 ? totalMensal / rm : 0,
              receitaMensal: rm,
              presuncao: presuncao,
              prejuizoCompensado,
            },
          };
        }

        // Standard quarterly Lucro Real with prejuízo fiscal adjustment
        const despesasAjustadas = despesasDedutiveis + prejuizoCompensado;
        const data = calcLucroReal(rm, despesasAjustadas, creditosPisCofins, issAliquota / 100, adicoesLalur, exclusoesLalur);
        if (data) {
          data.prejuizoCompensado = prejuizoCompensado;
        }
        return { tipo: 'real', estimativaMensal: false, data };
      }
      default: return null;
    }
  }, [regime, receitaMensal, rbt12, anexoEfetivo, atividadeMEI, tipoAtividade, issAliquota, despesasDedutiveis, creditosPisCofins, adicoesLalur, exclusoesLalur, apuracaoMensal, prejuizoCompensado]);

  // Validation
  const validationErrors = useMemo(() => {
    const errors = {};
    if (regime !== 'simples' && receitaMensal <= 0) errors.receitaMensal = 'Receita mensal deve ser maior que zero';
    if (regime === 'simples' && rbt12 <= 0) errors.rbt12 = 'RBT12 deve ser maior que zero';
    if (folhaMensal < 0) errors.folhaMensal = 'Folha de pagamento não pode ser negativa';
    if (regime !== 'simples' && rbt12 > 0 && rbt12 < receitaMensal) {
      errors.rbt12Cross = 'RBT12 (faturamento de 12 meses) é menor que 1 mês de receita — valor possivelmente incorreto';
    }
    return errors;
  }, [receitaMensal, rbt12, folhaMensal, regime]);

  const impostoMensalBase = resultado?.data && !resultado.data.excedeLimite && !resultado.data.migracao
    ? (resultado.tipo === 'mei' ? resultado.data.dasFixo : resultado.data.valorMensal || resultado.data.totalMensal || 0)
    : 0;

  // Total tax includes CPP for Anexo IV
  const impostoMensal = impostoMensalBase + cppAnexoIV;

  const lucroLiquido = receitaMensalEfetiva - impostoMensal - despesasOperacionais;

  const showFatorRInfo = regime === 'simples' && anexo === 'V' && fatorR >= 0.28;

  // One-time cleanup of old PlanejamentoTributario localStorage
  useEffect(() => {
    localStorage.removeItem('precificalc_planejamento_tributario');
  }, []);

  // Comparação entre todos os regimes (only calculated when section is open)
  const comparacaoRegimes = useMemo(() => {
    if (!mostrarComparacao) return null;

    const rm = regime === 'simples' ? rbt12 / 12 : receitaMensal;
    const receitaAnual = rm * 12;
    const results = [];

    // MEI
    if (receitaAnual <= mei.limiteAnual) {
      const meiResult = calcMEI(rm, atividadeMEI);
      if (meiResult && !meiResult.excedeLimite) {
        results.push({
          regime: 'MEI',
          regimeKey: 'mei',
          tributoMensal: meiResult.dasFixo,
          tributoAnual: meiResult.dasFixo * 12,
          aliquotaEfetiva: meiResult.aliquotaEfetiva,
        });
      }
    }

    // Simples Nacional
    if (receitaAnual <= simplesNacional.limiteAnual) {
      const simplesResult = calcSimplesTax(receitaAnual, anexoEfetivo);
      if (simplesResult && !simplesResult.excedeLimite && !simplesResult.migracao) {
        let totalMensal = simplesResult.valorMensal;
        // Add CPP for Anexo IV
        if (anexoEfetivo === 'IV') {
          totalMensal += calcCPPAnexoIV(folhaMensal);
        }
        results.push({
          regime: `Simples (${simplesNacional.anexos[anexoEfetivo].nome})`,
          regimeKey: 'simples',
          tributoMensal: totalMensal,
          tributoAnual: totalMensal * 12,
          aliquotaEfetiva: rm > 0 ? totalMensal / rm : 0,
        });
      }
    }

    // Lucro Presumido
    const lpResult = calcLucroPresumido(rm, tipoAtividade, issAliquota / 100);
    if (lpResult && !lpResult.erro) {
      results.push({
        regime: 'Lucro Presumido',
        regimeKey: 'presumido',
        tributoMensal: lpResult.totalMensal,
        tributoAnual: lpResult.totalMensal * 12,
        aliquotaEfetiva: lpResult.aliquotaEfetiva,
      });
    }

    // Lucro Real (fallback 40% despesas, 20% créditos when zero)
    const despLR = despesasDedutiveis > 0 ? despesasDedutiveis : rm * 0.4;
    const credLR = creditosPisCofins > 0 ? creditosPisCofins : rm * 0.2;
    const lrResult = calcLucroReal(rm, despLR, credLR, issAliquota / 100);
    if (lrResult && !lrResult.erro) {
      results.push({
        regime: 'Lucro Real',
        regimeKey: 'real',
        tributoMensal: lrResult.totalMensal,
        tributoAnual: lrResult.totalMensal * 12,
        aliquotaEfetiva: lrResult.aliquotaEfetiva,
      });
    }

    results.sort((a, b) => a.tributoAnual - b.tributoAnual);

    const regimeAtualData = results.find(r => r.regimeKey === regime);
    const melhor = results[0];
    const economiaAnual = regimeAtualData && melhor
      ? regimeAtualData.tributoAnual - melhor.tributoAnual
      : 0;

    return { results, regimeAtualData, melhor, economiaAnual };
  }, [mostrarComparacao, regime, rbt12, receitaMensal, anexoEfetivo, atividadeMEI,
    tipoAtividade, issAliquota, despesasDedutiveis, creditosPisCofins, folhaMensal]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader icon={Calculator} title="Simulador Tributário" description="Calcule a carga tributária da empresa em qualquer regime brasileiro" />
      <DisclaimerBanner />

      {/* Validation warnings */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-700 font-medium">Atenção: valores de entrada podem estar incorretos</p>
            <ul className="text-xs text-amber-600 mt-1 space-y-0.5">
              {Object.values(validationErrors).map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Sublimite warning banner */}
      {sublimite.mensagem && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-amber-700 dark:text-amber-400 font-medium text-sm">Atenção ao Sublimite</p>
            <p className="text-amber-600 dark:text-amber-500 text-sm mt-0.5">{sublimite.mensagem}</p>
          </div>
        </div>
      )}

      {/* Faixa change alert */}
      {faixaAlert && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
          <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-blue-700 dark:text-blue-400 font-medium text-sm">Próximo da mudança de faixa</p>
            <p className="text-blue-600 dark:text-blue-500 text-sm mt-0.5">
              Atenção: mais {formatCurrency(faixaAlert.distancia)} de receita bruta e você muda para a faixa {faixaAlert.proximaFaixa} (alíquota nominal de {formatPercent(faixaAlert.aliquotaProximaFaixa)}).
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><h2 className="text-slate-800 font-medium text-sm">Parâmetros</h2></CardHeader>
          <CardBody className="space-y-4">
            <SelectField label="Regime Tributário" value={regime} onChange={setRegime} options={[
              { value: 'mei', label: 'MEI' },
              { value: 'simples', label: 'Simples Nacional' },
              { value: 'presumido', label: 'Lucro Presumido' },
              { value: 'real', label: 'Lucro Real' },
            ]} />

            {regime === 'simples' ? (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <label className="text-xs font-medium text-slate-600">RBT12 (Faturamento últimos 12 meses)</label>
                  <InfoTip text="RBT12 = Receita Bruta Total dos últimos 12 meses. A Receita Federal usa esse valor para definir em qual faixa do Simples Nacional a empresa se enquadra e qual será a alíquota do tributo." />
                </div>
                <InputField
                  value={rbt12}
                  onChange={setRbt12}
                  prefix="R$"
                  step={10000}
                  min={0}
                  help={`Receita mensal média: ${formatCurrency(rbt12 / 12)}`}
                />
              </div>
            ) : (
              <InputField
                label="Receita Bruta Mensal"
                value={receitaMensal}
                onChange={setReceitaMensal}
                prefix="R$"
                step={1000}
                min={0}
                help={`Anual: ${formatCurrency(receitaMensal * 12)}`}
              />
            )}

            <InputField label="Despesas Operacionais (mensal)" value={despesasOperacionais} onChange={setDespesasOperacionais} prefix="R$" step={1000} min={0} help="Aluguel, folha, insumos, etc." />

            {/* DIFAL - Venda interestadual */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vendaInterestadual}
                  onChange={(e) => setVendaInterestadual(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Venda interestadual?</span>
                <InfoTip text="Se a empresa vende para consumidores finais em outros estados, deve pagar o DIFAL (Diferencial de Alíquota de ICMS). EC 87/2015 + LC 190/2022." />
              </label>
              {vendaInterestadual && (
                <div className="mt-3 space-y-3">
                  <SelectField label="UF de Origem" value={ufOrigem} onChange={setUfOrigem} options={UF_OPTIONS} />
                  <SelectField label="UF de Destino" value={ufDestino} onChange={setUfDestino} options={UF_OPTIONS} />
                </div>
              )}
            </div>

            {regime === 'mei' && (
              <SelectField label="Tipo de Atividade" value={atividadeMEI} onChange={setAtividadeMEI} options={[
                { value: 'comercio', label: 'Comércio / Indústria' },
                { value: 'servicos', label: 'Prestação de Serviços' },
                { value: 'misto', label: 'Comércio + Serviços' },
              ]} help={`DAS fixo: ${formatCurrency(mei.atividades[atividadeMEI]?.das || 0)}/mês`} />
            )}

            {regime === 'simples' && (
              <>
                <SelectField
                  label="Estado da empresa (UF)"
                  value={estadoEmpresa}
                  onChange={setEstadoEmpresa}
                  options={[{ value: '', label: 'Selecione (para sublimite)' }, ...UF_OPTIONS]}
                  help="Define o sublimite estadual de ISS/ICMS no DAS"
                />

                <SelectField label="Anexo do Simples Nacional" value={anexo} onChange={setAnexo}
                  options={Object.entries(simplesNacional.anexos).map(([key, val]) => ({ value: key, label: val.nome }))}
                  help={simplesNacional.anexos[anexo]?.descricao} />

                {/* Folha de Pagamento Mensal */}
                <InputField
                  label="Folha de Pagamento Mensal"
                  value={folhaMensal}
                  onChange={setFolhaMensal}
                  prefix="R$"
                  step={1000}
                  min={0}
                  help="Total da folha de pagamento mensal (salários + encargos)"
                />

                {/* Folha 12 meses */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <label className="block text-xs font-medium text-slate-600">Folha dos Últimos 12 Meses</label>
                    <button
                      onClick={() => setUsarFolha12Auto(!usarFolha12Auto)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${usarFolha12Auto ? 'bg-brand-50 border-brand-200 text-brand-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                    >
                      {usarFolha12Auto ? 'Auto' : 'Manual'}
                    </button>
                  </div>
                  {usarFolha12Auto ? (
                    <p className="text-xs text-slate-400">{formatCurrency(folha12Meses)} (mensal x 12)</p>
                  ) : (
                    <InputField
                      value={folha12Meses}
                      onChange={setFolha12Meses}
                      prefix="R$"
                      step={10000}
                      min={0}
                    />
                  )}
                </div>

                {/* Fator R display */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      Fator R (% da folha sobre faturamento)
                      <InfoTip text="Fator R = total de folha de pagamento dos últimos 12 meses ÷ RBT12. Se o Fator R for ≥ 28%, empresas do Anexo V migram para o Anexo III, pagando menos tributo." />
                    </span>
                    <span className={`text-sm font-semibold font-mono ${fatorR >= 0.28 ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {(fatorR * 100).toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Folha 12m ÷ RBT12 = {formatCurrency(folha12Meses)} ÷ {formatCurrency(rbt12)}
                  </p>
                </div>

                {/* Fator R info: Anexo V -> III */}
                {showFatorRInfo && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-start gap-2">
                    <Info className="text-emerald-500 flex-shrink-0 mt-0.5" size={14} />
                    <p className="text-xs text-emerald-700">
                      Fator R {'>='} 28%: tributação pelo <strong>Anexo III</strong> (mais vantajoso que Anexo V).
                      Alíquotas menores aplicadas automaticamente.
                    </p>
                  </div>
                )}

                {/* Effective anexo note */}
                {anexoEfetivo !== anexo && (
                  <p className="text-xs text-brand-600 font-medium">
                    Anexo efetivo para cálculo: {simplesNacional.anexos[anexoEfetivo]?.nome}
                  </p>
                )}
              </>
            )}

            {(regime === 'presumido' || regime === 'real') && (
              <>
                <SelectField label="Tipo de Atividade" value={tipoAtividade} onChange={setTipoAtividade} options={[
                  { value: 'servicos', label: 'Serviços em Geral' },
                  { value: 'comercio', label: 'Comércio' },
                  { value: 'industria', label: 'Indústria' },
                  { value: 'transporteCarga', label: 'Transporte de Carga' },
                  { value: 'transportePassageiros', label: 'Transporte de Passageiros' },
                  { value: 'servHospitalares', label: 'Serviços Hospitalares' },
                ]} />
                {!['comercio', 'industria', 'transporteCarga'].includes(tipoAtividade) && (
                  <InputField label="Alíquota ISS do Município (%)" value={issAliquota} onChange={setIssAliquota} suffix="%" min={2} max={5} step={0.5} help="Varia de 2% a 5% conforme o município da empresa" />
                )}
              </>
            )}

            {regime === 'real' && (
              <>
                {/* Apuração toggle: Trimestral vs Mensal (estimativa) */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-1">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Apuração</span>
                    <InfoTip text="Trimestral: IRPJ/CSLL sobre lucro real apurado a cada trimestre. Mensal (estimativa): recolhimento mensal usando percentuais de presunção, com ajuste anual via balancete." />
                  </div>
                  <div className="flex rounded-md overflow-hidden border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setApuracaoMensal(false)}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${!apuracaoMensal ? 'bg-brand-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      Trimestral
                    </button>
                    <button
                      onClick={() => setApuracaoMensal(true)}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${apuracaoMensal ? 'bg-brand-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      Mensal (estimativa)
                    </button>
                  </div>
                  {apuracaoMensal && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                      Estimativa mensal baseada em presunção. O ajuste anual é feito via balancete de redução/suspensão.
                    </p>
                  )}
                </div>

                {!apuracaoMensal && (
                  <>
                    <InputField label="Despesas Dedutíveis (mensal)" value={despesasDedutiveis} onChange={setDespesasDedutiveis} prefix="R$" step={1000} help="Despesas dedutíveis para IRPJ/CSLL" />

                    {/* LALUR Fields */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-1">
                      <div className="flex items-center gap-1.5 mb-3">
                        <BookOpen className="text-slate-400" size={14} />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">LALUR (Ajustes do Lucro Real)</span>
                        <InfoTip text="LALUR = Livro de Apuração do Lucro Real. É onde se faz ajustes no lucro contábil para chegar no lucro tributável. Adições aumentam o lucro tributável; exclusões diminuem." />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Adições ao LALUR</label>
                            <InfoTip text="Valores que devem ser SOMADOS ao lucro contábil para fins de tributo. Ex: multas fiscais, despesas não dedutíveis, brindes." />
                          </div>
                          <InputField
                            value={adicoesLalur}
                            onChange={setAdicoesLalur}
                            prefix="R$"
                            step={500}
                            min={0}
                            help="Despesas não dedutíveis, multas, etc."
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Exclusões do LALUR</label>
                            <InfoTip text="Valores que podem ser SUBTRAÍDOS do lucro contábil para fins de tributo. Ex: dividendos recebidos, incentivos fiscais, receitas não tributáveis." />
                          </div>
                          <InputField
                            value={exclusoesLalur}
                            onChange={setExclusoesLalur}
                            prefix="R$"
                            step={500}
                            min={0}
                            help="Receitas não tributáveis, incentivos fiscais"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <InputField label="Base de Créditos PIS/COFINS" value={creditosPisCofins} onChange={setCreditosPisCofins} prefix="R$" step={1000} help="Compras que geram crédito" />

                {/* Prejuízo Fiscal */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-1">
                  <div className="flex items-center gap-1 mb-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Prejuízo fiscal a compensar</label>
                    <InfoTip text="Prejuízo fiscal acumulado de exercícios anteriores. Pode ser compensado com limite de 30% do lucro do período (Lei 9.065/95, Art. 15)." />
                  </div>
                  <InputField
                    value={prejuizoFiscal}
                    onChange={setPrejuizoFiscal}
                    prefix="R$"
                    step={1000}
                    min={0}
                    help="Valor acumulado de prejuízos fiscais anteriores"
                  />
                  {prejuizoCompensado > 0 && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5">
                      Prejuízo compensado: {formatCurrency(prejuizoCompensado)} (limite de 30% do lucro do período)
                    </p>
                  )}
                </div>
              </>
            )}
          </CardBody>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {resultado?.data && !resultado.data.excedeLimite && !resultado.data.migracao && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon={Calculator} label="Tributo Mensal" value={formatCurrency(impostoMensal)} color="red" />
                <StatCard icon={Calculator} label="Tributo Anual" value={formatCurrency(impostoMensal * 12)} color="amber" />
                <StatCard icon={Calculator} label="Alíquota Efetiva" value={formatPercent(impostoMensal / receitaMensalEfetiva)} color="blue" />
                <StatCard icon={Calculator} label="Lucro Líquido" value={formatCurrency(lucroLiquido)} subvalue={`${((lucroLiquido / receitaMensalEfetiva) * 100).toFixed(1)}% da receita`} color={lucroLiquido > 0 ? 'green' : 'red'} />
              </div>

              {/* DIFAL result */}
              {difalResult && difalResult.aplicavel && (
                <Card>
                  <CardHeader><h2 className="text-slate-800 dark:text-slate-200 font-medium text-sm">DIFAL - Diferencial de Alíquota (EC 87/2015)</h2></CardHeader>
                  <CardBody className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Valor da operação</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(difalResult.valorOperacao)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Alíquota interestadual ({difalResult.ufOrigem} → {difalResult.ufDestino})</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono">{formatPercent(difalResult.aliquotaInterestadual)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Alíquota interna {difalResult.ufDestino}</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono">{formatPercent(difalResult.aliquotaInterna)}</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between text-sm">
                      <span className="text-slate-800 dark:text-slate-200 font-medium">DIFAL a recolher</span>
                      <span className="text-red-600 dark:text-red-400 font-bold font-mono">{formatCurrency(difalResult.difal)}</span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">100% destinado ao estado de destino ({difalResult.ufDestino}). Base: {difalResult.baseLegal}</p>
                  </CardBody>
                </Card>
              )}

              {/* CPP Anexo IV Warning */}
              {cppAnexoIV > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="text-amber-700 font-medium text-sm">Anexo IV: CPP recolhido separadamente</p>
                    <p className="text-amber-600 text-sm mt-0.5">
                      CPP (INSS Patronal 20% sobre folha) <strong>NÃO</strong> está incluso no DAS.
                      Recolhimento via GPS: <strong>{formatCurrency(cppAnexoIV)}</strong>/mês.
                    </p>
                  </div>
                </div>
              )}

              <Card>
                <CardHeader><h2 className="text-slate-800 font-medium text-sm">Detalhamento da Carga Tributária</h2></CardHeader>
                <CardBody>
                  {resultado.tipo === 'mei' && (
                    <div className="space-y-2">
                      <Row label="DAS Mensal Fixo" value={formatCurrency(resultado.data.dasFixo)} highlight />
                      <Row label="INSS (5% do salário mínimo)" value={formatCurrency(mei.das.inss)} />
                      <Row label="ISS (se serviços)" value={formatCurrency(mei.das.issServicos)} />
                      <Row label="ICMS (se comércio)" value={formatCurrency(mei.das.icmsComercio)} />
                      <Divider />
                      <Row label="(-) Despesas Operacionais" value={formatCurrency(despesasOperacionais)} negative />
                      <Row label="= Lucro Líquido Mensal" value={formatCurrency(lucroLiquido)} highlight />
                    </div>
                  )}
                  {resultado.tipo === 'simples' && (
                    <div className="space-y-2">
                      <Row label={`Faixa ${resultado.data.faixa} - ${simplesNacional.anexos[anexoEfetivo].nome}`} value="" />
                      <Row label="Alíquota Nominal" value={formatPercent(resultado.data.aliquotaNominal)} />
                      <Row label="Dedução" value={formatCurrency(resultado.data.deducao)} />
                      <Row label="Alíquota Efetiva" value={formatPercent(resultado.data.aliquotaEfetiva)} highlight />
                      <Divider />
                      <Row label="DAS Mensal" value={formatCurrency(resultado.data.valorMensal)} highlight />
                      {cppAnexoIV > 0 && (
                        <>
                          <Row label="CPP via GPS (20% sobre folha)" value={formatCurrency(cppAnexoIV)} sub="Recolhimento à parte - Anexo IV" />
                          <Row label="Total Tributário (DAS + CPP)" value={formatCurrency(resultado.data.valorMensal + cppAnexoIV)} highlight />
                        </>
                      )}
                      <Row label="(-) Despesas Operacionais" value={formatCurrency(despesasOperacionais)} negative />
                      <Row label="= Lucro Líquido Mensal" value={formatCurrency(lucroLiquido)} highlight />
                      <Divider />

                      {/* Fator R summary */}
                      {fatorR > 0 && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">Fator R</span>
                            <span className="text-xs font-mono text-slate-700">{(fatorR * 100).toFixed(2)}%</span>
                          </div>
                          {anexoEfetivo !== anexo && (
                            <p className="text-xs text-brand-600">Anexo efetivo: {simplesNacional.anexos[anexoEfetivo]?.nome}</p>
                          )}
                          <Divider />
                        </>
                      )}

                      <p className="text-xs text-slate-400 mb-2">Distribuição aproximada do DAS:</p>
                      <div className="space-y-1">
                        {Object.entries(simplesNacional.anexos[anexoEfetivo].distribuicaoPorFaixa[resultado.data.faixa - 1]).map(([imposto, pct]) => (
                          <div key={imposto} className="flex items-center text-xs gap-2">
                            <span className="text-slate-500 w-16">{imposto}</span>
                            <span className="text-slate-400 font-mono w-14 text-right">{(pct * 100).toFixed(2)}%</span>
                            <span className="text-slate-700 font-mono ml-auto">{formatCurrency(resultado.data.valorMensal * pct)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {resultado.tipo === 'presumido' && (
                    <div className="space-y-2">
                      <Row label="IRPJ" value={formatCurrency(resultado.data.irpj.valorMensal)} sub={`Base: ${formatCurrency(resultado.data.irpj.baseTrimestral / 3)}/mês`} />
                      <Row label="CSLL" value={formatCurrency(resultado.data.csll.valorMensal)} sub={`Base: ${formatCurrency(resultado.data.csll.baseTrimestral / 3)}/mês`} />
                      <Row label="PIS (0,65% cumulativo)" value={formatCurrency(resultado.data.pis.valorMensal)} />
                      <Row label="COFINS (3,00% cumulativo)" value={formatCurrency(resultado.data.cofins.valorMensal)} />
                      <Row label={`ISS (${issAliquota}%)`} value={formatCurrency(resultado.data.iss.valorMensal)} />
                      <Divider />
                      <Row label="Total Tributos Mensal" value={formatCurrency(resultado.data.totalMensal)} highlight />
                      <Row label="(-) Despesas Operacionais" value={formatCurrency(despesasOperacionais)} negative />
                      <Row label="= Lucro Líquido Mensal" value={formatCurrency(lucroLiquido)} highlight />
                    </div>
                  )}
                  {resultado.tipo === 'real' && resultado.estimativaMensal && (
                    <div className="space-y-2">
                      <div className="px-2 py-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-400 mb-2">
                        Apuração por estimativa mensal (presunção)
                      </div>
                      <Row label="Receita Bruta Mensal" value={formatCurrency(receitaMensalEfetiva)} />
                      <Row label={`Base IRPJ (presunção ${(resultado.data.presuncao.irpj * 100).toFixed(0)}%)`} value={formatCurrency(resultado.data.irpj.baseMensal + resultado.data.prejuizoCompensado)} />
                      <Row label={`Base CSLL (presunção ${(resultado.data.presuncao.csll * 100).toFixed(0)}%)`} value={formatCurrency(resultado.data.csll.baseMensal + resultado.data.prejuizoCompensado)} />
                      {resultado.data.prejuizoCompensado > 0 && (
                        <Row label="(-) Prejuízo compensado (30%)" value={formatCurrency(resultado.data.prejuizoCompensado)} negative />
                      )}
                      <Divider />
                      <Row label="IRPJ (15% + adicional 10%)" value={formatCurrency(resultado.data.irpj.valorMensal)} />
                      <Row label="CSLL (9%)" value={formatCurrency(resultado.data.csll.valorMensal)} />
                      <Row label="PIS (1,65% não-cumulativo)" value={formatCurrency(resultado.data.pis.valorMensal)} sub={`Créditos: ${formatCurrency(resultado.data.pis.creditos)}`} />
                      <Row label="COFINS (7,60% não-cumulativo)" value={formatCurrency(resultado.data.cofins.valorMensal)} sub={`Créditos: ${formatCurrency(resultado.data.cofins.creditos)}`} />
                      <Row label={`ISS (${issAliquota}%)`} value={formatCurrency(resultado.data.iss.valorMensal)} />
                      <Divider />
                      <Row label="Total Tributos Mensal" value={formatCurrency(resultado.data.totalMensal)} highlight />
                      <Row label="(-) Despesas Operacionais" value={formatCurrency(despesasOperacionais)} negative />
                      <Row label="= Lucro Líquido Mensal" value={formatCurrency(lucroLiquido)} highlight />
                    </div>
                  )}
                  {resultado.tipo === 'real' && !resultado.estimativaMensal && (
                    <div className="space-y-2">
                      <Row label="Receita Bruta Mensal" value={formatCurrency(receitaMensalEfetiva)} />
                      <Row label="(-) Despesas Dedutíveis" value={formatCurrency(despesasDedutiveis)} negative />
                      {(adicoesLalur > 0 || exclusoesLalur > 0) && (
                        <>
                          <Row label="(+) Adições LALUR" value={formatCurrency(adicoesLalur)} />
                          <Row label="(-) Exclusões LALUR" value={formatCurrency(exclusoesLalur)} negative />
                        </>
                      )}
                      {resultado.data.prejuizoCompensado > 0 && (
                        <Row label="(-) Prejuízo compensado (30%)" value={formatCurrency(resultado.data.prejuizoCompensado)} negative />
                      )}
                      <Row label="= Lucro Tributável" value={formatCurrency(resultado.data.lucroMensal)} highlight />
                      <Divider />
                      <Row label="IRPJ (15% + adicional 10%)" value={formatCurrency(resultado.data.irpj.valorMensal)} />
                      <Row label="CSLL (9%)" value={formatCurrency(resultado.data.csll.valorMensal)} />
                      <Row label="PIS (1,65% não-cumulativo)" value={formatCurrency(resultado.data.pis.valorMensal)} sub={`Créditos: ${formatCurrency(resultado.data.pis.creditos)}`} />
                      <Row label="COFINS (7,60% não-cumulativo)" value={formatCurrency(resultado.data.cofins.valorMensal)} sub={`Créditos: ${formatCurrency(resultado.data.cofins.creditos)}`} />
                      <Row label={`ISS (${issAliquota}%)`} value={formatCurrency(resultado.data.iss.valorMensal)} />
                      <Divider />
                      <Row label="Total Tributos Mensal" value={formatCurrency(resultado.data.totalMensal)} highlight />
                      <Row label="(-) Despesas Operacionais" value={formatCurrency(despesasOperacionais)} negative />
                      <Row label="= Lucro Líquido Mensal" value={formatCurrency(lucroLiquido)} highlight />
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <p className="text-xs text-slate-500 mb-2">Composição da Receita</p>
                  <div className="flex rounded-md overflow-hidden h-6 bg-slate-200">
                    <div className="bg-red-500 flex items-center justify-center text-[10px] text-white font-medium"
                      style={{ width: `${Math.min((impostoMensal / receitaMensalEfetiva) * 100, 100)}%` }}>
                      {(impostoMensal / receitaMensalEfetiva) > 0.05 && `${((impostoMensal / receitaMensalEfetiva) * 100).toFixed(1)}%`}
                    </div>
                    <div className="bg-amber-500 flex items-center justify-center text-[10px] text-white font-medium"
                      style={{ width: `${Math.min((despesasOperacionais / receitaMensalEfetiva) * 100, 100 - (impostoMensal / receitaMensalEfetiva) * 100)}%` }}>
                      {(despesasOperacionais / receitaMensalEfetiva) > 0.05 && `${((despesasOperacionais / receitaMensalEfetiva) * 100).toFixed(1)}%`}
                    </div>
                    <div className="bg-emerald-500 flex items-center justify-center text-[10px] text-white font-medium flex-1">
                      {((lucroLiquido / receitaMensalEfetiva) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-sm" /> Tributos</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-sm" /> Despesas</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-sm" /> Lucro</span>
                  </div>
                </CardBody>
              </Card>
            </>
          )}

          {resultado?.data?.excedeLimite && (
            <Card>
              <CardBody className="flex items-start gap-3 py-6">
                <AlertTriangle className="text-amber-500 flex-shrink-0" size={24} />
                <div>
                  <h3 className="text-amber-600 font-medium">Limite Excedido</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {regime === 'mei'
                      ? `Receita anual de ${formatCurrency(receitaMensal * 12)} excede o limite do MEI (${formatCurrency(mei.limiteAnual)}). Considere o Simples Nacional.`
                      : `Receita anual de ${formatCurrency(rbt12)} excede o limite do Simples Nacional (${formatCurrency(simplesNacional.limiteAnual)}). Considere Lucro Presumido ou Real.`}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {resultado?.data?.migracao && (
            <Card>
              <CardBody className="flex items-start gap-3 py-6">
                <Info className="text-brand-500 flex-shrink-0" size={24} />
                <div>
                  <h3 className="text-brand-600 font-medium">Migração de Anexo Recomendada</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {resultado.data.observacao}
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Comparar Todos os Regimes - collapsible section */}
      <Card>
        <button
          onClick={() => setMostrarComparacao(!mostrarComparacao)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-brand-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Comparar Todos os Regimes</span>
          </div>
          {mostrarComparacao ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </button>

        {mostrarComparacao && comparacaoRegimes && comparacaoRegimes.results.length > 0 && (
          <CardBody className="pt-0 space-y-4">
            {/* Bar chart */}
            <div role="img" aria-label="Gráfico: tributo anual estimado por regime tributário">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={comparacaoRegimes.results.map(r => ({
                    regime: r.regime.length > 18 ? r.regime.substring(0, 18) + '...' : r.regime,
                    tributoAnual: r.tributoAnual,
                    isMelhor: r === comparacaoRegimes.melhor,
                    isAtual: r.regimeKey === regime,
                  }))}
                  margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="regime" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(v) => {
                      if (v >= 1000000) return `R$${(v / 1000000).toFixed(1)}M`;
                      if (v >= 1000) return `R$${(v / 1000).toFixed(0)}k`;
                      return `R$${v.toFixed(0)}`;
                    }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,.1)' }}
                    formatter={(v) => [formatCurrency(v), 'Tributo anual']}
                  />
                  <Bar dataKey="tributoAnual" radius={[4, 4, 0, 0]}>
                    {comparacaoRegimes.results.map((entry, i) => {
                      let fill = '#cbd5e1';
                      if (entry === comparacaoRegimes.melhor) fill = '#10b981';
                      else if (entry.regimeKey === regime) fill = '#4f46e5';
                      return <Cell key={i} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-sm" /> Melhor</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#4f46e5] rounded-sm" /> Atual</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-300 rounded-sm" /> Outros</span>
            </div>

            {/* Comparison table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">Regime</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">Tributo/mês</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">Tributo/ano</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">Alíq. efetiva</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-slate-500 dark:text-slate-400">Economia vs. atual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {comparacaoRegimes.results.map((s) => {
                    const economiaVsAtual = comparacaoRegimes.regimeAtualData
                      ? comparacaoRegimes.regimeAtualData.tributoAnual - s.tributoAnual
                      : 0;
                    return (
                      <tr
                        key={s.regimeKey}
                        className={s.regimeKey === regime
                          ? 'bg-brand-50 dark:bg-brand-950/20'
                          : s === comparacaoRegimes.melhor
                            ? 'bg-emerald-50 dark:bg-emerald-950/20'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                      >
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{s.regime}</span>
                            {s.regimeKey === regime && (
                              <span className="text-[10px] bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded-full font-medium">atual</span>
                            )}
                            {s === comparacaoRegimes.melhor && (
                              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full font-medium">melhor</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-700 dark:text-slate-300">
                          {formatCurrency(s.tributoMensal)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-medium text-slate-800 dark:text-slate-200">
                          {formatCurrency(s.tributoAnual)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-700 dark:text-slate-300">
                          {formatPercent(s.aliquotaEfetiva)}
                        </td>
                        <td className={`py-2.5 px-2 text-right font-mono font-medium ${economiaVsAtual > 0 ? 'text-emerald-600 dark:text-emerald-400' : economiaVsAtual < 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-400'}`}>
                          {economiaVsAtual > 0 ? '+' : ''}{formatCurrency(economiaVsAtual)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Savings banner */}
            {comparacaoRegimes.economiaAnual > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={24} className="text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Oportunidade de economia</span>
                </div>
                <p className="text-emerald-700 dark:text-emerald-400">
                  Ao migrar para <strong>{comparacaoRegimes.melhor.regime}</strong>, a empresa economizaria{' '}
                  <strong>{formatCurrency(comparacaoRegimes.economiaAnual)}/ano</strong> ({formatCurrency(comparacaoRegimes.economiaAnual / 12)}/mês) em tributos.
                </p>
              </div>
            )}

            {/* Legal notice */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
              <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
              <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                <p><strong>Mudança de regime:</strong> A troca de regime tributário só pode ser feita em janeiro de cada ano (Art. 16, Lei 8.981/1995 para LR/LP; Art. 30, LC 123/2006 para Simples).</p>
                <p>Os valores acima são estimativas. Consulte um contador para análise detalhada antes de decidir.</p>
              </div>
            </div>
          </CardBody>
        )}
      </Card>
    </div>
  );
}

function Row({ label, value, sub, highlight, negative }) {
  return (
    <div>
      <div className="flex justify-between items-center">
        <span className={`text-sm ${highlight ? 'text-slate-800 font-medium' : negative ? 'text-red-500' : 'text-slate-500'}`}>{label}</span>
        <span className={`text-sm font-mono ${highlight ? 'text-slate-800 font-semibold' : negative ? 'text-red-500' : 'text-slate-700'}`}>{value}</span>
      </div>
      {sub && <p className="text-xs text-slate-400 text-right">{sub}</p>}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-slate-200 my-2" />;
}
