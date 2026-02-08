import { useState } from 'react';
import { CheckCircle, ChevronRight, ChevronLeft, ArrowRight, Building2, ClipboardList, Check } from 'lucide-react';

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
    { id: 1, title: 'Identificação', icon: Building2 },
    { id: 2, title: 'Perfil tributário', icon: ClipboardList },
    { id: 3, title: 'Confirmação', icon: Check },
  ];

  const regimes = [
    { id: 'mei', label: 'MEI', desc: 'Receita Bruta (Faturamento) até R$ 81 mil/ano', tip: 'Microempreendedor individual' },
    { id: 'simples', label: 'Simples Nacional', desc: 'Receita Bruta (Faturamento) até R$ 4,8 milhões/ano', tip: 'Micro e pequenas empresas' },
    { id: 'presumido', label: 'Lucro Presumido', desc: 'Receita Bruta (Faturamento) até R$ 78 milhões/ano', tip: 'Empresas de médio e grande porte' },
    { id: 'real', label: 'Lucro Real', desc: 'Sem limite de faturamento', tip: 'Grandes empresas ou margens reduzidas' },
  ];

  const atividades = [
    'Comércio / Loja',
    'Prestação de Serviços',
    'Tecnologia / Software',
    'Consultoria',
    'Saúde',
    'Educação',
    'Alimentação',
    'Construção',
    'Indústria',
    'Outros',
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

  function formatCnpj(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }

  function handleCnpjChange(e) {
    updateEmpresa('cnpj', formatCnpj(e.target.value));
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Brand header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#001a2d] flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Vértice</span>
            <span className="text-[10px] text-slate-400 font-medium block -mt-1 tracking-wider uppercase">Gestão & Precificação</span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {steps.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isDone ? 'bg-[#001a2d] text-white' :
                    isActive ? 'bg-[#001a2d] text-white' :
                    'bg-slate-200 text-slate-400'
                  }`}>
                    {isDone ? <CheckCircle size={16} /> : <StepIcon size={14} />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${
                    isActive ? 'text-slate-900' : isDone ? 'text-slate-600' : 'text-slate-400'
                  }`}>{step.title}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-12 h-px mx-3 ${isDone ? 'bg-[#001a2d]' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Card header */}
          <div className="px-8 pt-8 pb-2">
            <h1 className="text-xl font-bold text-slate-900">
              {currentStep === 1 && 'Identificação da empresa'}
              {currentStep === 2 && 'Perfil tributário'}
              {currentStep === 3 && 'Confirme os dados'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {currentStep === 1 && 'Informe os dados básicos para personalizar os cálculos.'}
              {currentStep === 2 && 'Defina o regime tributário e a atividade para cálculos precisos.'}
              {currentStep === 3 && 'Verifique as informações antes de prosseguir.'}
            </p>
          </div>

          {/* Divider */}
          <div className="mx-8 my-4 h-px bg-slate-100" />

          {/* Content */}
          <div className="px-8 pb-2">
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nome da empresa ou razão social <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={empresaData.nomeEmpresa}
                    onChange={(e) => updateEmpresa('nomeEmpresa', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001a2d]/20 focus:border-[#001a2d] text-sm"
                    placeholder="Ex: Empresa Exemplo Ltda."
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Cidade <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={empresaData.cidade}
                      onChange={(e) => updateEmpresa('cidade', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001a2d]/20 focus:border-[#001a2d] text-sm"
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      CNPJ <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={empresaData.cnpj}
                      onChange={handleCnpjChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001a2d]/20 focus:border-[#001a2d] text-sm"
                      placeholder="00.000.000/0001-00"
                      maxLength={18}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2.5">
                    Regime tributário <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {regimes.map((regime) => (
                      <div
                        key={regime.id}
                        onClick={() => updateEmpresa('regime', regime.id)}
                        className={`p-3.5 border rounded-lg cursor-pointer transition-all ${
                          empresaData.regime === regime.id
                            ? 'border-[#001a2d] bg-slate-50 ring-1 ring-[#001a2d]'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-800">{regime.label}</span>
                          {empresaData.regime === regime.id && (
                            <CheckCircle size={16} className="text-[#001a2d]" />
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{regime.desc}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{regime.tip}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Em caso de dúvida, selecione Simples Nacional.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Atividade principal <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={empresaData.atividade}
                      onChange={(e) => updateEmpresa('atividade', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001a2d]/20 focus:border-[#001a2d] text-sm"
                    >
                      <option value="">Selecione...</option>
                      {atividades.map((ativ) => (
                        <option key={ativ} value={ativ}>{ativ}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Receita Bruta (Faturamento) mensal <span className="text-slate-400 font-normal">(aproximado)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                      <input
                        type="number"
                        value={empresaData.receitaAnual ? Math.round(empresaData.receitaAnual / 12) : ''}
                        onChange={(e) => updateEmpresa('receitaAnual', (parseFloat(e.target.value) || 0) * 12)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#001a2d]/20 focus:border-[#001a2d] text-sm"
                        placeholder="30.000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="bg-slate-50 rounded-lg border border-slate-100 p-5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Dados cadastrados</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                    <div>
                      <span className="text-slate-400 text-xs">Empresa</span>
                      <p className="font-medium text-slate-800">{empresaData.nomeEmpresa}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs">Regime</span>
                      <p className="font-medium text-slate-800">{regimes.find(r => r.id === empresaData.regime)?.label}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs">Atividade</span>
                      <p className="font-medium text-slate-800">{empresaData.atividade}</p>
                    </div>
                    {empresaData.cidade && (
                      <div>
                        <span className="text-slate-400 text-xs">Cidade</span>
                        <p className="font-medium text-slate-800">{empresaData.cidade}</p>
                      </div>
                    )}
                    {empresaData.cnpj && (
                      <div>
                        <span className="text-slate-400 text-xs">CNPJ</span>
                        <p className="font-medium text-slate-800">{empresaData.cnpj}</p>
                      </div>
                    )}
                    {empresaData.receitaAnual > 0 && (
                      <div>
                        <span className="text-slate-400 text-xs">Receita Bruta (Faturamento) mensal</span>
                        <p className="font-medium text-slate-800">R$ {Math.round(empresaData.receitaAnual / 12).toLocaleString('pt-BR')}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg border border-slate-100 p-5">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Próximos passos</h4>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 text-sm">
                      <span className="w-5 h-5 rounded bg-[#001a2d] text-white flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">1</span>
                      <span className="text-slate-600">Utilize o módulo <strong className="text-slate-800">Precificação</strong> para calcular o preço de venda</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="w-5 h-5 rounded bg-slate-300 text-white flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">2</span>
                      <span className="text-slate-600">Compare regimes tributários em <strong className="text-slate-800">Comparativo</strong></span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <span className="w-5 h-5 rounded bg-slate-300 text-white flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">3</span>
                      <span className="text-slate-600">Projete cenários futuros em <strong className="text-slate-800">Projeção de Crescimento</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-slate-500 hover:text-slate-800 transition-colors rounded-lg hover:bg-slate-50"
                >
                  <ChevronLeft size={16} />
                  Voltar
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#001a2d] text-white rounded-lg text-sm font-medium hover:bg-[#002a45] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {currentStep === 3 ? (
                  <>
                    Acessar sistema
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    Continuar
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Seus dados ficam armazenados localmente no navegador. Nenhuma informação é enviada a servidores externos.
        </p>
      </div>
    </div>
  );
}
