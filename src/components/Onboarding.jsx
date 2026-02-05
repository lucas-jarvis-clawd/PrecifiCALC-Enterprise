import { useState, useEffect } from 'react';
import {
  CheckCircle, Building2, Calculator, Rocket, ChevronRight, ChevronLeft,
  DollarSign, TrendingUp, Shield, Sparkles, ArrowRight
} from 'lucide-react';

const EXAMPLE_BUSINESSES = {
  'Prestação de Serviços': 'Ex: Design, consultoria, TI, marketing',
  'Comércio': 'Ex: Loja virtual, revenda, dropshipping',
  'Alimentação': 'Ex: Restaurante, delivery, marmitas',
  'Tecnologia/Software': 'Ex: SaaS, apps, desenvolvimento',
  'Saúde': 'Ex: Clínica, consultório, estética',
  'Educação': 'Ex: Cursos, mentoria, escola',
  'Consultoria': 'Ex: Financeira, empresarial, jurídica',
  'Construção': 'Ex: Reformas, projetos, empreitadas',
  'Indústria': 'Ex: Fabricação, montagem, confecção',
  'Outros': '',
};

const VALUE_PROPS = [
  { icon: DollarSign, title: 'Descubra quanto pagar de imposto', desc: 'Simulação precisa nos 4 regimes tributários' },
  { icon: TrendingUp, title: 'Precifique com lucro', desc: 'Preço de venda que cobre custos, impostos e gera lucro' },
  { icon: Shield, title: 'Tome decisões seguras', desc: 'Dados reais para escolher o melhor regime e investir certo' },
];

