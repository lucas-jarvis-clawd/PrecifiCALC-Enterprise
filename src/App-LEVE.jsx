import { useState } from 'react';
import './index.css';

// Versão LEVE do PrecifiCALC - Carregamento Rápido
function App() {
  const [receita, setReceita] = useState('');
  const [custos, setCustos] = useState('');
  const [margem, setMargem] = useState(30);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <h1 className="text-white text-2xl font-bold">PrecifiCALC</h1>
          <p className="text-white/80 text-sm">Calculadora Empresarial</p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-gray-800 mb-4">💰 Calcular Preço</h2>
          
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                💸 Custos Totais (R$)
              </label>
              <input
                type="number"
                value={custos}
                onChange={(e) => setCustos(e.target.value)}
                placeholder="Ex: 100.00"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📊 Margem Desejada (%)
              </label>
              <input
                type="range"
                min="10"
                max="80"
                value={margem}
                onChange={(e) => setMargem(e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10%</span>
                <span className="font-bold text-blue-600">{margem}%</span>
                <span>80%</span>
              </div>
            </div>
          </div>

          {/* Resultado */}
          {custos && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-2">📈 Resultado:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>💰 Preço de Venda:</span>
                  <span className="font-bold text-green-600">R$ {resultado.precoVenda}</span>
                </div>
                <div className="flex justify-between">
                  <span>💵 Lucro:</span>
                  <span className="font-bold text-blue-600">R$ {resultado.lucro}</span>
                </div>
                <div className="flex justify-between">
                  <span>📊 Margem Real:</span>
                  <span className="font-bold text-purple-600">{resultado.margemReal}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 space-y-2">
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              💾 Salvar Cálculo
            </button>
            <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
              📄 Gerar Proposta
            </button>
          </div>
        </div>

        {/* Menu Simples */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="bg-white/20 text-white p-4 rounded-lg text-center hover:bg-white/30 transition-colors">
            <div className="text-2xl mb-1">🏛️</div>
            <div className="text-sm font-medium">Impostos</div>
          </button>
          <button className="bg-white/20 text-white p-4 rounded-lg text-center hover:bg-white/30 transition-colors">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-sm font-medium">Relatórios</div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-white/60 text-xs">
          <p>Versão Rápida • Lucas Tech</p>
          <p className="mt-1">Carregamento otimizado para mobile 📱</p>
        </div>
      </div>
    </div>
  );
}

export default App;