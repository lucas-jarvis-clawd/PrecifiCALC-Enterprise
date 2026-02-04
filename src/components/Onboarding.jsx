import { useState } from 'react';
import { CheckCircle, Building2, Calculator, Settings, ChevronRight, ChevronLeft } from 'lucide-react';

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
    {
      id: 1,
      title: 'Dados da Empresa',
      icon: Building2,
      description: 'Vamos conhecer sua empresa'
    },
    {
      id: 2,
      title: 'Atividade e Regime',
      icon: Calculator,
      description: 'Defina o regime tributário'
    },
    {
      id: 3,
      title: 'Configurações',
      icon: Settings,
      description: 'Últimos ajustes'
    }
  ];

  const regimes = [
    { id: 'mei', label: 'MEI', desc: 'Até R$ 81.000/ano' },
    { id: 'simples', label: 'Simples Nacional', desc: 'Até R$ 4.800.000/ano' },
    { id: 'presumido', label: 'Lucro Presumido', desc: 'Até R$ 78.000.000/ano' },
    { id: 'real', label: 'Lucro Real', desc: 'Acima R$ 78.000.000/ano' }
  ];

  const atividades = [
    'Comércio',
    'Indústria',
    'Prestação de Serviços',
    'Tecnologia/Software',
    'Consultoria',
    'Saúde',
    'Educação',
    'Alimentação',
    'Construção',
    'Outros'
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Salvar dados no localStorage
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
    switch(currentStep) {
      case 1:
        return empresaData.nomeEmpresa && empresaData.cnpj && empresaData.cidade;
      case 2:
        return empresaData.regime && empresaData.atividade && empresaData.receitaAnual;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const updateEmpresa = (field, value) => {
    setEmpresaData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-8 border-b border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Bem-vindo ao PrecifiCALC</h1>
            <p className="text-slate-600 mt-2">Vamos configurar sua empresa em 3 passos simples</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  currentStep >= step.id 
                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                    : 'border-slate-300 text-slate-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ml-2 ${
                    currentStep > step.id ? 'bg-indigo-600' : 'bg-slate-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-4">
            <h2 className="text-lg font-semibold text-slate-900">{steps[currentStep - 1].title}</h2>
            <p className="text-sm text-slate-600">{steps[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    value={empresaData.nomeEmpresa}
                    onChange={(e) => updateEmpresa('nomeEmpresa', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex: Minha Empresa LTDA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    value={empresaData.cnpj}
                    onChange={(e) => updateEmpresa('cnpj', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={empresaData.cidade}
                    onChange={(e) => updateEmpresa('cidade', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex: São Paulo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    UF *
                  </label>
                  <select
                    value={empresaData.uf}
                    onChange={(e) => updateEmpresa('uf', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">UF</option>
                    <option value="SP">SP</option>
                    <option value="RJ">RJ</option>
                    <option value="MG">MG</option>
                    <option value="PR">PR</option>
                    <option value="RS">RS</option>
                    <option value="SC">SC</option>
                    <option value="BA">BA</option>
                    <option value="GO">GO</option>
                    <option value="PE">PE</option>
                    <option value="CE">CE</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Regime Tributário *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {regimes.map((regime) => (
                    <div
                      key={regime.id}
                      onClick={() => updateEmpresa('regime', regime.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        empresaData.regime === regime.id
                          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <div className="font-medium text-slate-900">{regime.label}</div>
                      <div className="text-sm text-slate-600">{regime.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Atividade Principal *
                  </label>
                  <select
                    value={empresaData.atividade}
                    onChange={(e) => updateEmpresa('atividade', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Selecione...</option>
                    {atividades.map((ativ) => (
                      <option key={ativ} value={ativ}>{ativ}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Receita Anual Estimada *
                  </label>
                  <input
                    type="number"
                    value={empresaData.receitaAnual}
                    onChange={(e) => updateEmpresa('receitaAnual', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Ex: 500000"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Tudo pronto!</h3>
                <p className="text-slate-600 mb-6">Suas informações foram configuradas. Você pode alterá-las depois em Configurações.</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Empresa:</span> {empresaData.nomeEmpresa}</div>
                  <div><span className="font-medium">Regime:</span> {regimes.find(r => r.id === empresaData.regime)?.label}</div>
                  <div><span className="font-medium">Atividade:</span> {empresaData.atividade}</div>
                  <div><span className="font-medium">Localização:</span> {empresaData.cidade}/{empresaData.uf}</div>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-medium text-indigo-900 mb-2">🎯 Próximos passos recomendados:</h4>
                <ul className="text-sm text-indigo-800 space-y-1">
                  <li>• Acesse o <strong>Simulador Tributário</strong> para ver seus impostos</li>
                  <li>• Use <strong>Comparativo de Regimes</strong> para otimizar sua tributação</li>
                  <li>• Configure a <strong>Precificação</strong> dos seus produtos/serviços</li>
                </ul>
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
              className="flex items-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {currentStep === 3 ? 'Começar a usar' : 'Continuar'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}