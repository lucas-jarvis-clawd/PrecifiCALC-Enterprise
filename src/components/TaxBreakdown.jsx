import { useMemo } from 'react';
import { Receipt, AlertTriangle, Info, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardBody, CardHeader } from './Card';
import { TermoTecnico, LabelComTermoTecnico } from './TermoTecnico';
import { formatCurrency, formatPercent } from '../data/taxData';

/**
 * Componente para breakdown detalhado dos impostos por NCM
 * Mostra cálculo específico baseado na classificação fiscal
 */
export function TaxBreakdown({ 
  ncm, 
  regime, 
  precoVenda, 
  custoTotal, 
  dadosEmpresa = {}, 
  className = '' 
}) {
  
  // Calcula breakdown dos impostos baseado no NCM e regime
  const taxCalculation = useMemo(() => {
    if (!ncm || !precoVenda) {
      return null;
    }

    const receita = parseFloat(precoVenda) || 0;
    const custo = parseFloat(custoTotal) || 0;
    const margem = receita - custo;
    
    // TODO: Implementar cálculos específicos por NCM quando disponível
    // Por enquanto, usa cálculos padrão com placeholders para diferenças por NCM
    
    let impostos = {
      federal: [],
      estadual: [],
      municipal: [],
      total: 0,
      aliquotaEfetiva: 0,
      observacoes: []
    };

    if (regime === 'simples') {
      // Simples Nacional - alíquota única que varia por faixa e anexo
      const rbt12 = dadosEmpresa.rbt12 || 0;
      const faixa = getFaixaSimples(rbt12);
      const aliquota = faixa.aliquota || 8; // Default 8%
      
      const impostoSimples = receita * (aliquota / 100);
      
      impostos.federal.push({
        nome: 'DAS - Simples Nacional',
        base: receita,
        aliquota: aliquota,
        valor: impostoSimples,
        descricao: `Faixa ${faixa.numero} - RBT12: ${formatCurrency(rbt12)}`
      });
      
      impostos.total = impostoSimples;
      
      // Observação sobre ICMS/IPI incluídos no DAS
      impostos.observacoes.push({
        tipo: 'info',
        texto: 'ICMS e IPI já estão incluídos na alíquota unificada do DAS (Simples Nacional)'
      });

      // Verificar se NCM tem tratamento especial no Simples
      if (isNCMComTratamentoEspecial(ncm)) {
        impostos.observacoes.push({
          tipo: 'warning',
          texto: 'Este NCM pode ter alíquotas diferenciadas no Simples Nacional'
        });
      }
      
    } else if (regime === 'presumido') {
      // Lucro Presumido - cálculos separados por imposto
      const presumedProfit = receita * 0.32; // 32% para serviços, varia por atividade

      // PIS/COFINS
      const pis = receita * 0.0065;
      const cofins = receita * 0.03;

      // IRPJ/CSLL sobre lucro presumido
      const irpj = presumedProfit * 0.15;
      const csll = presumedProfit * 0.09;

      impostos.federal.push(
        { nome: 'PIS', base: receita, aliquota: 0.65, valor: pis },
        { nome: 'COFINS', base: receita, aliquota: 3.0, valor: cofins },
        { nome: 'IRPJ', base: presumedProfit, aliquota: 15, valor: irpj },
        { nome: 'CSLL', base: presumedProfit, aliquota: 9, valor: csll }
      );

      // IPI (federal)
      const ipiAliq = dadosEmpresa.aliquotaIPI || 0;
      if (ipiAliq > 0) {
        const ipi = receita * (ipiAliq / 100);
        impostos.federal.push({ nome: 'IPI', base: receita, aliquota: ipiAliq, valor: ipi });
        impostos.total += ipi;
      }

      // ICMS (estadual)
      const icmsAliq = dadosEmpresa.aliquotaICMS || 0;
      if (icmsAliq > 0) {
        const icms = receita * (icmsAliq / 100);
        impostos.estadual.push({
          nome: `ICMS (${dadosEmpresa.uf || 'UF'})`,
          base: receita,
          aliquota: icmsAliq,
          valor: icms
        });
        impostos.total += icms;
      }

      // ISS (municipal)
      const issAliquota = dadosEmpresa.issAliquota || 5;
      const iss = receita * (issAliquota / 100);

      impostos.municipal.push({
        nome: 'ISS',
        base: receita,
        aliquota: issAliquota,
        valor: iss
      });

      impostos.total += pis + cofins + irpj + csll + iss;

      // Verificar benefícios por NCM
      if (hasNCMBenefits(ncm)) {
        impostos.observacoes.push({
          tipo: 'info',
          texto: 'Este NCM pode ter benefícios fiscais específicos'
        });
      }

    } else if (regime === 'real') {
      // Lucro Real - impostos sobre lucro efetivo
      const lucroReal = margem; // Simplificado

      // PIS/COFINS (com possibilidade de créditos)
      const pisReal = receita * 0.0165;
      const cofinsReal = receita * 0.076;

      impostos.federal.push(
        { nome: 'PIS', base: receita, aliquota: 1.65, valor: pisReal },
        { nome: 'COFINS', base: receita, aliquota: 7.6, valor: cofinsReal }
      );

      // IPI (federal)
      const ipiAliq = dadosEmpresa.aliquotaIPI || 0;
      if (ipiAliq > 0) {
        const ipi = receita * (ipiAliq / 100);
        impostos.federal.push({ nome: 'IPI', base: receita, aliquota: ipiAliq, valor: ipi });
        impostos.total += ipi;
      }

      // IRPJ/CSLL apenas se houver lucro
      if (lucroReal > 0) {
        const irpjReal = lucroReal * 0.15;
        const csllReal = lucroReal * 0.09;

        impostos.federal.push(
          { nome: 'IRPJ', base: lucroReal, aliquota: 15, valor: irpjReal },
          { nome: 'CSLL', base: lucroReal, aliquota: 9, valor: csllReal }
        );

        impostos.total += irpjReal + csllReal;
      }

      // ICMS (estadual)
      const icmsAliq = dadosEmpresa.aliquotaICMS || 0;
      if (icmsAliq > 0) {
        const icms = receita * (icmsAliq / 100);
        impostos.estadual.push({
          nome: `ICMS (${dadosEmpresa.uf || 'UF'})`,
          base: receita,
          aliquota: icmsAliq,
          valor: icms
        });
        impostos.total += icms;
      }

      impostos.total += pisReal + cofinsReal;

      // Adicionar observação sobre créditos
      impostos.observacoes.push({
        tipo: 'info',
        texto: 'No Lucro Real há possibilidade de créditos de PIS/COFINS sobre custos'
      });
    }
    
    impostos.aliquotaEfetiva = receita > 0 ? (impostos.total / receita) * 100 : 0;
    
    return impostos;
  }, [ncm, regime, precoVenda, custoTotal, dadosEmpresa]);

  if (!taxCalculation) {
    return (
      <Card className={className}>
        <CardBody>
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Receipt size={48} className="mx-auto mb-4 opacity-50" />
            <p>Informe NCM e preço para ver o breakdown tributário</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Receipt size={20} />
          Breakdown Tributário por NCM
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Tributos específicos para NCM {ncm} no regime {regime}
        </p>
      </CardHeader>
      
      <CardBody>
        {/* Resumo da Alíquota Efetiva */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <TermoTecnico termo="aliquotaEfetiva">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Alíquota Efetiva Total
                </span>
              </TermoTecnico>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Percentual real de tributos sobre a receita
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatPercent(taxCalculation.aliquotaEfetiva)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {formatCurrency(taxCalculation.total)} de tributos
              </div>
            </div>
          </div>
        </div>

        {/* Tributos Federais */}
        {taxCalculation.federal.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Tributos Federais
            </h4>
            <div className="space-y-2">
              {taxCalculation.federal.map((imposto, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {imposto.nome}
                    </span>
                    {imposto.descricao && (
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {imposto.descricao}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(imposto.valor)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {formatPercent(imposto.aliquota)} sobre {formatCurrency(imposto.base)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tributos Estaduais */}
        {taxCalculation.estadual.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Tributos Estaduais
            </h4>
            <div className="space-y-2">
              {taxCalculation.estadual.map((imposto, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {imposto.nome}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(imposto.valor)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {formatPercent(imposto.aliquota)} sobre {formatCurrency(imposto.base)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tributos Municipais */}
        {taxCalculation.municipal.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Tributos Municipais
            </h4>
            <div className="space-y-2">
              {taxCalculation.municipal.map((imposto, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {imposto.nome}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(imposto.valor)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {formatPercent(imposto.aliquota)} sobre {formatCurrency(imposto.base)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observações e Alertas */}
        {taxCalculation.observacoes.length > 0 && (
          <div className="space-y-2">
            {taxCalculation.observacoes.map((obs, index) => (
              <div key={index} className={`
                flex items-start gap-2 p-3 rounded-lg text-xs
                ${obs.tipo === 'warning' 
                  ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                  : 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                }
              `}>
                {obs.tipo === 'warning' ? (
                  <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                ) : (
                  <Info size={14} className="mt-0.5 flex-shrink-0" />
                )}
                <span>{obs.texto}</span>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// Helper functions (placeholders para implementação futura)
function getFaixaSimples(rbt12) {
  // Simplificado - implementar tabelas completas do Simples Nacional
  if (rbt12 <= 180000) return { numero: 1, aliquota: 4 };
  if (rbt12 <= 360000) return { numero: 2, aliquota: 7.3 };
  if (rbt12 <= 720000) return { numero: 3, aliquota: 9.5 };
  if (rbt12 <= 1800000) return { numero: 4, aliquota: 10.7 };
  return { numero: 5, aliquota: 14 };
}

function isNCMComTratamentoEspecial(ncm) {
  // TODO: Implementar verificação real baseada na tabela de NCM
  return false;
}

function hasNCMBenefits(ncm) {
  // TODO: Implementar verificação de benefícios por NCM
  return false;
}

export default TaxBreakdown;