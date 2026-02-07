import { useState, useEffect } from 'react';
import './index.css';

// Loading Component Profissional
function ProfessionalLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        {/* Logo Corporativo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <span className="text-white text-3xl font-bold tracking-wider">P</span>
          </div>
          <h1 className="text-3xl font-light text-white mb-2 tracking-wide">PrecifiCALC</h1>
          <p className="text-slate-300 text-sm font-light tracking-widest uppercase">Enterprise Edition</p>
        </div>

        {/* Loading Animation Elegante */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '400ms'}}></div>
          </div>
        </div>
        
        <p className="text-slate-400 text-sm font-light">Carregando plataforma empresarial...</p>
      </div>
    </div>
  );
}

// App Principal Profissional
function App() {
  const [loading, setLoading] = useState(true);
  const [receita, setReceita] = useState('');
  const [custos, setCustos] = useState('');
  const [margem, setMargem] = useState(35);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const calcularPreco = () => {
    const custosNum = parseFloat(custos) || 0;
    const margemDecimal = margem / 100;
    const precoVenda = custosNum / (1 - margemDecimal);
    const lucro = precoVenda - custosNum;
    
    return {
      precoVenda: precoVenda.toFixed(2),
      lucro: lucro.toFixed(2),
      margemReal: ((lucro / precoVenda) * 100).toFixed(1)
    };
  };

  const resultado = calcularPreco();

  if (loading) {
    return <ProfessionalLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header Corporativo */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">P</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-800 tracking-tight">PrecifiCALC</h1>
              <p className="text-xs text-slate-500 tracking-wide">ENTERPRISE</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700">Lucas Lyra</p>
            <p className="text-xs text-slate-500">CEO & Founder</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Dashboard Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-light text-slate-800 mb-2">Calculadora de Precificação</h2>
          <p className="text-slate-600 text-sm">Análise estratégica de margem e rentabilidade</p>
        </div>

        {/* Cards Profissionais */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Custos Totais</h3>
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <span className="text-red-500 text-lg">💸</span>
              </div>
            </div>
            <input
              type="number"
              value={custos}
              onChange={(e) => setCustos(e.target.value)}
              placeholder="0.00"
              className="w-full text-2xl font-light text-slate-800 bg-transparent border-none outline-none placeholder-slate-400"
            />
            <p className="text-xs text-slate-500 mt-2">em Reais (R$)</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Margem Objetivo</h3>
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="text-blue-500 text-lg">📊</span>
              </div>
            </div>
            <div className="text-2xl font-light text-slate-800 mb-2">{margem}%</div>
            <input
              type="range"
              min="15"
              max="70"
              value={margem}
              onChange={(e) => setMargem(e.target.value)}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>15%</span>
              <span>70%</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Preço Sugerido</h3>
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-emerald-600 text-lg">💰</span>
              </div>
            </div>
            <div className="text-2xl font-semibold text-emerald-700">
              R$ {custos ? resultado.precoVenda : '0.00'}
            </div>
            <p className="text-xs text-emerald-600 mt-2">Margem: {custos ? resultado.margemReal : '0'}%</p>
          </div>
        </div>

        {/* Análise Detalhada */}
        {custos && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
            <h3 className="font-semibold text-slate-700 mb-4">Análise de Rentabilidade</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-slate-600 mb-1">Custos Totais</p>
                <p className="text-xl font-semibold text-slate-800">R$ {parseFloat(custos).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Lucro Bruto</p>
                <p className="text-xl font-semibold text-emerald-600">R$ {resultado.lucro}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Margem Efetiva</p>
                <p className="text-xl font-semibold text-blue-600">{resultado.margemReal}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions Corporativas */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button className="bg-blue-500 text-white py-4 px-6 rounded-xl font-medium hover:bg-blue-600 transition-all duration-200 flex items-center justify-center space-x-2">
            <span>📊</span>
            <span>Análise Tributária</span>
          </button>
          <button className="bg-slate-800 text-white py-4 px-6 rounded-xl font-medium hover:bg-slate-900 transition-all duration-200 flex items-center justify-center space-x-2">
            <span>📄</span>
            <span>Gerar Proposta</span>
          </button>
        </div>

        {/* Módulos Empresariais */}
        <div className="grid md:grid-cols-4 gap-4">
          <button className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 text-center">
            <div className="text-2xl mb-2">🏛️</div>
            <p className="text-sm font-medium text-slate-700">Simulador</p>
            <p className="text-xs text-slate-500">Tributário</p>
          </button>
          <button className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 text-center">
            <div className="text-2xl mb-2">📈</div>
            <p className="text-sm font-medium text-slate-700">DRE</p>
            <p className="text-xs text-slate-500">Financeiro</p>
          </button>
          <button className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 text-center">
            <div className="text-2xl mb-2">⚖️</div>
            <p className="text-sm font-medium text-slate-700">Comparativo</p>
            <p className="text-xs text-slate-500">Regimes</p>
          </button>
          <button className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 text-center">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-sm font-medium text-slate-700">Analytics</p>
            <p className="text-xs text-slate-500">Avançado</p>
          </button>
        </div>

        {/* Footer Profissional */}
        <div className="mt-12 text-center border-t border-slate-200 pt-8">
          <p className="text-xs text-slate-500">
            PrecifiCALC Enterprise • Desenvolvido por Lucas Tech • Versão 2.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;