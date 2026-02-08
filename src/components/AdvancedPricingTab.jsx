import { useState, useEffect, useMemo } from 'react';
import { Calculator, Zap, TrendingUp, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from './Card';
import InputField, { SelectField } from './InputField';
import { LabelComTermoTecnico } from './TermoTecnico';
import NCMInput from './NCMInput';
import TaxBreakdown from './TaxBreakdown';
import MonophasicProducts from './MonophasicProducts';
import { CalculationLoader } from './LoadingStates';
import { formatCurrency, formatPercent } from '../data/taxData';

/**
 * Componente principal da aba "Precificação Avançada"
 * Inclui análise por NCM e cálculos tributários específicos
 */
export function AdvancedPricingTab({ className = '' }) {
  // Estados principais
  const [ncm, setNCM] = useState('');
  const [tipoProduto, setTipoProduto] = useState('produto'); // produto | servico
  const [custoProduto, setCustoProduto] = useState(100);
  const [despesasFixas, setDespesasFixas] = useState(5000);
  const [quantidadeMensal, setQuantidadeMensal] = useState(100);
  const [margemDesejada, setMargemDesejada] = useState(30);
  const [regime, setRegime] = useState('simples');

  // Estados para localização e alíquotas manuais
  const [uf, setUf] = useState('SP');
  const [aliquotaICMS, setAliquotaICMS] = useState(18);
  const [aliquotaIPI, setAliquotaIPI] = useState(0);

  // Estados específicos para NCM
  const [isMonophasic, setIsMonophasic] = useState(false);
  const [monophasicData, setMonophasicData] = useState(null);
  const [calculando, setCalculando] = useState(false);

  // Dados da empresa (derivados dos estados editáveis)
  const dadosEmpresa = {
    rbt12: 600000,
    anexo: 'III',
    tipoAtividade: 'servicos',
    issAliquota: 5,
    folhaMensal: 20000,
    cidade: 'São Paulo',
    uf,
    aliquotaICMS,
    aliquotaIPI
  };

  // Persistência no localStorage
  const LS_KEY = 'precificalc_precificacao_avancada';
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setNCM(data.ncm || '');
        setTipoProduto(data.tipoProduto || 'produto');
        setCustoProduto(data.custoProduto || 100);
        setDespesasFixas(data.despesasFixas || 5000);
        setQuantidadeMensal(data.quantidadeMensal || 100);
        setMargemDesejada(data.margemDesejada || 30);
        setRegime(data.regime || 'simples');
        if (data.uf) setUf(data.uf);
        if (data.aliquotaICMS !== undefined) setAliquotaICMS(data.aliquotaICMS);
        if (data.aliquotaIPI !== undefined) setAliquotaIPI(data.aliquotaIPI);
      }
    } catch (error) {
      console.error('Erro ao carregar dados salvos:', error);
    }
  }, []);

  // Salvar dados quando mudarem
  useEffect(() => {
    const dataToSave = {
      ncm,
      tipoProduto,
      custoProduto,
      despesasFixas,
      quantidadeMensal,
      margemDesejada,
      regime,
      uf,
      aliquotaICMS,
      aliquotaIPI,
      lastUpdated: new Date().toISOString()
    };

    try {
      localStorage.setItem(LS_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  }, [ncm, tipoProduto, custoProduto, despesasFixas, quantidadeMensal, margemDesejada, regime, uf, aliquotaICMS, aliquotaIPI]);

  // Cálculo principal de precificação
  const calculoPrecificacao = useMemo(() => {
    if (!custoProduto || !despesasFixas || !quantidadeMensal || !margemDesejada) {
      return null;
    }

    setCalculando(true);
    
    // Simula delay de cálculo complexo
    setTimeout(() => setCalculando(false), 800);

    const custoUnitario = parseFloat(custoProduto);
    const despesasFixasMensais = parseFloat(despesasFixas);
    const qtdMensal = parseFloat(quantidadeMensal);
    const margem = parseFloat(margemDesejada);

    // Custo fixo por unidade
    const custoFixoUnitario = despesasFixasMensais / qtdMensal;
    const custoTotalUnitario = custoUnitario + custoFixoUnitario;

    // Preço sem impostos (para aplicar margem)
    const precoSemImpostos = custoTotalUnitario / (1 - margem / 100);
    
    // Calcular impostos baseado no regime e NCM
    let impostos = calculateTaxByRegime(precoSemImpostos, regime, dadosEmpresa, isMonophasic, monophasicData, tipoProduto);
    
    // Preço final incluindo impostos
    const precoFinal = precoSemImpostos + impostos.total;
    
    // Margem real após impostos
    const margemReal = ((precoFinal - custoTotalUnitario - impostos.total) / precoFinal) * 100;
    
    // Lucro líquido unitário
    const lucroLiquido = precoFinal - custoTotalUnitario - impostos.total;
    
    // Projeções mensais
    const receitaMensal = precoFinal * qtdMensal;
    const custoTotalMensal = custoTotalUnitario * qtdMensal;
    const impostosMensal = impostos.total * qtdMensal;
    const lucroMensal = lucroLiquido * qtdMensal;
    
    return {
      custoUnitario,
      custoFixoUnitario,
      custoTotalUnitario,
      precoSemImpostos,
      impostos,
      precoFinal,
      margemReal,
      lucroLiquido,
      // Projeções
      receitaMensal,
      custoTotalMensal,
      impostosMensal,
      lucroMensal,
      margemRealMensal: lucroMensal > 0 ? (lucroMensal / receitaMensal) * 100 : 0
    };
  }, [custoProduto, despesasFixas, quantidadeMensal, margemDesejada, regime, uf, aliquotaICMS, aliquotaIPI, tipoProduto, isMonophasic, monophasicData]);

  const handleMonophasicChange = (isMonophase, data) => {
    setIsMonophasic(isMonophase);
    setMonophasicData(data);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header da Aba Avançada */}
      <div className="bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-brand-200 dark:border-brand-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand-500 rounded-lg">
            <Zap size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Precificação Avançada com NCM
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Cálculo tributário específico por classificação fiscal dos produtos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-brand-600 dark:text-brand-400">
          <Sparkles size={14} />
          <span>Interface premium para empresários • Cálculos precisos por NCM • Monofásicos incluídos</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Coluna 1: Dados do Produto */}
        <div className="xl:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calculator size={18} />
                Dados do Produto
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {/* NCM Input */}
              <NCMInput
                value={ncm}
                onChange={setNCM}
                required
              />

              {/* Tipo de Produto */}
              <div>
                <LabelComTermoTecnico 
                  textoExplicativo="Categoria do item a ser precificado"
                  required
                />
                <SelectField
                  value={tipoProduto}
                  onChange={(e) => setTipoProduto(e.target.value)}
                  options={[
                    { value: 'produto', label: 'Produto Físico' },
                    { value: 'servico', label: 'Serviço' }
                  ]}
                />
              </div>

              {/* Custo do Produto */}
              <InputField
                type="number"
                label="Custo Unitário"
                value={custoProduto}
                onChange={(e) => setCustoProduto(e.target.value)}
                step="0.01"
                required
                helpText="Custo direto para produzir/adquirir uma unidade"
              />

              {/* Despesas Fixas */}
              <InputField
                type="number"
                label="Despesas Fixas Mensais"
                value={despesasFixas}
                onChange={(e) => setDespesasFixas(e.target.value)}
                step="0.01"
                required
                helpText="Gastos fixos da empresa por mês"
              />

              {/* Quantidade Mensal */}
              <InputField
                type="number"
                label="Quantidade Mensal Esperada"
                value={quantidadeMensal}
                onChange={(e) => setQuantidadeMensal(e.target.value)}
                required
                helpText="Quantas unidades espera vender por mês"
              />

              {/* Margem Desejada */}
              <InputField
                type="number"
                label="Margem de Lucro Desejada (%)"
                value={margemDesejada}
                onChange={(e) => setMargemDesejada(e.target.value)}
                step="0.1"
                required
                helpText="Percentual de lucro que deseja obter"
              />

              {/* Regime Tributário */}
              <div>
                <LabelComTermoTecnico
                  termo="regime"
                  textoExplicativo="Forma de tributação da empresa"
                  required
                />
                <SelectField
                  value={regime}
                  onChange={(e) => setRegime(e.target.value)}
                  options={[
                    { value: 'mei', label: 'MEI (até R$ 81 mil/ano)' },
                    { value: 'simples', label: 'Simples Nacional' },
                    { value: 'presumido', label: 'Lucro Presumido' },
                    { value: 'real', label: 'Lucro Real' }
                  ]}
                />
              </div>

              {/* Estado (UF) */}
              <SelectField
                label="Estado (UF)"
                value={uf}
                onChange={setUf}
                help="Estado onde a empresa está estabelecida"
                options={[
                  { value: 'AC', label: 'AC - Acre' },
                  { value: 'AL', label: 'AL - Alagoas' },
                  { value: 'AM', label: 'AM - Amazonas' },
                  { value: 'AP', label: 'AP - Amapá' },
                  { value: 'BA', label: 'BA - Bahia' },
                  { value: 'CE', label: 'CE - Ceará' },
                  { value: 'DF', label: 'DF - Distrito Federal' },
                  { value: 'ES', label: 'ES - Espírito Santo' },
                  { value: 'GO', label: 'GO - Goiás' },
                  { value: 'MA', label: 'MA - Maranhão' },
                  { value: 'MG', label: 'MG - Minas Gerais' },
                  { value: 'MS', label: 'MS - Mato Grosso do Sul' },
                  { value: 'MT', label: 'MT - Mato Grosso' },
                  { value: 'PA', label: 'PA - Pará' },
                  { value: 'PB', label: 'PB - Paraíba' },
                  { value: 'PE', label: 'PE - Pernambuco' },
                  { value: 'PI', label: 'PI - Piauí' },
                  { value: 'PR', label: 'PR - Paraná' },
                  { value: 'RJ', label: 'RJ - Rio de Janeiro' },
                  { value: 'RN', label: 'RN - Rio Grande do Norte' },
                  { value: 'RO', label: 'RO - Rondônia' },
                  { value: 'RR', label: 'RR - Roraima' },
                  { value: 'RS', label: 'RS - Rio Grande do Sul' },
                  { value: 'SC', label: 'SC - Santa Catarina' },
                  { value: 'SE', label: 'SE - Sergipe' },
                  { value: 'SP', label: 'SP - São Paulo' },
                  { value: 'TO', label: 'TO - Tocantins' }
                ]}
              />

              {/* Alíquota ICMS */}
              <InputField
                type="number"
                label="Alíquota ICMS (%)"
                value={aliquotaICMS}
                onChange={setAliquotaICMS}
                step="0.1"
                min={0}
                max={30}
                help="Alíquota interna de ICMS do estado — varia por UF e produto (ex: SP 18%, RJ 20%)"
              />

              {/* Alíquota IPI */}
              <InputField
                type="number"
                label="Alíquota IPI (%)"
                value={aliquotaIPI}
                onChange={setAliquotaIPI}
                step="0.1"
                min={0}
                max={100}
                help="Alíquota de IPI conforme NCM na TIPI — 0% para serviços e muitos produtos"
              />
            </CardBody>
          </Card>

          {/* Componente de Produtos Monofásicos */}
          {ncm && (
            <MonophasicProducts
              ncm={ncm}
              precoVenda={calculoPrecificacao?.precoFinal || 0}
              regime={regime}
              onMonophasicChange={handleMonophasicChange}
            />
          )}
        </div>

        {/* Coluna 2: Resultados */}
        <div className="xl:col-span-1 space-y-6">
          {calculando && <CalculationLoader />}
          
          {calculoPrecificacao && !calculando && (
            <>
              {/* Cards de Resultados Principais */}
              <div className="grid grid-cols-1 gap-4">
                <StatCard
                  title="Preço de Venda"
                  value={formatCurrency(calculoPrecificacao.precoFinal)}
                  subtitle="Por unidade (com tributos)"
                  icon={TrendingUp}
                  variant="success"
                />
                
                <StatCard
                  title="Margem Real"
                  value={formatPercent(calculoPrecificacao.margemReal)}
                  subtitle="Após todos os tributos"
                  icon={calculoPrecificacao.margemReal >= margemDesejada ? CheckCircle : AlertTriangle}
                  variant={calculoPrecificacao.margemReal >= margemDesejada ? "success" : "warning"}
                />
                
                <StatCard
                  title="Lucro Líquido"
                  value={formatCurrency(calculoPrecificacao.lucroLiquido)}
                  subtitle="Por unidade vendida"
                  icon={TrendingUp}
                  variant="info"
                />
              </div>

              {/* Breakdown de Custos */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Composição de Custos</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Custo Direto</span>
                      <span className="text-sm font-medium">{formatCurrency(calculoPrecificacao.custoUnitario)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Custo Fixo Rateado</span>
                      <span className="text-sm font-medium">{formatCurrency(calculoPrecificacao.custoFixoUnitario)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Custo Total</span>
                      <span className="text-sm font-bold">{formatCurrency(calculoPrecificacao.custoTotalUnitario)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Tributos</span>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        {formatCurrency(calculoPrecificacao.impostos.total)}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Projeção Mensal */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Projeção Mensal</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Receita Bruta</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(calculoPrecificacao.receitaMensal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">(-) Custos Totais</span>
                      <span className="text-sm font-medium">{formatCurrency(calculoPrecificacao.custoTotalMensal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">(-) Tributos</span>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        {formatCurrency(calculoPrecificacao.impostosMensal)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Lucro Líquido Mensal
                      </span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(calculoPrecificacao.lucroMensal)}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </>
          )}
        </div>

        {/* Coluna 3: Breakdown Tributário */}
        <div className="xl:col-span-1">
          {ncm && calculoPrecificacao && (
            <TaxBreakdown
              ncm={ncm}
              regime={regime}
              precoVenda={calculoPrecificacao.precoFinal}
              custoTotal={calculoPrecificacao.custoTotalUnitario}
              dadosEmpresa={dadosEmpresa}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Função auxiliar para calcular impostos por regime
function calculateTaxByRegime(precoBase, regime, dadosEmpresa, isMonophasic, monophasicData, tipoProduto) {
  let impostos = {
    items: [],
    total: 0,
    observacoes: []
  };

  // Se for produto monofásico, usar cálculo específico
  if (isMonophasic && monophasicData) {
    const pisMonofasico = monophasicData.aliquotaPIS;
    const cofinsMonofasico = monophasicData.aliquotaCOFINS;
    
    impostos.items.push(
      { nome: 'PIS Monofásico', valor: pisMonofasico },
      { nome: 'COFINS Monofásico', valor: cofinsMonofasico }
    );
    
    impostos.total = pisMonofasico + cofinsMonofasico;
    return impostos;
  }

  // Cálculos padrão por regime
  if (regime === 'simples') {
    const rbt12 = dadosEmpresa.rbt12 || 0;
    let aliquota = 8; // Default
    
    if (rbt12 <= 180000) aliquota = 4;
    else if (rbt12 <= 360000) aliquota = 7.3;
    else if (rbt12 <= 720000) aliquota = 9.5;
    else if (rbt12 <= 1800000) aliquota = 10.7;
    else aliquota = 14;
    
    const impostoSimples = precoBase * (aliquota / 100);
    impostos.items.push({ nome: 'Simples Nacional', valor: impostoSimples });
    impostos.total = impostoSimples;
    impostos.observacoes.push('ICMS e IPI já estão incluídos na alíquota do DAS');
    if (tipoProduto === 'produto') {
      impostos.observacoes.push('Para produtos industrializados, o IPI pode ser cobrado separadamente em operações interestaduais');
    }
    
  } else if (regime === 'presumido') {
    const pis = precoBase * 0.0065;
    const cofins = precoBase * 0.03;
    const issAliquota = dadosEmpresa.issAliquota || 5;
    const iss = precoBase * (issAliquota / 100);
    const icmsAliq = dadosEmpresa.aliquotaICMS || 0;
    const icms = precoBase * (icmsAliq / 100);
    const ipiAliq = dadosEmpresa.aliquotaIPI || 0;
    const ipi = precoBase * (ipiAliq / 100);

    impostos.items.push(
      { nome: 'PIS', valor: pis },
      { nome: 'COFINS', valor: cofins },
      { nome: 'ISS', valor: iss }
    );
    if (icms > 0) impostos.items.push({ nome: 'ICMS', valor: icms });
    if (ipi > 0) impostos.items.push({ nome: 'IPI', valor: ipi });

    impostos.total = pis + cofins + iss + icms + ipi;

  } else if (regime === 'real') {
    const pis = precoBase * 0.0165;
    const cofins = precoBase * 0.076;
    const icmsAliq = dadosEmpresa.aliquotaICMS || 0;
    const icms = precoBase * (icmsAliq / 100);
    const ipiAliq = dadosEmpresa.aliquotaIPI || 0;
    const ipi = precoBase * (ipiAliq / 100);

    impostos.items.push(
      { nome: 'PIS', valor: pis },
      { nome: 'COFINS', valor: cofins }
    );
    if (icms > 0) impostos.items.push({ nome: 'ICMS', valor: icms });
    if (ipi > 0) impostos.items.push({ nome: 'IPI', valor: ipi });

    impostos.total = pis + cofins + icms + ipi;

  } else if (regime === 'mei') {
    // MEI tem valor fixo mensal, não por unidade
    impostos.total = 0; // Para simplicidade
  }

  return impostos;
}

export default AdvancedPricingTab;