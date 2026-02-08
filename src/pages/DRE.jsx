import { useState, useEffect, useMemo } from 'react';
import { FileSpreadsheet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import { formatCurrency } from '../data/taxData';
import PageHeader from '../components/PageHeader';
import DisclaimerBanner from '../components/DisclaimerBanner';

// Componente DRELine movido para fora do render
const DRELine = ({ label, value, level = 0, bold = false, highlight = false }) => {
  const indent = level * 20;
  const isNeg = value < 0;
  return (
    <div className={`flex justify-between py-1.5 ${bold ? 'font-semibold border-t border-slate-200 mt-1 pt-2' : ''} ${highlight ? 'bg-slate-50 px-3 -mx-3 rounded' : ''}`}>
      <span className={`${bold ? 'text-slate-800' : 'text-slate-600'} text-sm`} style={{ paddingLeft: indent }}>
        {level > 0 && !bold ? '(-) ' : ''}{label}
      </span>
      <span className={`font-mono text-sm ${isNeg ? 'text-red-600' : bold ? 'text-slate-800' : 'text-slate-700'} ${highlight ? 'text-brand-600 font-semibold' : ''}`}>
        {formatCurrency(Math.abs(value))}{isNeg ? ' (-)' : ''}
      </span>
    </div>
  );
};

export default function DRE() {
  const [periodo, setPeriodo] = useState('mensal');
  const [receitaBruta, setReceitaBruta] = useState(100000);
  const [impostosSobreVendas, setImpostosSobreVendas] = useState(15000);
  const [devolucoes, setDevolucoes] = useState(0);
  const [cpv, setCpv] = useState(40000);
  const [despAdmin, setDespAdmin] = useState(8000);
  const [despPessoal, setDespPessoal] = useState(25000);
  const [despComerciais, setDespComerciais] = useState(5000);
  const [outrasDespesas, setOutrasDespesas] = useState(2000);
  const [depreciacao, setDepreciacao] = useState(1000);
  const [resultadoFinanceiro, setResultadoFinanceiro] = useState(-500);
  const [irpjCsll, setIrpjCsll] = useState(5000);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('precificalc_dre');
      if (saved) {
        const d = JSON.parse(saved);
        // Usar timeout para evitar cascading renders
        setTimeout(() => {
          if (d.receitaBruta !== undefined) setReceitaBruta(d.receitaBruta);
          if (d.impostosSobreVendas !== undefined) setImpostosSobreVendas(d.impostosSobreVendas);
          if (d.devolucoes !== undefined) setDevolucoes(d.devolucoes);
          if (d.cpv !== undefined) setCpv(d.cpv);
          if (d.despAdmin !== undefined) setDespAdmin(d.despAdmin);
          if (d.despPessoal !== undefined) setDespPessoal(d.despPessoal);
          if (d.despComerciais !== undefined) setDespComerciais(d.despComerciais);
          if (d.outrasDespesas !== undefined) setOutrasDespesas(d.outrasDespesas);
          if (d.depreciacao !== undefined) setDepreciacao(d.depreciacao);
          if (d.resultadoFinanceiro !== undefined) setResultadoFinanceiro(d.resultadoFinanceiro);
          if (d.irpjCsll !== undefined) setIrpjCsll(d.irpjCsll);
          if (d.periodo) setPeriodo(d.periodo);
        }, 0);
      }
      // Also try to load from custos/simulador
      const custos = localStorage.getItem('precificalc_custos');
      if (custos && !saved) {
        const c = JSON.parse(custos);
        setTimeout(() => {
          if (c.custoFolha) setDespPessoal(c.custoFolha);
          if (c.totalFixos) setDespAdmin(c.totalFixos);
        }, 0);
      }
    } catch {
      // Ignore errors loading from localStorage
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('precificalc_dre', JSON.stringify({
      receitaBruta, impostosSobreVendas, devolucoes, cpv, despAdmin, despPessoal,
      despComerciais, outrasDespesas, depreciacao, resultadoFinanceiro, irpjCsll, periodo,
    }));
  }, [receitaBruta, impostosSobreVendas, devolucoes, cpv, despAdmin, despPessoal, despComerciais, outrasDespesas, depreciacao, resultadoFinanceiro, irpjCsll, periodo]);

  const mult = periodo === 'anual' ? 12 : 1;
  const calc = useMemo(() => {
    const rb = receitaBruta * mult;
    const ded = (impostosSobreVendas + devolucoes) * mult;
    const rl = rb - ded;
    const lb = rl - cpv * mult;
    const despOp = (despAdmin + despPessoal + despComerciais + outrasDespesas) * mult;
    const ebitda = lb - despOp;
    const ebit = ebitda - depreciacao * mult;
    const rai = ebit + resultadoFinanceiro * mult;
    const ir = irpjCsll * mult;
    const ll = rai - ir;
    return { rb, ded, rl, cpv: cpv * mult, lb, despOp, ebitda, dep: depreciacao * mult, ebit, rf: resultadoFinanceiro * mult, rai, ir, ll,
      margemBruta: rb > 0 ? (lb / rb) * 100 : 0,
      margemOp: rb > 0 ? (ebit / rb) * 100 : 0,
      margemEbitda: rb > 0 ? (ebitda / rb) * 100 : 0,
      margemLiquida: rb > 0 ? (ll / rb) * 100 : 0,
    };
  }, [receitaBruta, impostosSobreVendas, devolucoes, cpv, despAdmin, despPessoal, despComerciais, outrasDespesas, depreciacao, resultadoFinanceiro, irpjCsll, mult]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader icon={FileSpreadsheet} title="DRE - Demonstrativo de Resultado" description="Demonstrativo de Resultado do Exercício simplificado" />
      <DisclaimerBanner />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={DollarSign} label="Receita Líquida" value={formatCurrency(calc.rl)} color="blue" />
        <StatCard icon={TrendingUp} label="Margem Bruta" value={`${calc.margemBruta.toFixed(1)}%`} color="green" />
        <StatCard icon={TrendingUp} label="EBITDA" value={formatCurrency(calc.ebitda)} color="purple" />
        <StatCard icon={calc.ll >= 0 ? TrendingUp : TrendingDown} label="Lucro Líquido" value={formatCurrency(calc.ll)} color={calc.ll >= 0 ? 'green' : 'red'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-slate-800 font-medium text-sm">Dados de Entrada</h2>
              <SelectField value={periodo} onChange={setPeriodo} options={[
                { value: 'mensal', label: 'Mensal' }, { value: 'anual', label: 'Anual' },
              ]} />
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            <p className="text-xs text-slate-400 font-medium">Receitas</p>
            <InputField label="Receita Bruta" value={receitaBruta} onChange={setReceitaBruta} prefix="R$" />
            <InputField label="Tributos sobre Vendas" value={impostosSobreVendas} onChange={setImpostosSobreVendas} prefix="R$" />
            <InputField label="Devoluções e Abatimentos" value={devolucoes} onChange={setDevolucoes} prefix="R$" />
            <p className="text-xs text-slate-400 font-medium pt-2">Gastos</p>
            <InputField label="CPV / CSV" value={cpv} onChange={setCpv} prefix="R$" help="Custo dos produtos/serviços vendidos" />
            <InputField label="Despesas Administrativas" value={despAdmin} onChange={setDespAdmin} prefix="R$" />
            <InputField label="Despesas com Pessoal" value={despPessoal} onChange={setDespPessoal} prefix="R$" />
            <InputField label="Despesas Comerciais" value={despComerciais} onChange={setDespComerciais} prefix="R$" />
            <InputField label="Outras Despesas" value={outrasDespesas} onChange={setOutrasDespesas} prefix="R$" />
            <p className="text-xs text-slate-400 font-medium pt-2">Outros</p>
            <InputField label="Depreciação e Amortização" value={depreciacao} onChange={setDepreciacao} prefix="R$" />
            <InputField label="Resultado Financeiro" value={resultadoFinanceiro} onChange={setResultadoFinanceiro} prefix="R$" help="Positivo = receita, negativo = despesa" />
            <InputField label="IRPJ + CSLL" value={irpjCsll} onChange={setIrpjCsll} prefix="R$" />
          </CardBody>
        </Card>

        {/* DRE Display */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-slate-800 font-medium text-sm">DRE {periodo === 'anual' ? 'Anual' : 'Mensal'}</h2>
          </CardHeader>
          <CardBody>
            <DRELine label="Receita Bruta" value={calc.rb} bold />
            <DRELine label="Tributos sobre Vendas" value={-calc.ded} level={1} />
            <DRELine label="Receita Líquida" value={calc.rl} bold highlight />
            <div className="my-2" />
            <DRELine label="Custo dos Produtos/Serviços (CPV/CSV)" value={-calc.cpv} level={1} />
            <DRELine label="Lucro Bruto" value={calc.lb} bold highlight />
            <div className="my-2" />
            <DRELine label="Despesas Operacionais" value={-calc.despOp} level={1} />
            <DRELine label="EBITDA" value={calc.ebitda} bold />
            <div className="my-2" />
            <DRELine label="Depreciação e Amortização" value={-calc.dep} level={1} />
            <DRELine label="EBIT (Resultado Operacional)" value={calc.ebit} bold />
            <div className="my-2" />
            <DRELine label="Resultado Financeiro" value={calc.rf} level={1} />
            <DRELine label="Resultado Antes IR/CSLL" value={calc.rai} bold />
            <div className="my-2" />
            <DRELine label="IRPJ + CSLL" value={-calc.ir} level={1} />
            <DRELine label={calc.ll >= 0 ? 'Lucro Líquido' : 'Prejuízo Líquido'} value={calc.ll} bold highlight />

            {/* Margins */}
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-md">
                <p className="text-slate-400 text-xs mb-1">Margem Bruta</p>
                <p className={`text-lg font-semibold ${calc.margemBruta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{calc.margemBruta.toFixed(1)}%</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-md">
                <p className="text-slate-400 text-xs mb-1">Margem EBITDA</p>
                <p className={`text-lg font-semibold ${calc.margemEbitda >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{calc.margemEbitda.toFixed(1)}%</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-md">
                <p className="text-slate-400 text-xs mb-1">Margem Operacional (EBIT)</p>
                <p className={`text-lg font-semibold ${calc.margemOp >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{calc.margemOp.toFixed(1)}%</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-md">
                <p className="text-slate-400 text-xs mb-1">Margem Líquida</p>
                <p className={`text-lg font-semibold ${calc.margemLiquida >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{calc.margemLiquida.toFixed(1)}%</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