export default function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [empresaData, setEmpresaData] = useState({
    nomeEmpresa: '',
    cnpj: '',
    regime: '',
    atividade: '',
    cidade: '',
    uf: '',
    receitaAnual: '',
    funcionarios: ''
  });
  const [errors, setErrors] = useState({});

  const formatCNPJ = (value) => {
    const numbers = value.replace(/\D/g, '').slice(0, 14);
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const steps = [
    { id: 0, title: 'Bem-vindo', icon: Sparkles },
    { id: 1, title: 'Sua Empresa', icon: Building2 },
    { id: 2, title: 'Seu Negócio', icon: Calculator },
    { id: 3, title: 'Tudo pronto!', icon: Rocket },
  ];

  const regimes = [
    { id: 'mei', label: 'MEI', desc: 'Faturamento até R$ 81 mil/ano', tip: 'Ideal para quem está começando ou fatura pouco', icon: '🏠' },
    { id: 'simples', label: 'Simples Nacional', desc: 'Faturamento até R$ 4,8 milhões/ano', tip: 'O mais comum entre pequenas empresas', icon: '📊' },
    { id: 'presumido', label: 'Lucro Presumido', desc: 'Faturamento até R$ 78 milhões/ano', tip: 'Bom para quem tem margem alta', icon: '📈' },
    { id: 'real', label: 'Lucro Real', desc: 'Sem limite de faturamento', tip: 'Obrigatório para grandes empresas', icon: '🏢' },
    { id: 'nao_sei', label: 'Não sei ainda', desc: 'Vamos te ajudar a descobrir!', tip: 'O sistema vai recomendar o melhor para você', icon: '🤔' },
  ];

  const ufs = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'];

  const faixasReceita = [
    { value: '40000', label: 'Até R$ 40 mil/ano', example: '~R$ 3.300/mês' },
    { value: '81000', label: 'Até R$ 81 mil/ano', example: '~R$ 6.750/mês' },
    { value: '180000', label: 'Até R$ 180 mil/ano', example: '~R$ 15 mil/mês' },
    { value: '360000', label: 'Até R$ 360 mil/ano', example: '~R$ 30 mil/mês' },
    { value: '720000', label: 'Até R$ 720 mil/ano', example: '~R$ 60 mil/mês' },
    { value: '1800000', label: 'Até R$ 1,8 milhão/ano', example: '~R$ 150 mil/mês' },
    { value: '4800000', label: 'Até R$ 4,8 milhões/ano', example: '~R$ 400 mil/mês' },
    { value: '10000000', label: 'Acima de R$ 4,8 milhões/ano', example: '' },
  ];

  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    // Validate
    const newErrors = {};
    if (currentStep === 1) {
      if (!empresaData.nomeEmpresa.trim()) newErrors.nomeEmpresa = 'Como se chama seu negócio?';
      if (!empresaData.cidade.trim()) newErrors.cidade = 'Qual a cidade?';
    }
    if (currentStep === 2) {
      if (!empresaData.atividade) newErrors.atividade = 'Selecione seu tipo de negócio';
      if (!empresaData.receitaAnual) newErrors.receitaAnual = 'Selecione a faixa de faturamento';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      const regime = empresaData.regime === 'nao_sei' ? 'simples' : (empresaData.regime || 'simples');
      const perfilEmpresa = {
        ...empresaData,
        regime,
        configDate: new Date().toISOString(),
        onboardingCompleted: true,
      };
      localStorage.setItem('precificalc_perfil', JSON.stringify(perfilEmpresa));
      localStorage.setItem('precificalc_onboarded', 'true');
      onComplete(perfilEmpresa);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const updateEmpresa = (field, value) => {
    setEmpresaData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const inputClass = (field) => `w-full px-4 py-3 border ${errors[field] ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-slate-800 bg-white transition-all text-sm`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-brand-500/10 border border-slate-200 overflow-hidden">
          
          {/* Progress bar */}
          {currentStep > 0 && (
            <div className="h-1 bg-slate-100">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-cyan-500 transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          )}

          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <div className="p-6 sm:p-10">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-500/25">
                  <Calculator className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  Bem-vindo ao PrecifiCALC
                </h1>
                <p className="text-slate-500 text-base max-w-md mx-auto">
                  A plataforma que ajuda você, empresário, a entender seus números e <strong>lucrar mais</strong>.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {VALUE_PROPS.map((prop, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="p-2.5 rounded-xl bg-brand-100 text-brand-600 flex-shrink-0">
                      <prop.icon size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">{prop.title}</h3>
                      <p className="text-slate-500 text-sm">{prop.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full py-4 bg-gradient-to-r from-brand-600 to-cyan-600 text-white rounded-xl font-semibold text-base hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 touch-manipulation"
              >
                Começar em 2 minutos <ArrowRight size={18} />
              </button>
              <p className="text-center text-xs text-slate-400 mt-3">
                Configuração rápida • Seus dados ficam salvos no navegador
              </p>
            </div>
          )}

          {/* Step 1: Dados da Empresa */}
          {currentStep === 1 && (
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-6 h-6 text-brand-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Conte sobre seu negócio</h2>
                <p className="text-sm text-slate-500 mt-1">Informações básicas para personalizar o sistema</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nome do seu negócio
                  </label>
                  <input
                    type="text"
                    value={empresaData.nomeEmpresa}
                    onChange={(e) => updateEmpresa('nomeEmpresa', e.target.value)}
                    className={inputClass('nomeEmpresa')}
                    placeholder="Ex: Studio Design Maria, Hamburgueria do João..."
                  />
                  {errors.nomeEmpresa && <p className="text-xs text-red-500 mt-1">{errors.nomeEmpresa}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    CNPJ <span className="text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={empresaData.cnpj}
                    onChange={(e) => updateEmpresa('cnpj', formatCNPJ(e.target.value))}
                    className={inputClass('cnpj')}
                    placeholder="00.000.000/0001-00"
                    maxLength={18}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Cidade</label>
                    <input
                      type="text"
                      value={empresaData.cidade}
                      onChange={(e) => updateEmpresa('cidade', e.target.value)}
                      className={inputClass('cidade')}
                      placeholder="Ex: São Paulo"
                    />
                    {errors.cidade && <p className="text-xs text-red-500 mt-1">{errors.cidade}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">UF</label>
                    <select
                      value={empresaData.uf}
                      onChange={(e) => updateEmpresa('uf', e.target.value)}
                      className={inputClass('uf')}
                    >
                      <option value="">--</option>
                      {ufs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Atividade e Regime */}
          {currentStep === 2 && (
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Calculator className="w-6 h-6 text-brand-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Detalhes do negócio</h2>
                <p className="text-sm text-slate-500 mt-1">Isso ajuda a calcular seus impostos com precisão</p>
              </div>

              <div className="space-y-5">
                {/* Atividade */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    O que seu negócio faz?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(EXAMPLE_BUSINESSES).map(([ativ, example]) => (
                      <button
                        key={ativ}
                        onClick={() => updateEmpresa('atividade', ativ)}
                        className={`text-left p-3 rounded-xl border-2 transition-all text-sm touch-manipulation ${
                          empresaData.atividade === ativ
                            ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-medium text-slate-800 block">{ativ}</span>
                        {example && <span className="text-[11px] text-slate-400">{example}</span>}
                      </button>
                    ))}
                  </div>
                  {errors.atividade && <p className="text-xs text-red-500 mt-1">{errors.atividade}</p>}
                </div>

                {/* Faixa de receita */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Quanto fatura (ou pretende faturar) por ano?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {faixasReceita.map((faixa) => (
                      <button
                        key={faixa.value}
                        onClick={() => updateEmpresa('receitaAnual', faixa.value)}
                        className={`text-left p-3 rounded-xl border-2 transition-all text-sm touch-manipulation ${
                          empresaData.receitaAnual === faixa.value
                            ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-medium text-slate-800">{faixa.label}</span>
                        {faixa.example && <span className="text-[11px] text-slate-400 ml-1">{faixa.example}</span>}
                      </button>
                    ))}
                  </div>
                  {errors.receitaAnual && <p className="text-xs text-red-500 mt-1">{errors.receitaAnual}</p>}
                </div>

                {/* Regime */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Qual seu regime tributário atual?
                  </label>
                  <div className="space-y-2">
                    {regimes.map((regime) => (
                      <button
                        key={regime.id}
                        onClick={() => updateEmpresa('regime', regime.id)}
                        className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 touch-manipulation ${
                          empresaData.regime === regime.id
                            ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xl flex-shrink-0">{regime.icon}</span>
                        <div>
                          <span className="font-semibold text-slate-800 text-sm block">{regime.label}</span>
                          <span className="text-xs text-slate-500">{regime.desc}</span>
                          <span className="text-[11px] text-brand-600 block mt-0.5">{regime.tip}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmação */}
          {currentStep === 3 && (
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Tudo pronto! 🎉</h2>
                <p className="text-slate-500 mt-1">Seu painel está configurado e pronto para usar</p>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Negócio:</span>
                  <span className="font-medium text-slate-800">{empresaData.nomeEmpresa}</span>
                </div>
                {empresaData.cidade && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Local:</span>
                    <span className="font-medium text-slate-800">{empresaData.cidade}{empresaData.uf && `/${empresaData.uf}`}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Atividade:</span>
                  <span className="font-medium text-slate-800">{empresaData.atividade}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Regime:</span>
                  <span className="font-medium text-slate-800">
                    {regimes.find(r => r.id === empresaData.regime)?.label || 'A definir'}
                  </span>
                </div>
              </div>

              {/* Next steps */}
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-2">
                <h4 className="font-semibold text-brand-900 mb-3 text-sm flex items-center gap-2">
                  <Rocket size={16} /> O que fazer agora:
                </h4>
                <div className="space-y-2.5">
                  <NextStepItem
                    number="1"
                    title="Simule seus impostos"
                    desc="Veja quanto paga de tributo no seu regime"
                  />
                  <NextStepItem
                    number="2"
                    title="Compare regimes"
                    desc="Descubra se pode economizar mudando de regime"
                  />
                  <NextStepItem
                    number="3"
                    title="Precifique seus produtos"
                    desc="Defina preços que cobrem custos e geram lucro"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer - Navigation */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="flex justify-between items-center">
              {currentStep > 0 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center px-4 py-2.5 text-slate-500 hover:text-slate-800 transition-colors text-sm touch-manipulation rounded-lg hover:bg-slate-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </button>
              ) : <div />}

              {currentStep > 0 && (
                <button
                  onClick={handleNext}
                  className="flex items-center px-6 sm:px-8 py-3 bg-gradient-to-r from-brand-600 to-cyan-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.99] transition-all touch-manipulation"
                >
                  {currentStep === 3 ? '🚀 Começar a usar' : 'Continuar'}
                  {currentStep < 3 && <ChevronRight className="w-4 h-4 ml-1" />}
                </button>
              )}
            </div>

            {/* Step dots */}
            {currentStep > 0 && (
              <div className="flex justify-center gap-2 mt-4">
                {[1, 2, 3].map(s => (
                  <div
                    key={s}
                    className={`w-2 h-2 rounded-full transition-all ${
                      s === currentStep
                        ? 'w-6 bg-brand-500'
                        : s < currentStep
                        ? 'bg-brand-300'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Skip option */}
        {currentStep > 0 && currentStep < 3 && (
          <button
            onClick={() => {
              const perfilEmpresa = {
                nomeEmpresa: empresaData.nomeEmpresa || 'Meu Negócio',
                regime: 'simples',
                atividade: empresaData.atividade || 'Outros',
                configDate: new Date().toISOString(),
                onboardingCompleted: true,
              };
              localStorage.setItem('precificalc_perfil', JSON.stringify(perfilEmpresa));
              localStorage.setItem('precificalc_onboarded', 'true');
              onComplete(perfilEmpresa);
            }}
            className="block mx-auto mt-4 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Pular configuração e explorar →
          </button>
        )}
      </div>
    </div>
  );
}

function NextStepItem({ number, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-brand-200 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
        {number}
      </div>
      <div>
        <p className="text-sm font-medium text-brand-900">{title}</p>
        <p className="text-xs text-brand-700/70">{desc}</p>
      </div>
    </div>
  );
}
