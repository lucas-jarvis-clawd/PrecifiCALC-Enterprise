import { useState, useMemo } from 'react';
import { Calculator, AlertTriangle } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import {
  calcSimplesTax, calcMEI, calcLucroPresumido, calcLucroReal,
  formatCurrency, formatPercent, simplesNacional, mei,
} from '../data/taxData';

export default function SimuladorTributario() {
  const [regime, setRegime] = useState('simples');
  const [receitaMensal, setReceitaMensal] = useState(50000);
  const [rbt12, setRbt12] = useState(600000);
  const [anexo, setAnexo] = useState('III');
  const [atividadeMEI, setAtividadeMEI] = useState('servicos');
  const [tipoAtividade, setTipoAtividade] = useState('servicos');
  const [issAliquota, setIssAliquota] = useState(5);
  const [despesasDedutiveis, setDespesasDedutiveis] = useState(20000);
  const [creditosPisCofins, setCreditosPisCofins] = useState(10000);
  const [despesasOperacionais, setDespesasOperacionais] = useState(15000);

  const receitaMensalEfetiva = regime === 'simples' ? rbt12 / 12 : receitaMensal;

  const resultado = useMemo(() => {
    const receitaAnual = regime === 'simples' ? rbt12 : receitaMensal * 12;
    const rm = regime === 'simples' ? rbt12 / 12 : receitaMensal;
    switch (regime) {
      case 'mei': return { tipo: 'mei', data: calcMEI(receitaMensal, atividadeMEI) };
      case 'simples': return { tipo: 'simples', data: calcSimplesTax(receitaAnual, anexo) };
      case 'presumido': return { tipo: 'presumido', data: calcLucroPresumido(rm, tipoAtividade, issAliquota / 100) };
      case 'real': return { tipo: 'real', data: calcLucroReal(rm, despesasDedutiveis, creditosPisCofins, issAliquota / 100) };
      default: return null;
    }
  }, [regime, receitaMensal, rbt12, anexo, atividadeMEI, tipoAtividade, issAliquota, despesasDedutiveis, creditosPisCofins]);

  const impostoMensal = resultado?.data && !resultado.data.excedeLimite
    ? (resultado.tipo === 'mei' ? resultado.data.dasFixo : resultado.data.valorMensal || resultado.data.totalMensal || 0)
    : 0;

  const lucroLiquido = receitaMensalEfetiva - impostoMensal - despesasOperacionais;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Calculator className="text-brand-600" size={22} />
          Simulador Tributário
        </h1>
        <p className="text-slate-500 text-sm mt-1">Calcule a carga tributária completa em qualquer regime brasileiro</p>
      </div>

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
              <SelectField label="Anexo do Simples Nacional" value={anexo} onChange={setAnexo}
                options={Object.entries(simplesNacional.anexos).map(([key, val]) => ({ value: key, label: val.nome }))}
                help={simplesNacional.anexos[anexo]?.descricao} />
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
                <InputField label="Alíquota ISS" value={issAliquota} onChange={setIssAliquota} suffix="%" min={2} max={5} step={0.5} help="Varia de 2% a 5% conforme município" />
              </>
            )}

            {regime === 'real' && (
              <>
                <InputField label="Despesas Dedutíveis (mensal)" value={despesasDedutiveis} onChange={setDespesasDedutiveis} prefix="R$" step={1000} help="Despesas dedutíveis para IRPJ/CSLL" />
                <InputField label="Base de Créditos PIS/COFINS" value={creditosPisCofins} onChange={setCreditosPisCofins} prefix="R$" step={1000} help="Compras que geram crédito" />
              </>
            )}
          </CardBody>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {resultado?.data && !resultado.data.excedeLimite && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon={Calculator} label="Imposto Mensal" value={formatCurrency(impostoMensal)} color="red" />
                <StatCard icon={Calculator} label="Imposto Anual" value={formatCurrency(impostoMensal * 12)} color="amber" />
                <StatCard icon={Calculator} label="Alíquota Efetiva" value={formatPercent(resultado.data.aliquotaEfetiva)} color="blue" />
                <StatCard icon={Calculator} label="Lucro Líquido" value={formatCurrency(lucroLiquido)} subvalue={`${((lucroLiquido / receitaMensalEfetiva) * 100).toFixed(1)}% da receita`} color={lucroLiquido > 0 ? 'green' : 'red'} />
              </div>

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
                      <Row label={`Faixa ${resultado.data.faixa} - ${simplesNacional.anexos[anexo].nome}`} value="" />
                      <Row label="Alíquota Nominal" value={formatPercent(resultado.data.aliquotaNominal)} />
                      <Row label="Dedução" value={formatCurrency(resultado.data.deducao)} />
                      <Row label="Alíquota Efetiva" value={formatPercent(resultado.data.aliquotaEfetiva)} highlight />
                      <Divider />
                      <Row label="DAS Mensal" value={formatCurrency(resultado.data.valorMensal)} highlight />
                      <Row label="(-) Despesas Operacionais" value={formatCurrency(despesasOperacionais)} negative />
                      <Row label="= Lucro Líquido Mensal" value={formatCurrency(lucroLiquido)} highlight />
                      <Divider />
                      <p className="text-xs text-slate-400 mb-2">Distribuição aproximada do DAS:</p>
                      <div className="grid grid-cols-2 gap-1">
                        {Object.entries(simplesNacional.anexos[anexo].distribuicao).map(([imposto, pct]) => (
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
                      style={{ width: `${Math.min((resultado.data.aliquotaEfetiva || 0) * 100, 100)}%` }}>
                      {resultado.data.aliquotaEfetiva > 0.05 && `${(resultado.data.aliquotaEfetiva * 100).toFixed(1)}%`}
                    </div>
                    <div className="bg-amber-500 flex items-center justify-center text-[10px] text-white font-medium"
                      style={{ width: `${Math.min((despesasOperacionais / receitaMensalEfetiva) * 100, 100 - (resultado.data.aliquotaEfetiva || 0) * 100)}%` }}>
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
