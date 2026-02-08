import { useState, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle, ExternalLink } from 'lucide-react';
import { Card, CardBody, CardHeader } from './Card';
import { TermoTecnico, LabelComTermoTecnico } from './TermoTecnico';
import { formatCurrency, formatPercent } from '../data/taxData';

/**
 * Componente para tratamento de produtos monofásicos
 * PIS/COFINS com alíquotas específicas concentradas em uma fase
 */
export function MonophasicProducts({ 
  ncm, 
  precoVenda, 
  regime,
  onMonophasicChange,
  className = '' 
}) {
  const [isMonophasic, setIsMonophasic] = useState(false);
  const [monophasicData, setMonophasicData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lista de NCMs conhecidos como monofásicos (exemplo)
  const MONOPHASIC_NCMS = {
    '27101121': {
      produto: 'Gasolina comum',
      aliquotaPIS: 15.07, // R$/m³
      aliquotaCOFINS: 69.45, // R$/m³
      unidade: 'm³',
      tipo: 'combustivel'
    },
    '27101122': {
      produto: 'Gasolina premium',
      aliquotaPIS: 15.07,
      aliquotaCOFINS: 69.45,
      unidade: 'm³',
      tipo: 'combustivel'
    },
    '27101911': {
      produto: 'Óleo diesel',
      aliquotaPIS: 12.06,
      aliquotaCOFINS: 55.61,
      unidade: 'm³',
      tipo: 'combustivel'
    },
    // Cigarros
    '24021000': {
      produto: 'Cigarros com filtro',
      aliquotaPIS: 2.25, // R$/maço
      aliquotaCOFINS: 10.38, // R$/maço
      unidade: 'maço',
      tipo: 'cigarro'
    },
    // Bebidas
    '22030000': {
      produto: 'Cerveja de malte',
      aliquotaPIS: 2.78, // R$/litro
      aliquotaCOFINS: 12.82, // R$/litro
      unidade: 'litro',
      tipo: 'bebida'
    },
    '22083000': {
      produto: 'Whisky',
      aliquotaPIS: 5.82,
      aliquotaCOFINS: 26.83,
      unidade: 'litro',
      tipo: 'bebida'
    }
  };

  // Verifica se o NCM é monofásico
  useEffect(() => {
    if (!ncm || ncm.length !== 8) {
      setIsMonophasic(false);
      setMonophasicData(null);
      return;
    }

    setLoading(true);
    
    // Simula busca na base de NCMs monofásicos
    setTimeout(() => {
      const monophasicInfo = MONOPHASIC_NCMS[ncm];
      
      if (monophasicInfo) {
        setIsMonophasic(true);
        setMonophasicData(monophasicInfo);
        onMonophasicChange?.(true, monophasicInfo);
      } else {
        setIsMonophasic(false);
        setMonophasicData(null);
        onMonophasicChange?.(false, null);
      }
      
      setLoading(false);
    }, 500);
  }, [ncm, onMonophasicChange]);

  // Cálculo dos impostos monofásicos
  const calculateMonophasicTax = () => {
    if (!isMonophasic || !monophasicData || !precoVenda) return null;

    // Para simplicidade, assume 1 unidade de produto
    // Na prática, seria necessário informar quantidade/volume
    const quantidade = 1;
    const pisValue = monophasicData.aliquotaPIS * quantidade;
    const cofinsValue = monophasicData.aliquotaCOFINS * quantidade;
    const total = pisValue + cofinsValue;
    
    return {
      pis: pisValue,
      cofins: cofinsValue,
      total: total,
      aliquotaEfetiva: precoVenda > 0 ? (total / precoVenda) * 100 : 0
    };
  };

  const taxCalculation = calculateMonophasicTax();

  if (loading) {
    return (
      <Card className={className}>
        <CardBody>
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <div className="animate-spin w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full"></div>
            <span>Verificando se o produto é monofásico...</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!isMonophasic) {
    return (
      <Card className={className}>
        <CardBody>
          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <CheckCircle size={20} className="text-green-500" />
            <div>
              <p className="text-sm font-medium">Produto não-monofásico</p>
              <p className="text-xs">PIS/COFINS seguem alíquotas normais do regime tributário</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Alert de Produto Monofásico */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-400">
              Produto com Tributação Monofásica
            </h4>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
              Este produto tem PIS/COFINS concentrados em uma fase da cadeia produtiva
            </p>
          </div>
        </div>
      </div>

      {/* Informações do Produto */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Informações do Produto Monofásico</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Produto
              </label>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {monophasicData.produto}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Categoria
              </label>
              <p className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                {monophasicData.tipo}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Unidade de Medida
              </label>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {monophasicData.unidade}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Cálculo dos Tributos Monofásicos */}
      {taxCalculation && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Cálculo PIS/COFINS Monofásico</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Alíquotas específicas por unidade do produto
            </p>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {/* Breakdown dos tributos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <TermoTecnico termo="pis">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">PIS</span>
                      </TermoTecnico>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        R$ {monophasicData.aliquotaPIS.toFixed(2)} por {monophasicData.unidade}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                        {formatCurrency(taxCalculation.pis)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <TermoTecnico termo="cofins">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">COFINS</span>
                      </TermoTecnico>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        R$ {monophasicData.aliquotaCOFINS.toFixed(2)} por {monophasicData.unidade}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                        {formatCurrency(taxCalculation.cofins)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Total PIS/COFINS Monofásico
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Alíquota efetiva: {formatPercent(taxCalculation.aliquotaEfetiva)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(taxCalculation.total)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Importante: Observações Legais */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800 dark:text-blue-300">
            <h4 className="font-semibold mb-1">Observações Importantes:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Na tributação monofásica, PIS/COFINS são cobrados apenas do produtor/importador</li>
              <li>Nas demais fases (atacado/varejo) há isenção ou alíquota zero</li>
              <li>As alíquotas são por unidade de medida, não percentuais sobre o preço</li>
              <li>Valores podem ser atualizados pela Receita Federal periodicamente</li>
            </ul>
            <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
              <a 
                href="https://receita.economia.gov.br" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ExternalLink size={12} />
                Consultar tabela atualizada na Receita Federal
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonophasicProducts;