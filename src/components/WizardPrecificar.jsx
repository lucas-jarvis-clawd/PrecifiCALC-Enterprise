import { useState, useMemo, useEffect } from 'react';
import {
  ChevronRight, ChevronLeft, DollarSign, Clock, ShoppingBag,
  TrendingUp, Sparkles, AlertTriangle, CheckCircle, PartyPopper,
  ArrowDown, Target, BarChart3, Zap,
} from 'lucide-react';
import {
  formatCurrency, formatPercent,
  calcSimplesTax, calcLucroPresumido, calcLucroReal, calcMEI,
} from '../data/taxData';

const STEPS = [
  { id: 1, title: 'O que a empresa vende?', emoji: '🛍️' },
  { id: 2, title: 'Qual o custo de produção?', emoji: '💰' },
  { id: 3, title: 'Gastos fixos da empresa', emoji: '🏠' },
  { id: 4, title: 'Dados da empresa', emoji: '🏢' },
  { id: 5, title: 'Preço ideal calculado!', emoji: '🎯' },
];

export default function WizardPrecificar({ onClose, onNavigate }) {
  const [step, setStep] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);

  // Step 1: What you sell
  const [tipoVenda, setTipoVenda] = useState(''); // 'produto', 'servico_hora', 'servico_projeto'
  const [nomeItem, setNomeItem] = useState('');

  // Step 2: Costs
  const [custoUnitario, setCustoUnitario] = useState('');
  const [horasPorServico, setHorasPorServico] = useState('');
  const [custoHora, setCustoHora] = useState('');

  // Step 3: Fixed expenses
  const [aluguel, setAluguel] = useState('');
  const [salarios, setSalarios] = useState('');
  const [outrosFixos, setOutrosFixos] = useState('');
  const [qtdMensal, setQtdMensal] = useState('');

  // Step 4: Company
  const [regime, setRegime] = useState('');
  const [faturamentoMensal, setFaturamentoMensal] = useState('');
  const [tipoAtividade, setTipoAtividade] = useState('servicos');
  const [margemDesejada, setMargemDesejada] = useState(30);

  // Load saved profile
  useEffect(() => {
    try {
      const perfil = localStorage.getItem('precificalc_perfil');
      if (perfil) {
        const p = JSON.parse(perfil);
        if (p.regime) setRegime(p.regime);
        if (p.receitaAnual) setFaturamentoMensal(Math.round(p.receitaAnual / 12));
        if (p.atividade) {
          const atMap = {
            'Comércio': 'comercio',
            'Indústria': 'industria',
            'Prestação de Serviços': 'servicos',
            'Tecnologia/Software': 'servicos',
            'Consultoria': 'servicos',
            'Saúde': 'servicos',
            'Educação': 'servicos',
            'Alimentação': 'comercio',
            'Construção': 'industria',
          };
          setTipoAtividade(atMap[p.atividade] || 'servicos');
        }
      }
    } catch {}
  }, []);

  // Calculations
  const calculo = useMemo(() => {
    const despFixas = (parseFloat(aluguel) || 0) + (parseFloat(salarios) || 0) + (parseFloat(outrosFixos) || 0);
    const qtd = parseFloat(qtdMensal) || 1;
    const fat = parseFloat(faturamentoMensal) || 50000;
    const rbt12 = fat * 12;

    // Calculate effective tax rate
    let aliquotaEfetiva = 0;
    const regimeLabels = {};

    // Calculate for ALL regimes for comparison
    const regimeCalcs = {};

    // MEI
    if (rbt12 <= 81000) {
      const r = calcMEI(fat, tipoAtividade === 'comercio' ? 'comercio' : 'servicos');
      if (r && !r.excedeLimite) regimeCalcs.mei = r.aliquotaEfetiva;
    }

    // Simples
    if (rbt12 <= 4800000) {
      const anexo = tipoAtividade === 'comercio' ? 'I' : tipoAtividade === 'industria' ? 'II' : 'III';
      const r = calcSimplesTax(rbt12, anexo);
      if (r && !r.excedeLimite && !r.migracao) regimeCalcs.simples = r.aliquotaEfetiva;
    }

    // Presumido
    const lp = calcLucroPresumido(fat, tipoAtividade, 0.05);
    if (lp && !lp.erro) regimeCalcs.presumido = lp.aliquotaEfetiva;

    // Real
    const lr = calcLucroReal(fat, fat * 0.6, fat * 0.3, 0.05);
    if (lr && !lr.erro) regimeCalcs.real = lr.aliquotaEfetiva;

    // Get current regime rate
    aliquotaEfetiva = regimeCalcs[regime] || 0;

    let custoBase = 0;
    if (tipoVenda === 'produto') {
      custoBase = parseFloat(custoUnitario) || 0;
    } else if (tipoVenda === 'servico_hora') {
      const horas = parseFloat(horasPorServico) || 1;
      const cHora = parseFloat(custoHora) || 0;
      custoBase = cHora * horas;
    } else {
      custoBase = parseFloat(custoUnitario) || 0;
    }

    const custoFixoUnit = qtd > 0 ? despFixas / qtd : 0;
    const custoTotal = custoBase + custoFixoUnit;
    const margem = margemDesejada / 100;

    const denominador = 1 - aliquotaEfetiva - margem;
    const precoVenda = denominador > 0 ? custoTotal / denominador : custoTotal * 2;

    const impostos = precoVenda * aliquotaEfetiva;
    const lucroUnit = precoVenda - custoTotal - impostos;
    const lucroMensal = lucroUnit * qtd;
    const lucroAnual = lucroMensal * 12;

    // Preço por hora (para serviços)
    const horasServ = parseFloat(horasPorServico) || 1;
    const precoHora = tipoVenda === 'servico_hora' ? precoVenda / horasServ : 0;

    // Preço mínimo (margem zero)
    const denMin = 1 - aliquotaEfetiva;
    const precoMinimo = denMin > 0 ? custoTotal / denMin : custoTotal;

    // Compare prices across regimes
    const comparativo = Object.entries(regimeCalcs).map(([reg, aliq]) => {
      const den = 1 - aliq - margem;
      const preco = den > 0 ? custoTotal / den : custoTotal * 2;
      const labels = {
        mei: 'MEI', simples: 'Simples Nacional',
        presumido: 'Lucro Presumido', real: 'Lucro Real',
      };
      return { regime: reg, label: labels[reg], preco, aliquota: aliq, isAtual: reg === regime };
    }).sort((a, b) => a.preco - b.preco);

    // Economia vs pior regime
    const melhorPreco = comparativo[0]?.preco || precoVenda;
    const piorPreco = comparativo[comparativo.length - 1]?.preco || precoVenda;
    const economiaAnual = (piorPreco - melhorPreco) * qtd * 12;

    return {
      precoVenda, custoTotal, custoBase, custoFixoUnit, impostos, lucroUnit,
      lucroMensal, lucroAnual, precoHora, precoMinimo,
      aliquotaEfetiva, comparativo, economiaAnual,
      melhorRegime: comparativo[0],
    };
  }, [tipoVenda, custoUnitario, horasPorServico, custoHora, aluguel, salarios,
    outrosFixos, qtdMensal, regime, faturamentoMensal, tipoAtividade, margemDesejada]);

  // Show celebration when reaching step 5
  useEffect(() => {
    if (step === 5) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const canAdvance = () => {
    switch (step) {
      case 1: return !!tipoVenda;
      case 2: return tipoVenda === 'servico_hora' ? (horasPorServico && custoHora) : !!custoUnitario;
      case 3: return !!qtdMensal;
      case 4: return !!regime && !!faturamentoMensal;
      default: return true;
    }
  };

  const saveAndClose = () => {
    // Save to precificacao localStorage for the full module
    try {
      const data = {
        tipo: tipoVenda === 'produto' ? 'produto' : 'servico',
        custoProduto: tipoVenda === 'servico_hora' ? (parseFloat(custoHora) || 0) * (parseFloat(horasPorServico) || 1) : parseFloat(custoUnitario) || 0,
        despesasFixas: (parseFloat(aluguel) || 0) + (parseFloat(salarios) || 0) + (parseFloat(outrosFixos) || 0),
        margemDesejada,
        regime,
        quantidadeMensal: parseFloat(qtdMensal) || 1,
        rbt12: (parseFloat(faturamentoMensal) || 50000) * 12,
        receitaMensal: parseFloat(faturamentoMensal) || 50000,
      };
      localStorage.setItem('precificalc_precificacao', JSON.stringify(data));
    } catch {}
    onClose();
  };

  const regimeOptions = [
    { id: 'mei', label: 'MEI', desc: 'Faturamento até R$ 81 mil/ano', emoji: '🟢' },
    { id: 'simples', label: 'Simples Nacional', desc: 'Faturamento até R$ 4,8 milhões/ano', emoji: '🔵' },
    { id: 'presumido', label: 'Lucro Presumido', desc: 'Faturamento até R$ 78 milhões/ano', emoji: '🟣' },
    { id: 'real', label: 'Lucro Real', desc: 'Sem limite de faturamento', emoji: '🟠' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-800">🎯 Quero Precificar!</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex-1 flex items-center gap-1">
                <div className={`h-2 rounded-full flex-1 transition-all ${
                  step >= s.id ? 'bg-brand-500' : 'bg-slate-200'
                }`} />
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Passo {step} de 5: <span className="font-medium">{STEPS[step - 1].emoji} {STEPS[step - 1].title}</span>
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Step 1: What you sell */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-800">O que a empresa quer precificar?</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'produto', icon: ShoppingBag, label: 'Produto / Mercadoria', desc: 'Produto fabricado ou revendido pela empresa', emoji: '📦' },
                  { id: 'servico_hora', icon: Clock, label: 'Serviço por Hora', desc: 'Consultoria, aula, manutenção...', emoji: '⏰' },
                  { id: 'servico_projeto', icon: Target, label: 'Serviço por Projeto', desc: 'Site, reforma, tratamento...', emoji: '📋' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setTipoVenda(opt.id)}
                    className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left ${
                      tipoVenda === opt.id
                        ? 'border-brand-500 bg-brand-50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-3xl">{opt.emoji}</span>
                    <div>
                      <p className="font-semibold text-slate-800">{opt.label}</p>
                      <p className="text-sm text-slate-500">{opt.desc}</p>
                    </div>
                    {tipoVenda === opt.id && <CheckCircle className="ml-auto text-brand-500" size={24} />}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Nome do produto ou serviço (opcional)
                </label>
                <input
                  type="text"
                  value={nomeItem}
                  onChange={e => setNomeItem(e.target.value)}
                  placeholder="Ex: Consultoria de marketing, Bolo caseiro..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Costs */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-800">
                {tipoVenda === 'servico_hora' ? 'Qual o custo por hora do serviço?' : 'Qual o custo de produção/aquisição?'}
              </h3>
              <p className="text-slate-500">Inclua material, insumos, tudo que a empresa gasta para entregar</p>

              {tipoVenda === 'servico_hora' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      💰 Custo por hora trabalhada
                    </label>
                    <p className="text-xs text-slate-400 mb-2">Custo da hora: salário ÷ horas trabalhadas + materiais</p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                      <input
                        type="number"
                        value={custoHora}
                        onChange={e => setCustoHora(e.target.value)}
                        placeholder="50"
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      ⏱️ Quantas horas por serviço?
                    </label>
                    <input
                      type="number"
                      value={horasPorServico}
                      onChange={e => setHorasPorServico(e.target.value)}
                      placeholder="2"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-lg"
                    />
                  </div>
                  {custoHora && horasPorServico && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Custo por serviço: <span className="font-bold">{formatCurrency(parseFloat(custoHora) * parseFloat(horasPorServico))}</span>
                        <span className="text-blue-500"> ({horasPorServico}h × {formatCurrency(parseFloat(custoHora))})</span>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    💰 Custo por {tipoVenda === 'produto' ? 'produto' : 'serviço'}
                  </label>
                  <p className="text-xs text-slate-400 mb-2">Material + mão de obra direta + tudo que gasta pra fazer UM</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                    <input
                      type="number"
                      value={custoUnitario}
                      onChange={e => setCustoUnitario(e.target.value)}
                      placeholder="100"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Fixed expenses */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-800">Gastos fixos mensais da empresa</h3>
              <p className="text-slate-500">Gastos que a empresa tem todo mês, vendendo ou não</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">🏠 Aluguel + Contas</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                    <input type="number" value={aluguel} onChange={e => setAluguel(e.target.value)} placeholder="2.000"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">👥 Salários + Encargos</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                    <input type="number" value={salarios} onChange={e => setSalarios(e.target.value)} placeholder="5.000"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">📊 Outros gastos fixos</label>
                <p className="text-xs text-slate-400 mb-2">Software, contador, marketing, internet, etc.</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input type="number" value={outrosFixos} onChange={e => setOutrosFixos(e.target.value)} placeholder="1.500"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  📈 Quantos {tipoVenda === 'produto' ? 'produtos' : 'serviços'} a empresa vende por mês?
                </label>
                <input type="number" value={qtdMensal} onChange={e => setQtdMensal(e.target.value)} placeholder="50"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-lg" />
              </div>
              {qtdMensal && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-600">
                    Gasto fixo por {tipoVenda === 'produto' ? 'produto' : 'serviço'}:&nbsp;
                    <span className="font-bold text-slate-800">
                      {formatCurrency(((parseFloat(aluguel) || 0) + (parseFloat(salarios) || 0) + (parseFloat(outrosFixos) || 0)) / (parseFloat(qtdMensal) || 1))}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Company info */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-800">Dados da empresa</h3>
              <p className="text-slate-500">Para calcular os impostos corretamente</p>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Tipo da empresa (regime tributário):</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {regimeOptions.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setRegime(r.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                        regime === r.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl">{r.emoji}</span>
                      <div>
                        <p className="font-medium text-sm text-slate-800">{r.label}</p>
                        <p className="text-xs text-slate-500">{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {regime === '' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">💡 Não sabe? A maioria dos pequenos negócios é Simples Nacional.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  💰 Faturamento mensal da empresa (aproximado)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input type="number" value={faturamentoMensal} onChange={e => setFaturamentoMensal(e.target.value)} placeholder="30.000"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-lg" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Margem de lucro desejada
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range" min={10} max={60} step={5} value={margemDesejada}
                    onChange={e => setMargemDesejada(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                  />
                  <span className="text-2xl font-bold text-brand-600 w-16 text-right">{margemDesejada}%</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Apertado</span>
                  <span>Bom</span>
                  <span>Ótimo</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Results! */}
          {step === 5 && (
            <div className="space-y-5">
              {/* Celebration animation */}
              {showCelebration && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
                  <div className="text-6xl animate-bounce">🎉</div>
                </div>
              )}

              {/* Main price */}
              <div className="text-center bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-6 text-white shadow-lg">
                <p className="text-brand-200 text-sm font-medium mb-1">
                  {nomeItem ? `Preço ideal para "${nomeItem}"` : 'O preço ideal do produto é:'}
                </p>
                <p className="text-5xl font-black tracking-tight">{formatCurrency(calculo.precoVenda)}</p>
                {tipoVenda === 'servico_hora' && (
                  <p className="text-brand-200 text-lg mt-1">
                    ou <span className="text-white font-bold">{formatCurrency(calculo.precoHora)}/hora</span>
                  </p>
                )}
              </div>

              {/* QUANTO SOBRA NO BOLSO */}
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💰</span>
                  <span className="text-sm font-bold text-emerald-800 uppercase tracking-wide">Lucro líquido da empresa</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-emerald-600">Por venda</p>
                    <p className="text-2xl font-bold text-emerald-700">{formatCurrency(calculo.lucroUnit)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600">Por mês</p>
                    <p className="text-2xl font-bold text-emerald-700">{formatCurrency(calculo.lucroMensal)}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-emerald-300">
                  <p className="text-xs text-emerald-600">Por ano</p>
                  <p className="text-3xl font-black text-emerald-800">{formatCurrency(calculo.lucroAnual)}</p>
                </div>
              </div>

              {/* PREÇO MÍNIMO - ABAIXO = PREJUÍZO */}
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-red-500" size={20} />
                  <span className="text-sm font-bold text-red-700">⚠️ ABAIXO DISSO = PREJUÍZO</span>
                </div>
                <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(calculo.precoMinimo)}</p>
                <p className="text-xs text-red-500 mt-1">Preço mínimo para não ter prejuízo (margem zero)</p>
              </div>

              {/* Price comparison across regimes */}
              {calculo.comparativo.length > 1 && (
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-slate-800 mb-3">📊 Preço em cada tipo de empresa:</h4>
                  <div className="space-y-2">
                    {calculo.comparativo.map((c, i) => (
                      <div
                        key={c.regime}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          c.isAtual ? 'bg-brand-50 border border-brand-200' : 'bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {i === 0 && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Melhor</span>}
                          <span className="text-sm font-medium text-slate-700">{c.label}</span>
                          {c.isAtual && <span className="text-xs text-brand-600">(regime atual)</span>}
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-800">{formatCurrency(c.preco)}</span>
                          <span className="text-xs text-slate-400 ml-2">({(c.aliquota * 100).toFixed(1)}% imposto)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {calculo.economiaAnual > 500 && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                      <p className="text-xs text-emerald-600">Economia anual no melhor regime vs pior:</p>
                      <p className="text-xl font-bold text-emerald-700">🎉 {formatCurrency(calculo.economiaAnual)}/ano!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Breakdown */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="text-sm font-bold text-slate-800 mb-3">🧮 Como chegamos nesse preço:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Custo direto do produto</span>
                    <span className="font-medium">{formatCurrency(calculo.custoBase)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">+ Rateio dos gastos fixos</span>
                    <span className="font-medium">{formatCurrency(calculo.custoFixoUnit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">+ Impostos ({(calculo.aliquotaEfetiva * 100).toFixed(1)}%)</span>
                    <span className="font-medium text-red-600">{formatCurrency(calculo.impostos)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">+ Lucro da empresa ({margemDesejada}%)</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(calculo.lucroUnit)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-300 pt-2">
                    <span className="font-bold text-slate-800">= Preço de venda</span>
                    <span className="font-bold text-brand-600">{formatCurrency(calculo.precoVenda)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 rounded-b-2xl flex justify-between items-center">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800">
              <ChevronLeft size={16} /> Voltar
            </button>
          ) : (
            <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-slate-700">Fechar</button>
          )}

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-200"
            >
              Próximo <ChevronRight size={16} />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { saveAndClose(); onNavigate('precificacao'); }}
                className="px-4 py-2 text-brand-600 border border-brand-200 rounded-xl hover:bg-brand-50"
              >
                Ajustar detalhes
              </button>
              <button
                onClick={saveAndClose}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-lg"
              >
                <CheckCircle size={16} /> Entendido!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
