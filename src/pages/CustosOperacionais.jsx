import { useState } from 'react';
import { Wallet, Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField from '../components/InputField';
import { formatCurrency } from '../data/taxData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CATEGORY_COLORS = {
  'Infraestrutura': '#3b82f6',
  'Operacional': '#8b5cf6',
  'Comercial': '#f59e0b',
  'Administrativo': '#06b6d4',
  'Mao de Obra': '#ec4899',
  'Logistica': '#f97316',
  'Marketing': '#10b981',
  'Outro': '#6b7280',
};

const defaultCustosFixos = [
  { nome: 'Aluguel do ponto comercial', valor: 3500, categoria: 'Infraestrutura' },
  { nome: 'Energia eletrica', valor: 800, categoria: 'Infraestrutura' },
  { nome: 'Internet e telefone', valor: 350, categoria: 'Infraestrutura' },
  { nome: 'Seguro empresarial', valor: 400, categoria: 'Administrativo' },
  { nome: 'Contabilidade', valor: 900, categoria: 'Administrativo' },
  { nome: 'Software e licencas', valor: 500, categoria: 'Operacional' },
  { nome: 'Marketing mensal', valor: 1200, categoria: 'Marketing' },
];

const defaultCustosVariaveis = [
  { nome: 'Materia-prima / CMV', valor: 45, categoria: 'Operacional' },
  { nome: 'Embalagem', valor: 5, categoria: 'Logistica' },
  { nome: 'Frete de entrega', valor: 12, categoria: 'Logistica' },
  { nome: 'Comissao de venda', valor: 8, categoria: 'Comercial' },
];

