import { useState } from 'react';
import { CheckCircle, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

export default function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
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

  const steps = [
    { id: 1, title: 'Sobre você', emoji: '👋' },
    { id: 2, title: 'Sua empresa', emoji: '🏢' },
    { id: 3, title: 'Pronto!', emoji: '🚀' },
  ];

  const regimes = [
    { id: 'mei', label: '🟢 MEI', desc: 'Fatura até R$ 81 mil/ano', tip: 'Começando ou fatura pouco' },
    { id: 'simples', label: '🔵 Simples Nacional', desc: 'Fatura até R$ 4,8 milhões/ano', tip: 'Maioria dos pequenos negócios' },
    { id: 'presumido', label: '🟣 Lucro Presumido', desc: 'Fatura até R$ 78 milhões/ano', tip: 'Empresa média-grande' },
    { id: 'real', label: '🟠 Lucro Real', desc: 'Sem limite', tip: 'Grande empresa ou margem apertada' },
  ];

  const atividades = [
    '🛍️ Comércio / Loja',
    '🔧 Prestação de Serviços',
    '💻 Tecnologia / Software',
    '📋 Consultoria',
    '🏥 Saúde',
    '🎓 Educação',
    '🍕 Alimentação',
    '🏗️ Construção',
    '🏭 Indústria',
    '📦 Outros',
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      const perfilEmpresa = {
        ...empresaData,
        configDate: new Date().toISOString(),
        onboardingCompleted: true
      };
      localStorage.setItem('precificalc_perfil', JSON.stringify(perfilEmpresa));
      localStorage.setItem('precificalc_onboarded', 'true');
      onComplete(perfilEmpresa);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return empresaData.nomeEmpresa;
      case 2: return empresaData.regime && empresaData.atividade;
      case 3: return true;
      default: return false;
    }
  };

  const updateEmpresa = (field, value) => {
    setEmpresaData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">{steps[currentStep - 1].emoji}</span>
          </div>
          <h1 className="text-2xl font-bold">
            {currentStep === 1 && 'Bem-vindo ao PrecifiCALC! 🎉'}
            {currentStep === 2 && 'Sobre sua empresa'}
            {currentStep === 3 && 'Tudo pronto!'}
          </h1>
          <p className="text-brand-100 mt-2 text-sm">
            {currentStep === 1 && 'Vamos descobrir o preço certo para o que você vende'}
            {currentStep === 2 && 'Para calcular seus impostos corretamente'}
            {currentStep === 3 && 'Agora vamos descobrir se você está cobrando certo!'}
          </p>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`h-2 rounded-full transition-all ${
                  currentStep >= step.id ? 'w-12 bg-white' : 'w-8 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Como se chama sua empresa? (ou seu nome)
                </label>
                <input
                  type="text"
                  value={empresaData.nomeEmpresa}
                  onChange={(e) => updateEmpresa('nomeEmpresa', e.target.value)}
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-lg"
                  placeholder="Ex: Maria's Bolos, João Consultor..."
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cidade (opcional)
                  </label>
                  <input
                    type="text"
                    value={empresaData.cidade}
                    onChange={(e) => updateEmpresa('cidade', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="Ex: São Paulo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    CNPJ (opcional)
                  </label>
                  <input
                    type="text"
                    value={empresaData.cnpj}
                    onChange={(e) => updateEmpresa('cnpj', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Tipo da empresa (regime tributário):
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {regimes.map((regime) => (
                    <div
                      key={regime.id}
                      onClick={() => updateEmpresa('regime', regime.id)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        empresaData.regime === regime.id
                          ? 'border-brand-500 bg-brand-50 shadow-md'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-slate-800">{regime.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{regime.desc}</div>
                      <div className="text-xs text-brand-600 font-medium mt-1">{regime.tip}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">💡 Não sabe? Provavelmente é Simples Nacional.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    O que você faz?
                  </label>
                  <select
                    value={empresaData.atividade}
                    onChange={(e) => updateEmpresa('atividade', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">Selecione...</option>
                    {atividades.map((ativ) => (
                      <option key={ativ} value={ativ}>{ativ}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Faturamento mensal (aproximado)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                    <input
                      type="number"
                      value={empresaData.receitaAnual ? Math.round(empresaData.receitaAnual / 12) : ''}
                      onChange={(e) => updateEmpresa('receitaAnual', (parseFloat(e.target.value) || 0) * 12)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      placeholder="30.000"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Perfeito!</h3>
                <p className="text-slate-500">Agora vou te ajudar a descobrir o preço certo</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 space-y-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-slate-400">Empresa:</span> <span className="font-medium">{empresaData.nomeEmpresa}</span></div>
                  <div><span className="text-slate-400">Tipo:</span> <span className="font-medium">{regimes.find(r => r.id === empresaData.regime)?.label}</span></div>
                  <div><span className="text-slate-400">Atividade:</span> <span className="font-medium">{empresaData.atividade}</span></div>
                  {empresaData.cidade && <div><span className="text-slate-400">Cidade:</span> <span className="font-medium">{empresaData.cidade}</span></div>}
                </div>
              </div>

              <div className="bg-gradient-to-r from-brand-50 to-emerald-50 border border-brand-200 rounded-xl p-5">
                <h4 className="font-bold text-brand-800 mb-3">🎯 O que fazer primeiro:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                    <span className="text-brand-700">Clique em <strong>"Quero Precificar!"</strong> para descobrir seu preço ideal</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-7 h-7 rounded-full bg-brand-400 text-white flex items-center justify-center text-xs font-bold">2</span>
                    <span className="text-brand-700">Veja <strong>"Comparar Impostos"</strong> para descobrir se está no tipo certo</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-7 h-7 rounded-full bg-brand-300 text-white flex items-center justify-center text-xs font-bold">3</span>
                    <span className="text-brand-700">Use <strong>"Se eu crescer..."</strong> para planejar o futuro</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          <div className="flex justify-between">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center px-6 py-3 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center px-8 py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {currentStep === 3 ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Vamos descobrir meu preço!
                </>
              ) : (
                <>
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
