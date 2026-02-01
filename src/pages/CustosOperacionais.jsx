import { useState } from 'react';
import { Wallet, Plus, Trash2, Edit3, Save, X, Building2, Cpu, Briefcase, Megaphone, Shield, GraduationCap } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField from '../components/InputField';
import { formatCurrency, custosDefaultContabilidade } from '../data/taxData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CATEGORY_COLORS = {
  'Infraestrutura': '#10b981',
  'Tecnologia': '#3b82f6',
  'Operacional': '#8b5cf6',
  'Comercial': '#f59e0b',
  'Regulatório': '#ef4444',
  'Pessoal': '#06b6d4',
  'Mão de Obra': '#ec4899',
  'Outro': '#64748b',
};

const CATEGORY_ICONS = {
  'Infraestrutura': Building2,
  'Tecnologia': Cpu,
  'Operacional': Briefcase,
  'Comercial': Megaphone,
  'Regulatório': Shield,
  'Pessoal': GraduationCap,
};

export default function CustosOperacionais() {
  const [custosFixos, setCustosFixos] = useState(
    custosDefaultContabilidade.fixos.map((c, i) => ({ ...c, id: `f${i}` }))
  );
  const [custosVariaveis, setCustosVariaveis] = useState(
    custosDefaultContabilidade.variavelPorCliente.map((c, i) => ({ ...c, id: `v${i}` }))
  );
  const [numClientes, setNumClientes] = useState(50);
  const [numFuncionarios, setNumFuncionarios] = useState(5);
  const [salarioMedio, setSalarioMedio] = useState(3500);
  const [proLabore, setProLabore] = useState(8000);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState({});

  // Calculations
  const totalFixos = custosFixos.reduce((sum, c) => sum + c.valor, 0);
  const totalVariaveis = custosVariaveis.reduce((sum, c) => sum + c.valor, 0) * numClientes;
  const custoFolha = (numFuncionarios * salarioMedio * 1.7) + proLabore; // ~70% encargos CLT
  const totalGeral = totalFixos + totalVariaveis + custoFolha;
  const custoPorCliente = numClientes > 0 ? totalGeral / numClientes : 0;

  // Pie chart data
  const pieData = [
    { name: 'Custos Fixos', value: totalFixos },
    { name: 'Custos Variáveis', value: totalVariaveis },
    { name: 'Folha + Pró-Labore', value: custoFolha },
  ];

  const pieCategorias = {};
  custosFixos.forEach(c => {
    pieCategorias[c.categoria] = (pieCategorias[c.categoria] || 0) + c.valor;
  });
  const pieCategData = Object.entries(pieCategorias).map(([name, value]) => ({ name, value }));

  // CRUD functions
  function addCusto(type) {
    const id = `${type}${Date.now()}`;
    const newItem = { id, nome: 'Novo custo', valor: 0, categoria: 'Outro' };
    if (type === 'f') {
      setCustosFixos([...custosFixos, newItem]);
    } else {
      setCustosVariaveis([...custosVariaveis, newItem]);
    }
    setEditingId(id);
    setEditValue(newItem);
  }

  function removeCusto(id, type) {
    if (type === 'f') {
      setCustosFixos(custosFixos.filter(c => c.id !== id));
    } else {
      setCustosVariaveis(custosVariaveis.filter(c => c.id !== id));
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditValue({ ...item });
  }

  function saveEdit(type) {
    if (type === 'f') {
      setCustosFixos(custosFixos.map(c => c.id === editingId ? { ...editValue } : c));
    } else {
      setCustosVariaveis(custosVariaveis.map(c => c.id === editingId ? { ...editValue } : c));
    }
    setEditingId(null);
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Wallet className="text-purple-400" size={28} />
          Custos Operacionais
        </h1>
        <p className="text-dark-400 mt-1">Gerencie todos os custos do seu escritório contábil</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Total Mensal" value={formatCurrency(totalGeral)} color="primary" />
        <StatCard icon={Wallet} label="Custo por Cliente" value={formatCurrency(custoPorCliente)} subvalue={`${numClientes} clientes`} color="blue" />
        <StatCard icon={Wallet} label="Custos Fixos" value={formatCurrency(totalFixos)} color="purple" />
        <StatCard icon={Wallet} label="Folha + Encargos" value={formatCurrency(custoFolha)} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters */}
        <Card>
          <CardHeader><h2 className="text-white font-semibold">Parâmetros da Empresa</h2></CardHeader>
          <CardBody className="space-y-4">
            <InputField label="Número de Clientes" value={numClientes} onChange={setNumClientes} min={1} step={1} />
            <InputField label="Funcionários CLT" value={numFuncionarios} onChange={setNumFuncionarios} min={0} step={1} />
            <InputField label="Salário Médio CLT" value={salarioMedio} onChange={setSalarioMedio} prefix="R$" step={500} help="Custo total ≈ 1.7x (com encargos)" />
            <InputField label="Pró-Labore" value={proLabore} onChange={setProLabore} prefix="R$" step={1000} />
            
            <div className="pt-3 border-t border-dark-700/30 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">Custo CLT Total</span>
                <span className="text-dark-200 font-medium">{formatCurrency(numFuncionarios * salarioMedio * 1.7)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">+ Pró-Labore</span>
                <span className="text-dark-200 font-medium">{formatCurrency(proLabore)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-dark-300">= Folha Total</span>
                <span className="text-primary-400">{formatCurrency(custoFolha)}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Charts */}
        <Card className="lg:col-span-2">
          <CardHeader><h2 className="text-white font-semibold">Distribuição de Custos</h2></CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm text-dark-400 mb-2 text-center">Por Tipo</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#3b82f6" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      formatter={(v) => formatCurrency(v)}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-sm text-dark-400 mb-2 text-center">Fixos por Categoria</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieCategData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {pieCategData.map((entry, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#64748b'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      formatter={(v) => formatCurrency(v)}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Fixed Costs Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold">Custos Fixos Mensais</h2>
            <p className="text-dark-400 text-sm mt-0.5">Independem do número de clientes</p>
          </div>
          <button
            onClick={() => addCusto('f')}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-lg text-sm font-medium hover:bg-primary-500/20 transition-colors"
          >
            <Plus size={16} /> Adicionar
          </button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700/30">
                <th className="text-left px-6 py-3 text-dark-400 font-medium">Custo</th>
                <th className="text-left px-6 py-3 text-dark-400 font-medium">Categoria</th>
                <th className="text-right px-6 py-3 text-dark-400 font-medium">Valor Mensal</th>
                <th className="text-right px-6 py-3 text-dark-400 font-medium w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/20">
              {custosFixos.map((custo) => (
                <tr key={custo.id} className="hover:bg-dark-800/30 group">
                  {editingId === custo.id ? (
                    <>
                      <td className="px-6 py-2">
                        <input
                          type="text"
                          value={editValue.nome}
                          onChange={(e) => setEditValue({ ...editValue, nome: e.target.value })}
                          className="bg-dark-900 border border-dark-600 rounded px-2 py-1 text-sm text-dark-100 w-full"
                        />
                      </td>
                      <td className="px-6 py-2">
                        <select
                          value={editValue.categoria}
                          onChange={(e) => setEditValue({ ...editValue, categoria: e.target.value })}
                          className="bg-dark-900 border border-dark-600 rounded px-2 py-1 text-sm text-dark-100"
                        >
                          {Object.keys(CATEGORY_COLORS).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-2 text-right">
                        <input
                          type="number"
                          value={editValue.valor}
                          onChange={(e) => setEditValue({ ...editValue, valor: parseFloat(e.target.value) || 0 })}
                          className="bg-dark-900 border border-dark-600 rounded px-2 py-1 text-sm text-dark-100 w-28 text-right"
                        />
                      </td>
                      <td className="px-6 py-2 text-right">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => saveEdit('f')} className="p-1 text-primary-400 hover:bg-primary-500/10 rounded">
                            <Save size={16} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-dark-500 hover:bg-dark-700 rounded">
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-3 text-dark-200">{custo.nome}</td>
                      <td className="px-6 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${CATEGORY_COLORS[custo.categoria] || '#64748b'}20`,
                            color: CATEGORY_COLORS[custo.categoria] || '#64748b',
                          }}
                        >
                          {custo.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-dark-200">{formatCurrency(custo.valor)}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(custo)} className="p-1 text-dark-500 hover:text-blue-400 hover:bg-blue-500/10 rounded">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => removeCusto(custo.id, 'f')} className="p-1 text-dark-500 hover:text-rose-400 hover:bg-rose-500/10 rounded">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-dark-700/50">
                <td className="px-6 py-3 font-semibold text-dark-300" colSpan={2}>Total Custos Fixos</td>
                <td className="px-6 py-3 text-right font-bold text-primary-400 font-mono">{formatCurrency(totalFixos)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Variable Costs */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold">Custos Variáveis por Cliente</h2>
            <p className="text-dark-400 text-sm mt-0.5">Custos que aumentam com cada novo cliente</p>
          </div>
          <button
            onClick={() => addCusto('v')}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors"
          >
            <Plus size={16} /> Adicionar
          </button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700/30">
                <th className="text-left px-6 py-3 text-dark-400 font-medium">Custo</th>
                <th className="text-left px-6 py-3 text-dark-400 font-medium">Categoria</th>
                <th className="text-right px-6 py-3 text-dark-400 font-medium">Valor/Cliente</th>
                <th className="text-right px-6 py-3 text-dark-400 font-medium">Total ({numClientes} clientes)</th>
                <th className="text-right px-6 py-3 text-dark-400 font-medium w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/20">
              {custosVariaveis.map((custo) => (
                <tr key={custo.id} className="hover:bg-dark-800/30 group">
                  <td className="px-6 py-3 text-dark-200">{custo.nome}</td>
                  <td className="px-6 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[custo.categoria] || '#64748b'}20`,
                        color: CATEGORY_COLORS[custo.categoria] || '#64748b',
                      }}
                    >
                      {custo.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-dark-200">{formatCurrency(custo.valor)}</td>
                  <td className="px-6 py-3 text-right font-mono text-dark-300">{formatCurrency(custo.valor * numClientes)}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => removeCusto(custo.id, 'v')} className="p-1 text-dark-500 hover:text-rose-400 hover:bg-rose-500/10 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-dark-700/50">
                <td className="px-6 py-3 font-semibold text-dark-300" colSpan={3}>Total Custos Variáveis</td>
                <td className="px-6 py-3 text-right font-bold text-blue-400 font-mono">{formatCurrency(totalVariaveis)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Grand Total */}
      <Card className="border-primary-500/20">
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-dark-900/30 rounded-lg">
              <p className="text-dark-400 text-xs mb-1">Custos Fixos</p>
              <p className="text-lg font-bold text-dark-200">{formatCurrency(totalFixos)}</p>
            </div>
            <div className="text-center p-3 bg-dark-900/30 rounded-lg">
              <p className="text-dark-400 text-xs mb-1">Custos Variáveis</p>
              <p className="text-lg font-bold text-dark-200">{formatCurrency(totalVariaveis)}</p>
            </div>
            <div className="text-center p-3 bg-dark-900/30 rounded-lg">
              <p className="text-dark-400 text-xs mb-1">Folha + Pró-labore</p>
              <p className="text-lg font-bold text-dark-200">{formatCurrency(custoFolha)}</p>
            </div>
            <div className="text-center p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg">
              <p className="text-primary-400 text-xs mb-1 font-medium">TOTAL MENSAL</p>
              <p className="text-2xl font-bold text-primary-400">{formatCurrency(totalGeral)}</p>
              <p className="text-xs text-dark-500 mt-1">{formatCurrency(custoPorCliente)}/cliente</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