export default function CustosOperacionais() {
  const [custosFixos, setCustosFixos] = useState(
    defaultCustosFixos.map((c, i) => ({ ...c, id: `f${i}` }))
  );
  const [custosVariaveis, setCustosVariaveis] = useState(
    defaultCustosVariaveis.map((c, i) => ({ ...c, id: `v${i}` }))
  );
  const [quantidadeMensal, setQuantidadeMensal] = useState(500);
  const [numFuncionarios, setNumFuncionarios] = useState(8);
  const [salarioMedio, setSalarioMedio] = useState(2500);
  const [proLabore, setProLabore] = useState(10000);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState({});

  const totalFixos = custosFixos.reduce((sum, c) => sum + c.valor, 0);
  const totalVariaveis = custosVariaveis.reduce((sum, c) => sum + c.valor, 0) * quantidadeMensal;
  const custoFolha = (numFuncionarios * salarioMedio * 1.7) + proLabore;
  const totalGeral = totalFixos + totalVariaveis + custoFolha;
  const custoPorUnidade = quantidadeMensal > 0 ? totalGeral / quantidadeMensal : 0;

  const pieData = [
    { name: 'Custos Fixos', value: totalFixos },
    { name: 'Custos Variaveis', value: totalVariaveis },
    { name: 'Folha + Pro-Labore', value: custoFolha },
  ];

  const pieCategorias = {};
  custosFixos.forEach(c => { pieCategorias[c.categoria] = (pieCategorias[c.categoria] || 0) + c.valor; });
  const pieCategData = Object.entries(pieCategorias).map(([name, value]) => ({ name, value }));

  function addCusto(type) {
    const id = `${type}${Date.now()}`;
    const newItem = { id, nome: 'Novo custo', valor: 0, categoria: 'Outro' };
    if (type === 'f') setCustosFixos([...custosFixos, newItem]);
    else setCustosVariaveis([...custosVariaveis, newItem]);
    setEditingId(id);
    setEditValue(newItem);
  }

  function removeCusto(id, type) {
    if (type === 'f') setCustosFixos(custosFixos.filter(c => c.id !== id));
    else setCustosVariaveis(custosVariaveis.filter(c => c.id !== id));
  }

  function startEdit(item) { setEditingId(item.id); setEditValue({ ...item }); }

  function saveEdit(type) {
    if (type === 'f') setCustosFixos(custosFixos.map(c => c.id === editingId ? { ...editValue } : c));
    else setCustosVariaveis(custosVariaveis.map(c => c.id === editingId ? { ...editValue } : c));
    setEditingId(null);
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-surface-700 pb-4">
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Wallet className="text-brand-400" size={22} />
          Custos Operacionais
        </h1>
        <p className="text-surface-400 text-sm mt-1">Mapeie todos os custos do negocio para formar preco e analisar viabilidade</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Wallet} label="Custo Total Mensal" value={formatCurrency(totalGeral)} color="brand" />
        <StatCard icon={Wallet} label="Custo por Unidade" value={formatCurrency(custoPorUnidade)} subvalue={`${quantidadeMensal} un./mes`} color="blue" />
        <StatCard icon={Wallet} label="Custos Fixos" value={formatCurrency(totalFixos)} color="purple" />
        <StatCard icon={Wallet} label="Folha + Encargos" value={formatCurrency(custoFolha)} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><h2 className="text-white font-medium text-sm">Parametros do Negocio</h2></CardHeader>
          <CardBody className="space-y-3">
            <InputField label="Quantidade Vendida/Mes" value={quantidadeMensal} onChange={setQuantidadeMensal} min={1} step={10} help="Unidades vendidas ou servicos prestados" />
            <InputField label="Funcionarios (CLT)" value={numFuncionarios} onChange={setNumFuncionarios} min={0} step={1} />
            <InputField label="Salario Medio" value={salarioMedio} onChange={setSalarioMedio} prefix="R$" step={500} help="Custo total aprox. 1.7x com encargos" />
            <InputField label="Pro-Labore do Socio" value={proLabore} onChange={setProLabore} prefix="R$" step={1000} />
            <div className="pt-3 border-t border-surface-700 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-surface-400">CLT Total</span><span className="text-surface-200 font-mono">{formatCurrency(numFuncionarios * salarioMedio * 1.7)}</span></div>
              <div className="flex justify-between"><span className="text-surface-400">+ Pro-Labore</span><span className="text-surface-200 font-mono">{formatCurrency(proLabore)}</span></div>
              <div className="flex justify-between font-medium"><span className="text-surface-300">= Folha Total</span><span className="text-brand-400 font-mono">{formatCurrency(custoFolha)}</span></div>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><h2 className="text-white font-medium text-sm">Distribuicao de Custos</h2></CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-surface-500 mb-2 text-center">Por Tipo</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
                      <Cell fill="#3b82f6" /><Cell fill="#f59e0b" /><Cell fill="#8b5cf6" />
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '6px' }} formatter={(v) => formatCurrency(v)} />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-xs text-surface-500 mb-2 text-center">Fixos por Categoria</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieCategData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
                      {pieCategData.map((entry, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '6px' }} formatter={(v) => formatCurrency(v)} />
                    <Legend wrapperStyle={{ fontSize: '10px', color: '#9ca3af' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Custos Fixos */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-medium text-sm">Custos Fixos Mensais</h2>
            <p className="text-surface-500 text-xs mt-0.5">Custos que independem do volume de vendas</p>
          </div>
          <button onClick={() => addCusto('f')} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/10 text-brand-400 border border-brand-600/20 rounded-md text-xs font-medium hover:bg-brand-600/20 transition-colors">
            <Plus size={14} /> Adicionar
          </button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-pro">
            <thead>
              <tr className="border-b border-surface-700">
                <th className="text-left px-5 py-2.5">Custo</th>
                <th className="text-left px-5 py-2.5">Categoria</th>
                <th className="text-right px-5 py-2.5">Valor Mensal</th>
                <th className="text-right px-5 py-2.5 w-20">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {custosFixos.map((custo) => (
                <tr key={custo.id} className="hover:bg-surface-800/50 group">
                  {editingId === custo.id ? (
                    <>
                      <td className="px-5 py-2">
                        <input type="text" value={editValue.nome} onChange={(e) => setEditValue({ ...editValue, nome: e.target.value })}
                          className="bg-surface-900 border border-surface-600 rounded px-2 py-1 text-sm text-surface-100 w-full" />
                      </td>
                      <td className="px-5 py-2">
                        <select value={editValue.categoria} onChange={(e) => setEditValue({ ...editValue, categoria: e.target.value })}
                          className="bg-surface-900 border border-surface-600 rounded px-2 py-1 text-sm text-surface-100">
                          {Object.keys(CATEGORY_COLORS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-2 text-right">
                        <input type="number" value={editValue.valor} onChange={(e) => setEditValue({ ...editValue, valor: parseFloat(e.target.value) || 0 })}
                          className="bg-surface-900 border border-surface-600 rounded px-2 py-1 text-sm text-surface-100 w-24 text-right" />
                      </td>
                      <td className="px-5 py-2 text-right">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => saveEdit('f')} className="p-1 text-brand-400 hover:bg-brand-600/10 rounded"><Save size={14} /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-surface-500 hover:bg-surface-700 rounded"><X size={14} /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-2.5 text-surface-200">{custo.nome}</td>
                      <td className="px-5 py-2.5">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium" style={{
                          backgroundColor: `${CATEGORY_COLORS[custo.categoria] || '#6b7280'}15`,
                          color: CATEGORY_COLORS[custo.categoria] || '#6b7280',
                        }}>{custo.categoria}</span>
                      </td>
                      <td className="px-5 py-2.5 text-right font-mono text-surface-200">{formatCurrency(custo.valor)}</td>
                      <td className="px-5 py-2.5 text-right">
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(custo)} className="p-1 text-surface-500 hover:text-blue-400 rounded"><Edit3 size={13} /></button>
                          <button onClick={() => removeCusto(custo.id, 'f')} className="p-1 text-surface-500 hover:text-red-400 rounded"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-surface-700">
                <td className="px-5 py-3 font-medium text-surface-300" colSpan={2}>Total Custos Fixos</td>
                <td className="px-5 py-3 text-right font-semibold text-brand-400 font-mono">{formatCurrency(totalFixos)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Custos Variaveis */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-medium text-sm">Custos Variaveis por Unidade</h2>
            <p className="text-surface-500 text-xs mt-0.5">Custos que variam conforme o volume de producao/vendas</p>
          </div>
          <button onClick={() => addCusto('v')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-md text-xs font-medium hover:bg-blue-600/20 transition-colors">
            <Plus size={14} /> Adicionar
          </button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-pro">
            <thead>
              <tr className="border-b border-surface-700">
                <th className="text-left px-5 py-2.5">Custo</th>
                <th className="text-left px-5 py-2.5">Categoria</th>
                <th className="text-right px-5 py-2.5">Valor/Unidade</th>
                <th className="text-right px-5 py-2.5">Total ({quantidadeMensal} un.)</th>
                <th className="text-right px-5 py-2.5 w-16">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {custosVariaveis.map((custo) => (
                <tr key={custo.id} className="hover:bg-surface-800/50 group">
                  <td className="px-5 py-2.5 text-surface-200">{custo.nome}</td>
                  <td className="px-5 py-2.5">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium" style={{
                      backgroundColor: `${CATEGORY_COLORS[custo.categoria] || '#6b7280'}15`,
                      color: CATEGORY_COLORS[custo.categoria] || '#6b7280',
                    }}>{custo.categoria}</span>
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono text-surface-200">{formatCurrency(custo.valor)}</td>
                  <td className="px-5 py-2.5 text-right font-mono text-surface-300">{formatCurrency(custo.valor * quantidadeMensal)}</td>
                  <td className="px-5 py-2.5 text-right">
                    <button onClick={() => removeCusto(custo.id, 'v')} className="p-1 text-surface-500 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-surface-700">
                <td className="px-5 py-3 font-medium text-surface-300" colSpan={3}>Total Custos Variaveis</td>
                <td className="px-5 py-3 text-right font-semibold text-blue-400 font-mono">{formatCurrency(totalVariaveis)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Resumo Geral */}
      <Card className="border-brand-600/20">
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-surface-900 rounded-md">
              <p className="text-surface-500 text-xs mb-1">Custos Fixos</p>
              <p className="text-lg font-semibold text-surface-200 font-mono">{formatCurrency(totalFixos)}</p>
            </div>
            <div className="text-center p-3 bg-surface-900 rounded-md">
              <p className="text-surface-500 text-xs mb-1">Custos Variaveis</p>
              <p className="text-lg font-semibold text-surface-200 font-mono">{formatCurrency(totalVariaveis)}</p>
            </div>
            <div className="text-center p-3 bg-surface-900 rounded-md">
              <p className="text-surface-500 text-xs mb-1">Folha + Pro-labore</p>
              <p className="text-lg font-semibold text-surface-200 font-mono">{formatCurrency(custoFolha)}</p>
            </div>
            <div className="text-center p-3 bg-brand-600/10 border border-brand-600/20 rounded-md">
              <p className="text-brand-400 text-xs mb-1 font-medium">CUSTO TOTAL MENSAL</p>
              <p className="text-xl font-bold text-brand-400 font-mono">{formatCurrency(totalGeral)}</p>
              <p className="text-xs text-surface-500 mt-0.5">{formatCurrency(custoPorUnidade)}/unidade</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
