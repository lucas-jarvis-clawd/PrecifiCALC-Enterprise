import { useState, useMemo } from 'react';
import { Calculator, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import {
  calcSimplesTax,
  calcMEI,
  calcLucroPresumido,
  calcLucroReal,
  formatCurrency,
  formatPercent,
  simplesNacional,
  mei,
} from '../data/taxData';

export default function SimuladorTributario() {
  const [regime, setRegime] = useState('simples');
  const [receitaMensal, setReceitaMensal] = useState(50000);
  const [anexo, setAnexo] = useState('III');
  const [atividadeMEI, setAtividadeMEI] = useState('servicos');
  const [tipoAtividade, setTipoAtividade] = useState('servicos');
  const [issAliquota, setIssAliquota] = useState(5);
  const [despesasDedutiveis, setDespesasDedutiveis] = useState(20000);
  const [creditosPisCofins, setCreditosPisCofins] = useState(10000);

  const resultado = useMemo(() => {
    const receitaAnual = receitaMensal * 12;
    switch (regime) {
      case 'mei':
        return { tipo: 'mei', data: calcMEI(receitaMensal, atividadeMEI) };
      case 'simples':
        return { tipo: 'simples', data: calcSimplesTax(receitaAnual, anexo) };
      case 'presumido':
        return { tipo: 'presumido', data: calcLucroPresumido(receitaMensal, tipoAtividade, issAliquota / 100) };
      case 'real':
        return { tipo: 'real', data: calcLucroReal(receitaMensal, despesasDedutiveis, creditosPisCofins, issAliquota / 100) };
      default:
        return null;
    }
  }, [regime, receitaMensal, anexo, atividadeMEI, tipoAtividade, issAliquota, despesasDedutiveis, creditosPisCofins]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Calculator className="text-primary-400" size={28} />
          Simulador Tributário
        </h1>
        <p className="text-dark-400 mt-1">Calcule a carga tributária completa em qualquer regime brasileiro</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-white font-semibold">Parâmetros</h2>
          </CardHeader>
          <CardBody className="space-y-5">
            <SelectField
              label="Regime Tributário"
              value={regime}
              onChange={setRegime}
              options={[
                { value: 'mei', label: 'MEI - Microempreendedor Individual' },
                { value: 'simples', label: 'Simples Nacional' },
                { value: 'presumido', label: 'Lucro Presumido' },
                { value: 'real', label: 'Lucro Real' },
              ]}
            />

            <InputField
              label="Receita Bruta Mensal"
              value={receitaMensal}
              onChange={setReceitaMensal}
              prefix="R$"
              step={1000}
              min={0}
              help={`Anual: ${formatCurrency(receitaMensal * 12)}`}
            />

            {regime === 'mei' && (
              <SelectField
                label="Tipo de Atividade"
                value={atividadeMEI}
                onChange={setAtividadeMEI}
                options={[
                  { value: 'comercio', label: 'Comércio / Indústria' },
                  { value: 'servicos', label: 'Prestação de Serviços' },
                  { value: 'misto', label: 'Comércio + Serviços' },
                ]}
                help={`DAS fixo: ${formatCurrency(mei.atividades[atividadeMEI]?.das || 0)}/mês`}
              />
            )}

            {regime === 'simples' && (
              <SelectField
                label="Anexo do Simples Nacional"
                value={anexo}
                onChange={setAnexo}
                options={Object.entries(simplesNacional.anexos).map(([key, val]) => ({
                  value: key,
                  label: val.nome,
                }))}
                help={simplesNacional.anexos[anexo]?.descricao}
              />
            )}

            {(regime === 'presumido' || regime === 'real') && (
              <>
                <SelectField
                  label="Tipo de Atividade"
                  value={tipoAtividade}
                  onChange={setTipoAtividade}
                  options={[
                    { value: 'servicos', label: 'Serviços em Geral' },
                    { value: 'comercio', label: 'Comércio' },
                    { value: 'industria', label: 'Indústria' },
                    { value: 'transporteCarga', label: 'Transporte de Carga' },
                    { value: 'transportePassageiros', label: 'Transporte de Passageiros' },
                    { value: 'servHospitalares', label: 'Serviços Hospitalares' },
                  ]}
                />
                <InputField
                  label="Alíquota ISS"
                  value={issAliquota}
                  onChange={setIssAliquota}
                  suffix="%"
                  min={2}
                  max={5}
                  step={0.5}
                  help="Varia de 2% a 5% conforme município"
                />
              </>
            )}

            {regime === 'real' && (
              <>
                <InputField
                  label="Despesas Dedutíveis (mensal)"
                  value={despesasDedutiveis}
                  onChange={setDespesasDedutiveis}
                  prefix="R$"
                  step={1000}
                  help="Folha, aluguel, insumos, etc."
                />
                <InputField
                  label="Base de Créditos PIS/COFINS"
                  value={creditosPisCofins}
                  onChange={setCreditosPisCofins}
                  prefix="R$"
                  step={1000}
                  help="Compras que geram crédito"
                />
              </>
            )}

            {/* Quick Info */}
            {regime === 'simples' && simplesNacional.anexos[anexo]?.observacao && (
              <div className="flex gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <Info size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-300/80">{simplesNacional.anexos[anexo].observacao}</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {resultado?.data && !resultado.data.excedeLimite && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  icon={Calculator}
                  label="Imposto Mensal"
                  value={formatCurrency(
                    resultado.tipo === 'mei' ? resultado.data.dasFixo : resultado.data.valorMensal || resultado.data.totalMensal
                  )}
                  color="primary"
                />
                <StatCard
                  icon={Calculator}
                  label="Imposto Anual"
                  value={formatCurrency(
                    resultado.tipo === 'mei' ? resultado.data.dasAnual : resultado.data.valorAnual || resultado.data.totalAnual
                  )}
                  color="blue"
                />
                <StatCard
                  icon={Calculator}
                  label="Alíquota Efetiva"
                  value={formatPercent(resultado.data.aliquotaEfetiva)}
                  color={resultado.data.aliquotaEfetiva < 0.1 ? 'primary' : resultado.data.aliquotaEfetiva < 0.2 ? 'amber' : 'rose'}
                />
              </div>

              {/* Detail Breakdown */}
              <Card>
                <CardHeader>
                  <h2 className="text-white font-semibold">Detalhamento da Carga Tributária</h2>
                </CardHeader>
                <CardBody>
                  {resultado.tipo === 'mei' && (
                    <div className="space-y-3">
                      <DetailRow label="DAS Mensal Fixo" value={formatCurrency(resultado.data.dasFixo)} color="primary" />
                      <DetailRow label="INSS (5% do salário mínimo)" value={formatCurrency(mei.das.inss)} />
                      <DetailRow label="ISS (se serviços)" value={formatCurrency(mei.das.issServicos)} />
                      <DetailRow label="ICMS (se comércio)" value={formatCurrency(mei.das.icmsComercio)} />
                      <div className="border-t border-dark-700/30 pt-3 mt-3">
                        <DetailRow label="Receita Líquida Mensal" value={formatCurrency(receitaMensal - resultado.data.dasFixo)} color="primary" bold />
                      </div>
                    </div>
                  )}

                  {resultado.tipo === 'simples' && (
                    <div className="space-y-3">
                      <DetailRow label={`Faixa ${resultado.data.faixa}ª do ${simplesNacional.anexos[anexo].nome}`} value="" />
                      <DetailRow label="Alíquota Nominal" value={formatPercent(resultado.data.aliquotaNominal)} />
                      <DetailRow label="Dedução" value={formatCurrency(resultado.data.deducao)} />
                      <DetailRow label="Alíquota Efetiva" value={formatPercent(resultado.data.aliquotaEfetiva)} color="primary" bold />
                      <div className="border-t border-dark-700/30 pt-3 mt-3">
                        <DetailRow label="DAS Mensal" value={formatCurrency(resultado.data.valorMensal)} color="primary" bold />
                        <DetailRow label="Receita Líquida Mensal" value={formatCurrency(resultado.data.receitaMensal - resultado.data.valorMensal)} />
                      </div>
                      
                      {/* Distribuição por imposto */}
                      <div className="border-t border-dark-700/30 pt-3 mt-3">
                        <p className="text-sm text-dark-400 mb-3">Distribuição aproximada do DAS:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(simplesNacional.anexos[anexo].distribuicao).map(([imposto, pct]) => (
                            <div key={imposto} className="flex justify-between text-sm">
                              <span className="text-dark-400">{imposto}</span>
                              <span className="text-dark-300">{formatCurrency(resultado.data.valorMensal * pct)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {resultado.tipo === 'presumido' && (
                    <div className="space-y-3">
                      <DetailRow label="IRPJ" value={formatCurrency(resultado.data.irpj.valorMensal)} sub={`Base: ${formatCurrency(resultado.data.irpj.baseTrimestral / 3)}/mês`} />
                      <DetailRow label="CSLL" value={formatCurrency(resultado.data.csll.valorMensal)} sub={`Base: ${formatCurrency(resultado.data.csll.baseTrimestral / 3)}/mês`} />
                      <DetailRow label="PIS (0,65% cumulativo)" value={formatCurrency(resultado.data.pis.valorMensal)} />
                      <DetailRow label="COFINS (3,00% cumulativo)" value={formatCurrency(resultado.data.cofins.valorMensal)} />
                      <DetailRow label={`ISS (${issAliquota}%)`} value={formatCurrency(resultado.data.iss.valorMensal)} />
                      <div className="border-t border-dark-700/30 pt-3 mt-3">
                        <DetailRow label="Total Impostos Mensal" value={formatCurrency(resultado.data.totalMensal)} color="primary" bold />
                        <DetailRow label="Receita Líquida Mensal" value={formatCurrency(receitaMensal - resultado.data.totalMensal)} />
                      </div>
                    </div>
                  )}

                  {resultado.tipo === 'real' && (
                    <div className="space-y-3">
                      <DetailRow label="Receita Bruta Mensal" value={formatCurrency(receitaMensal)} />
                      <DetailRow label="(-) Despesas Dedutíveis" value={formatCurrency(despesasDedutiveis)} color="rose" />
                      <DetailRow label="= Lucro Tributável" value={formatCurrency(resultado.data.lucroMensal)} color="primary" bold />
                      <div className="border-t border-dark-700/30 pt-3 mt-3">
                        <DetailRow label="IRPJ (15% + adicional 10%)" value={formatCurrency(resultado.data.irpj.valorMensal)} />
                        <DetailRow label="CSLL (9%)" value={formatCurrency(resultado.data.csll.valorMensal)} />
                        <DetailRow label="PIS (1,65% não-cumulativo)" value={formatCurrency(resultado.data.pis.valorMensal)} sub={`Créditos: ${formatCurrency(resultado.data.pis.creditos)}`} />
                        <DetailRow label="COFINS (7,60% não-cumulativo)" value={formatCurrency(resultado.data.cofins.valorMensal)} sub={`Créditos: ${formatCurrency(resultado.data.cofins.creditos)}`} />
                        <DetailRow label={`ISS (${issAliquota}%)`} value={formatCurrency(resultado.data.iss.valorMensal)} />
                      </div>
                      <div className="border-t border-dark-700/30 pt-3 mt-3">
                        <DetailRow label="Total Impostos Mensal" value={formatCurrency(resultado.data.totalMensal)} color="primary" bold />
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Visual Bar */}
              <Card>
                <CardBody>
                  <h3 className="text-sm text-dark-400 mb-3">Composição da Receita</h3>
                  <div className="flex rounded-lg overflow-hidden h-8">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-rose-600 flex items-center justify-center text-xs text-white font-medium"
                      style={{ width: `${(resultado.data.aliquotaEfetiva * 100)}%` }}
                    >
                      {resultado.data.aliquotaEfetiva > 0.05 && `${(resultado.data.aliquotaEfetiva * 100).toFixed(1)}%`}
                    </div>
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-xs text-white font-medium flex-1"
                    >
                      {((1 - resultado.data.aliquotaEfetiva) * 100).toFixed(1)}% Líquido
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-dark-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded-full" /> Impostos</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-primary-500 rounded-full" /> Receita Líquida</span>
                  </div>
                </CardBody>
              </Card>
            </>
          )}

          {resultado?.data?.excedeLimite && (
            <Card className="border-rose-500/30">
              <CardBody className="flex items-center gap-4 py-8">
                <AlertTriangle className="text-rose-400" size={40} />
                <div>
                  <h3 className="text-rose-400 font-bold text-lg">Limite Excedido</h3>
                  <p className="text-dark-400 mt-1">
                    {regime === 'mei'
                      ? `A receita anual de ${formatCurrency(receitaMensal * 12)} excede o limite do MEI (${formatCurrency(mei.limiteAnual)}). Considere Simples Nacional.`
                      : `A receita anual de ${formatCurrency(receitaMensal * 12)} excede o limite do Simples Nacional (${formatCurrency(simplesNacional.limiteAnual)}). Considere Lucro Presumido ou Real.`}
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

function DetailRow({ label, value, sub, color, bold }) {
  const colorClasses = {
    primary: 'text-primary-400',
    rose: 'text-rose-400',
    blue: 'text-blue-400',
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <span className={`text-sm ${bold ? 'text-dark-200 font-semibold' : 'text-dark-400'}`}>{label}</span>
        <span className={`text-sm font-mono ${bold ? 'font-bold' : 'font-medium'} ${colorClasses[color] || 'text-dark-200'}`}>
          {value}
        </span>
      </div>
      {sub && <p className="text-xs text-dark-500 text-right">{sub}</p>}
    </div>
  );
}
