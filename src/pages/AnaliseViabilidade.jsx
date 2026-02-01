import { useState } from 'react';
import { Target, Calculator, DollarSign, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardBody, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import { calcMEI, calcSimplesTax, calcLucroPresumido, calcLucroReal, formatCurrency, formatPercent } from '../data/taxData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#10b981'];

export default function AnaliseViabilidade() {
  const [dados, setDados] = useState({
    investimentoInicial: '', receitaMensal: '', custoFixoMensal: '', custoVariavelPercent: '',
    atividade: 'servicos', regime: 'simples', anexo: 'III', rbt12: '',
    issAliquota: '5', despesasDedutiveis: '', creditosPisCofins: '',
  });
  const [resultado, setResultado] = useState(null);

  const calcularViabilidade = () => {
    const receita = parseFloat(dados.receitaMensal) || 0;
    const custoFixo = parseFloat(dados.custoFixoMensal) || 0;
    const custoVariavel = (receita * (parseFloat(dados.custoVariavelPercent) || 0)) / 100;
    const investimento = parseFloat(dados.investimentoInicial) || 0;
    if (receita <= 0) return;

    let impostos = 0;
    const receitaAnual = dados.regime === 'simples' ? (parseFloat(dados.rbt12) || receita * 12) : receita * 12;

    switch (dados.regime) {
      case 'mei': { const r = calcMEI(receita, dados.atividade); impostos = r && !r.excedeLimite ? r.dasFixo : 0; break; }
      case 'simples': { const r = calcSimplesTax(receitaAnual, dados.anexo); impostos = r && !r.excedeLimite ? r.valorMensal : 0; break; }
      case 'presumido': { const r = calcLucroPresumido(receita, dados.atividade, (parseFloat(dados.issAliquota) || 5) / 100); impostos = r && !r.erro ? r.totalMensal : 0; break; }
      case 'real': { const r = calcLucroReal(receita, parseFloat(dados.despesasDedutiveis) || custoFixo, parseFloat(dados.creditosPisCofins) || 0, (parseFloat(dados.issAliquota) || 5) / 100); impostos = r && !r.erro ? r.totalMensal : 0; break; }
    }

    const custoTotal = custoFixo + custoVariavel + impostos;
    const lucroMensal = receita - custoTotal;
    const margemLucro = receita > 0 ? (lucroMensal / receita) * 100 : 0;
    const payback = lucroMensal > 0 && investimento > 0 ? investimento / lucroMensal : 0;
    const aliquotaEfetiva = receita > 0 ? impostos / receita : 0;
    const margemContribuicao = 1 - ((parseFloat(dados.custoVariavelPercent) || 0) / 100) - aliquotaEfetiva;
    const pontoEquilibrio = margemContribuicao > 0 ? custoFixo / margemContribuicao : 0;

    const projecao = Array.from({ length: 12 }, (_, i) => ({ mes: `M${i + 1}`, lucro: lucroMensal, acumulado: lucroMensal * (i + 1) - investimento }));
    const distribuicao = [
      { name: 'Custos Fixos', value: custoFixo, color: COLORS[0] },
      { name: 'Custos Variáveis', value: custoVariavel, color: COLORS[1] },
      { name: 'Impostos', value: impostos, color: COLORS[2] },
      { name: 'Lucro', value: Math.max(0, lucroMensal), color: COLORS[3] },
    ];

    setResultado({ lucroMensal, margemLucro, payback, pontoEquilibrio, impostos, aliquotaEfetiva, custoTotal, projecao, distribuicao,
      viabilidade: margemLucro > 20 ? 'excelente' : margemLucro > 10 ? 'boa' : margemLucro > 0 ? 'limitada' : 'inviavel' });
  };

  const viabTexto = { excelente: 'Excelente', boa: 'Boa', limitada: 'Limitada', inviavel: 'Inviável' };
  const viabColor = { excelente: 'green', boa: 'blue', limitada: 'amber', inviavel: 'red' };
  const update = (field, value) => setDados({ ...dados, [field]: value });
  const tt = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,.1)' };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Target className="text-brand-600" size={22} />
          Análise de Viabilidade
        </h1>
        <p className="text-slate-500 text-sm mt-1">Avalie a viabilidade do negócio com cálculos tributários reais</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-medium text-slate-800 text-sm">Dados do Negócio</h2>
          </div>
          <CardBody className="space-y-3">
            <InputField label="Investimento Inicial" value={dados.investimentoInicial} onChange={(v) => update('investimentoInicial', v)} prefix="R$" step={5000} placeholder="50000" />
            <InputField label="Receita Mensal Esperada" value={dados.receitaMensal} onChange={(v) => update('receitaMensal', v)} prefix="R$" step={5000} placeholder="30000" />
            <InputField label="Custo Fixo Mensal" value={dados.custoFixoMensal} onChange={(v) => update('custoFixoMensal', v)} prefix="R$" step={1000} placeholder="8000" />
            <InputField label="Custo Variável (% receita)" value={dados.custoVariavelPercent} onChange={(v) => update('custoVariavelPercent', v)} suffix="%" step={5} placeholder="20" />
            <SelectField label="Atividade" value={dados.atividade} onChange={(v) => update('atividade', v)} options={[
              { value: 'servicos', label: 'Serviços' }, { value: 'comercio', label: 'Comércio' }, { value: 'industria', label: 'Indústria' },
            ]} />
            <SelectField label="Regime Tributário" value={dados.regime} onChange={(v) => update('regime', v)} options={[
              { value: 'mei', label: 'MEI' }, { value: 'simples', label: 'Simples Nacional' },
              { value: 'presumido', label: 'Lucro Presumido' }, { value: 'real', label: 'Lucro Real' },
            ]} />
            {dados.regime === 'simples' && (
              <>
                <InputField label="RBT12 (Receita 12 meses)" value={dados.rbt12} onChange={(v) => update('rbt12', v)} prefix="R$" step={10000} placeholder="360000" help="Receita bruta dos últimos 12 meses" />
                <SelectField label="Anexo" value={dados.anexo} onChange={(v) => update('anexo', v)} options={[
                  { value: 'I', label: 'Anexo I' }, { value: 'II', label: 'Anexo II' },
                  { value: 'III', label: 'Anexo III' }, { value: 'IV', label: 'Anexo IV' }, { value: 'V', label: 'Anexo V' },
                ]} />
              </>
            )}
            {(dados.regime === 'presumido' || dados.regime === 'real') && (
              <InputField label="Alíquota ISS (%)" value={dados.issAliquota} onChange={(v) => update('issAliquota', v)} suffix="%" min={2} max={5} step={0.5} />
            )}
            {dados.regime === 'real' && (
              <>
                <InputField label="Despesas Dedutíveis" value={dados.despesasDedutiveis} onChange={(v) => update('despesasDedutiveis', v)} prefix="R$" step={1000} />
                <InputField label="Créditos PIS/COFINS" value={dados.creditosPisCofins} onChange={(v) => update('creditosPisCofins', v)} prefix="R$" step={1000} />
              </>
            )}
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
                <StatCard icon={Target} label="Ponto de Equilíbrio" value={formatCurrency(resultado.pontoEquilibrio)} subvalue="Receita mínima" color="amber" />
              </div>

              <Card>
                <CardBody>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><p className="text-slate-400 text-xs">Impostos Mensais</p><p className="text-slate-800 font-medium">{formatCurrency(resultado.impostos)}</p></div>
                    <div><p className="text-slate-400 text-xs">Alíquota Efetiva</p><p className="text-slate-800 font-medium">{formatPercent(resultado.aliquotaEfetiva)}</p></div>
                    <div><p className="text-slate-400 text-xs">Custos Totais</p><p className="text-slate-800 font-medium">{formatCurrency(resultado.custoTotal)}</p></div>
                    <div><p className="text-slate-400 text-xs">Lucro Anual</p><p className={`font-medium ${resultado.lucroMensal > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(resultado.lucroMensal * 12)}</p></div>
                  </div>
                </CardBody>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <div className="px-5 py-3 border-b border-slate-100"><h3 className="font-medium text-slate-800 text-sm">Projeção 12 Meses</h3></div>
                  <CardBody>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={resultado.projecao}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={tt} formatter={(v) => formatCurrency(v)} />
                        <Line type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={2} name="Lucro Mensal" dot={false} />
                        <Line type="monotone" dataKey="acumulado" stroke="#3b82f6" strokeWidth={2} name="Acumulado" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
                <Card>
                  <div className="px-5 py-3 border-b border-slate-100"><h3 className="font-medium text-slate-800 text-sm">Distribuição de Custos</h3></div>
                  <CardBody>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={resultado.distribuicao} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={2}>
                          {resultado.distribuicao.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip contentStyle={tt} formatter={(v) => formatCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {resultado.distribuicao.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-500">{item.name}</span>
                        </div>
                      ))}
                    </div>
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
