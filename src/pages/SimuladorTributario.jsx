import { useState, useMemo, useEffect, useCallback } from 'react';
import { Calculator, AlertTriangle, Info, BookOpen } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import {
  formatCurrency, formatPercent,
  calcSimplesTax, calcLucroPresumido, calcLucroReal, calcMEI,
  simplesNacional, mei,
} from '../data/taxData';

// Defensive imports for functions the other agent is adding
let calcCPPAnexoIV, calcFatorR, getAnexoPorFatorR, checkSublimiteSimples;
try {
  const td = await import('../data/taxData');
  calcCPPAnexoIV = td.calcCPPAnexoIV || ((folha) => folha * 0.20);
  calcFatorR = td.calcFatorR || ((folha12, rbt12) => rbt12 > 0 ? folha12 / rbt12 : 0);
  getAnexoPorFatorR = td.getAnexoPorFatorR || ((fr, anexo) => (fr >= 0.28 && anexo === 'V') ? 'III' : anexo);
  checkSublimiteSimples = td.checkSublimiteSimples || ((rbt12) => {
    const dentroSimples = rbt12 <= 4800000;
    const dentroSublimite = rbt12 <= 3600000;
    let mensagem = null;
    if (!dentroSimples) mensagem = 'Receita excede o limite do Simples Nacional (R$ 4.800.000).';
    else if (!dentroSublimite) mensagem = 'Receita excede o sublimite estadual/municipal (R$ 3.600.000). ISS e ICMS devem ser recolhidos separadamente conforme legislação do estado/município.';
    return { dentroSimples, dentroSublimite, mensagem };
  });
} catch {
  calcCPPAnexoIV = (folha) => folha * 0.20;
  calcFatorR = (folha12, rbt12) => rbt12 > 0 ? folha12 / rbt12 : 0;
  getAnexoPorFatorR = (fr, anexo) => (fr >= 0.28 && anexo === 'V') ? 'III' : anexo;
  checkSublimiteSimples = (rbt12) => {
    const dentroSimples = rbt12 <= 4800000;
    const dentroSublimite = rbt12 <= 3600000;
    let mensagem = null;
    if (!dentroSimples) mensagem = 'Receita excede o limite do Simples Nacional (R$ 4.800.000).';
    else if (!dentroSublimite) mensagem = 'Receita excede o sublimite estadual/municipal (R$ 3.600.000). ISS e ICMS devem ser recolhidos separadamente conforme legislação do estado/município.';
    return { dentroSimples, dentroSublimite, mensagem };
  };
}

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

  // New fields: Folha / Fator R / LALUR
  const [folhaMensal, setFolhaMensal] = useState(saved?.folhaMensal ?? 10000);
  const [folha12Meses, setFolha12Meses] = useState(saved?.folha12Meses ?? 120000);
  const [usarFolha12Auto, setUsarFolha12Auto] = useState(saved?.usarFolha12Auto ?? true);
  const [adicoesLalur, setAdicoesLalur] = useState(saved?.adicoesLalur ?? 0);
  const [exclusoesLalur, setExclusoesLalur] = useState(saved?.exclusoesLalur ?? 0);

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
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [regime, receitaMensal, rbt12, anexo, atividadeMEI, tipoAtividade, issAliquota,
    despesasDedutiveis, creditosPisCofins, despesasOperacionais, folhaMensal,
    folha12Meses, usarFolha12Auto, adicoesLalur, exclusoesLalur]);

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

  // Sublimite check
  const sublimite = useMemo(() => {
    if (regime !== 'simples') return { dentroSimples: true, dentroSublimite: true, mensagem: null };
    return checkSublimiteSimples(rbt12);
  }, [regime, rbt12]);

  // CPP for Anexo IV
  const cppAnexoIV = useMemo(() => {
    if (regime !== 'simples' || anexoEfetivo !== 'IV') return 0;
    return calcCPPAnexoIV(folhaMensal);
  }, [regime, anexoEfetivo, folhaMensal]);

  const receitaMensalEfetiva = regime === 'simples' ? rbt12 / 12 : receitaMensal;

  const resultado = useMemo(() => {
    const receitaAnual = regime === 'simples' ? rbt12 : receitaMensal * 12;
    const rm = regime === 'simples' ? rbt12 / 12 : receitaMensal;
    switch (regime) {
      case 'mei': return { tipo: 'mei', data: calcMEI(receitaMensal, atividadeMEI) };
      case 'simples': return { tipo: 'simples', data: calcSimplesTax(receitaAnual, anexoEfetivo) };
      case 'presumido': return { tipo: 'presumido', data: calcLucroPresumido(rm, tipoAtividade, issAliquota / 100) };
      case 'real': return { tipo: 'real', data: calcLucroReal(rm, despesasDedutiveis, creditosPisCofins, issAliquota / 100, adicoesLalur, exclusoesLalur) };
      default: return null;
    }
  }, [regime, receitaMensal, rbt12, anexoEfetivo, atividadeMEI, tipoAtividade, issAliquota, despesasDedutiveis, creditosPisCofins, adicoesLalur, exclusoesLalur]);

  const impostoMensalBase = resultado?.data && !resultado.data.excedeLimite && !resultado.data.migracao
    ? (resultado.tipo === 'mei' ? resultado.data.dasFixo : resultado.data.valorMensal || resultado.data.totalMensal || 0)
    : 0;

  // Total tax includes CPP for Anexo IV
  const impostoMensal = impostoMensalBase + cppAnexoIV;

  const lucroLiquido = receitaMensalEfetiva - impostoMensal - despesasOperacionais;

  const showFatorRInfo = regime === 'simples' && anexo === 'V' && fatorR >= 0.28;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Calculator className="text-brand-600" size={22} />
          Simulador Tributário
        </h1>
        <p className="text-slate-500 text-sm mt-1">Calcule a carga tributária completa em qualquer regime brasileiro</p>
      </div>

      {/* Sublimite warning banner */}
      {sublimite.mensagem && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-amber-700 font-medium text-sm">Atenção ao Sublimite</p>
            <p className="text-amber-600 text-sm mt-0.5">{sublimite.mensagem}</p>
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
              <InputField
                label="Receita Bruta dos Últimos 12 Meses (RBT12)"
                value={rbt12}
                onChange={setRbt12}
                prefix="R$"
                step={10000}
                min={0}
                help={`Receita mensal média: ${formatCurrency(rbt12 / 12)}`}
              />
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

            {regime === 'mei' && (
              <SelectField label="Tipo de Atividade" value={atividadeMEI} onChange={setAtividadeMEI} options={[
                { value: 'comercio', label: 'Comércio / Indústria' },
                { value: 'servicos', label: 'Prestação de Serviços' },
                { value: 'misto', label: 'Comércio + Serviços' },
              ]} help={`DAS fixo: ${formatCurrency(mei.atividades[atividadeMEI]?.das || 0)}/mês`} />
            )}

            {regime === 'simples' && (
              <>
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
                    <span className="text-xs font-medium text-slate-600">Fator R</span>
                    <span className={`text-sm font-semibold font-mono ${fatorR >= 0.28 ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {(fatorR * 100).toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Folha 12m / RBT12 = {formatCurrency(folha12Meses)} / {formatCurrency(rbt12)}
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
                <InputField label="Alíquota ISS do Município (%)" value={issAliquota} onChange={setIssAliquota} suffix="%" min={2} max={5} step={0.5} help="Varia de 2% a 5% conforme município" />
              </>
            )}

            {regime === 'real' && (
              <>
                <InputField label="Despesas Dedutíveis (mensal)" value={despesasDedutiveis} onChange={setDespesasDedutiveis} prefix="R$" step={1000} help="Despesas dedutíveis para IRPJ/CSLL" />
                <InputField label="Base de Créditos PIS/COFINS" value={creditosPisCofins} onChange={setCreditosPisCofins} prefix="R$" step={1000} help="Compras que geram crédito" />

                {/* LALUR Fields */}
                <div className="border-t border-slate-200 pt-3 mt-1">
                  <div className="flex items-center gap-1.5 mb-3">
                    <BookOpen className="text-slate-400" size={14} />
                    <span className="text-xs font-medium text-slate-600">Ajustes do LALUR</span>
                  </div>
                  <div className="space-y-3">
                    <InputField
                      label="Adições ao LALUR (R$)"
                      value={adicoesLalur}
                      onChange={setAdicoesLalur}
                      prefix="R$"
                      step={500}
                      min={0}
                      help="Despesas não dedutíveis, multas, etc."
                    />
                    <InputField
                      label="Exclusões do LALUR (R$)"
                      value={exclusoesLalur}
                      onChange={setExclusoesLalur}
                      prefix="R$"
                      step={500}
                      min={0}
                      help="Receitas não tributáveis, incentivos fiscais"
                    />
                  </div>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {resultado?.data && !resultado.data.excedeLimite && !resultado.data.migracao && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon={Calculator} label="Imposto Mensal" value={formatCurrency(impostoMensal)} color="red" />
                <StatCard icon={Calculator} label="Imposto Anual" value={formatCurrency(impostoMensal * 12)} color="amber" />
                <StatCard icon={Calculator} label="Alíquota Efetiva" value={formatPercent(impostoMensal / receitaMensalEfetiva)} color="blue" />
                <StatCard icon={Calculator} label="Lucro Líquido" value={formatCurrency(lucroLiquido)} subvalue={`${((lucroLiquido / receitaMensalEfetiva) * 100).toFixed(1)}% da receita`} color={lucroLiquido > 0 ? 'green' : 'red'} />
              </div>

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
                      <div className="grid grid-cols-2 gap-1">
                        {Object.entries(simplesNacional.anexos[anexoEfetivo].distribuicao).map(([imposto, pct]) => (
                          <div key={imposto} className="flex justify-between text-xs">
                            <span className="text-slate-500">{imposto}</span>
                            <span className="text-slate-700 font-mono">{formatCurrency(resultado.data.valorMensal * pct)}</span>
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
                      <Row label="Total Impostos Mensal" value={formatCurrency(resultado.data.totalMensal)} highlight />
                      <Row label="(-) Despesas Operacionais" value={formatCurrency(despesasOperacionais)} negative />
                      <Row label="= Lucro Líquido Mensal" value={formatCurrency(lucroLiquido)} highlight />
                    </div>
                  )}
                  {resultado.tipo === 'real' && (
                    <div className="space-y-2">
                      <Row label="Receita Bruta Mensal" value={formatCurrency(receitaMensalEfetiva)} />
                      <Row label="(-) Despesas Dedutíveis" value={formatCurrency(despesasDedutiveis)} negative />
                      {(adicoesLalur > 0 || exclusoesLalur > 0) && (
                        <>
                          <Row label="(+) Adições LALUR" value={formatCurrency(adicoesLalur)} />
                          <Row label="(-) Exclusões LALUR" value={formatCurrency(exclusoesLalur)} negative />
                        </>
                      )}
                      <Row label="= Lucro Tributável" value={formatCurrency(resultado.data.lucroMensal)} highlight />
                      <Divider />
                      <Row label="IRPJ (15% + adicional 10%)" value={formatCurrency(resultado.data.irpj.valorMensal)} />
                      <Row label="CSLL (9%)" value={formatCurrency(resultado.data.csll.valorMensal)} />
                      <Row label="PIS (1,65% não-cumulativo)" value={formatCurrency(resultado.data.pis.valorMensal)} sub={`Créditos: ${formatCurrency(resultado.data.pis.creditos)}`} />
                      <Row label="COFINS (7,60% não-cumulativo)" value={formatCurrency(resultado.data.cofins.valorMensal)} sub={`Créditos: ${formatCurrency(resultado.data.cofins.creditos)}`} />
                      <Row label={`ISS (${issAliquota}%)`} value={formatCurrency(resultado.data.iss.valorMensal)} />
                      <Divider />
                      <Row label="Total Impostos Mensal" value={formatCurrency(resultado.data.totalMensal)} highlight />
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
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-sm" /> Impostos</span>
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
