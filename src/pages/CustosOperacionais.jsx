import { useState, useEffect } from 'react';
import { Wallet, Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField from '../components/InputField';
import { formatCurrency } from '../data/taxData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CATEGORY_COLORS = {
  'Infraestrutura': '#3b82f6', 'Operacional': '#8b5cf6', 'Comercial': '#f59e0b',
  'Administrativo': '#06b6d4', 'Mão de Obra': '#ec4899', 'Logística': '#f97316',
  'Marketing': '#10b981', 'Outro': '#6b7280',
};

const defaultCustosFixos = [
  { nome: 'Aluguel do ponto comercial', valor: 3500, categoria: 'Infraestrutura' },
  { nome: 'Energia elétrica', valor: 800, categoria: 'Infraestrutura' },
  { nome: 'Internet e telefone', valor: 350, categoria: 'Infraestrutura' },
  { nome: 'Seguro empresarial', valor: 400, categoria: 'Administrativo' },
  { nome: 'Contabilidade', valor: 900, categoria: 'Administrativo' },
  { nome: 'Software e licenças', valor: 500, categoria: 'Operacional' },
  { nome: 'Marketing mensal', valor: 1200, categoria: 'Marketing' },
];

const defaultCustosVariaveis = [
  { nome: 'Matéria-prima / CMV', valor: 45, categoria: 'Operacional' },
  { nome: 'Embalagem', valor: 5, categoria: 'Logística' },
  { nome: 'Frete de entrega', valor: 12, categoria: 'Logística' },
  { nome: 'Comissão de venda', valor: 8, categoria: 'Comercial' },
];

export default function CustosOperacionais() {
  const [custosFixos, setCustosFixos] = useState(defaultCustosFixos.map((c, i) => ({ ...c, id: `f${i}` })));
  const [custosVariaveis, setCustosVariaveis] = useState(defaultCustosVariaveis.map((c, i) => ({ ...c, id: `v${i}` })));
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
  const custoVariavelUnitario = custosVariaveis.reduce((sum, c) => sum + c.valor, 0);

  // Salvar no localStorage para integração com Precificação
  useEffect(() => {
    localStorage.setItem('precificalc_custos', JSON.stringify({
      totalFixos, totalVariaveis, custoFolha, totalGeral, custoPorUnidade,
      quantidadeMensal, custoVariavelUnitario,
      despesasFixas: totalFixos + custoFolha,
    }));
  }, [totalFixos, totalVariaveis, custoFolha, totalGeral, custoPorUnidade, quantidadeMensal, custoVariavelUnitario]);

  const pieData = [
    { name: 'Custos Fixos', value: totalFixos },
    { name: 'Custos Variáveis', value: totalVariaveis },
    { name: 'Folha + Pró-Labore', value: custoFolha },
  ];
  const pieCategorias = {};
  custosFixos.forEach(c => { pieCategorias[c.categoria] = (pieCategorias[c.categoria] || 0) + c.valor; });
  const pieCategData = Object.entries(pieCategorias).map(([name, value]) => ({ name, value }));
  const tt = { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,.1)' };

  function addCusto(type) {
    const id = `${type}${Date.now()}`;
    const newItem = { id, nome: 'Novo custo', valor: 0, categoria: 'Outro' };
    if (type === 'f') setCustosFixos([...custosFixos, newItem]);
    else setCustosVariaveis([...custosVariaveis, newItem]);
    setEditingId(id); setEditValue(newItem);
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
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Wallet className="text-brand-600" size={22} />
          Custos Operacionais
        </h1>
        <p className="text-slate-500 text-sm mt-1">Mapeie todos os custos do negócio para formar preço e analisar viabilidade</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Wallet} label="Custo Total Mensal" value={formatCurrency(totalGeral)} color="brand" />
        <StatCard icon={Wallet} label="Custo por Unidade" value={formatCurrency(custoPorUnidade)} subvalue={`${quantidadeMensal} un./mês`} color="blue" />
        <StatCard icon={Wallet} label="Custos Fixos" value={formatCurrency(totalFixos)} color="purple" />
        <StatCard icon={Wallet} label="Folha + Encargos" value={formatCurrency(custoFolha)} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><h2 className="text-slate-800 font-medium text-sm">Parâmetros do Negócio</h2></CardHeader>
          <CardBody className="space-y-3">
            <InputField label="Quantidade Vendida/Mês" value={quantidadeMensal} onChange={setQuantidadeMensal} min={1} step={10} help="Unidades vendidas ou serviços prestados" />
            <InputField label="Funcionários (CLT)" value={numFuncionarios} onChange={setNumFuncionarios} min={0} step={1} />
            <InputField label="Salário Médio" value={salarioMedio} onChange={setSalarioMedio} prefix="R$" step={500} help="Custo total aprox. 1.7x com encargos" />
            <InputField label="Pró-Labore do Sócio" value={proLabore} onChange={setProLabore} prefix="R$" step={1000} />
            <div className="pt-3 border-t border-slate-200 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">CLT Total</span><span className="text-slate-700 font-mono">{formatCurrency(numFuncionarios * salarioMedio * 1.7)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">+ Pró-Labore</span><span className="text-slate-700 font-mono">{formatCurrency(proLabore)}</span></div>
              <div className="flex justify-between font-medium"><span className="text-slate-700">= Folha Total</span><span className="text-brand-600 font-mono">{formatCurrency(custoFolha)}</span></div>
            </div>
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><h2 className="text-slate-800 font-medium text-sm">Distribuição de Custos</h2></CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-2 text-center">Por Tipo</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
                    <Cell fill="#3b82f6" /><Cell fill="#f59e0b" /><Cell fill="#8b5cf6" />
                  </Pie><Tooltip contentStyle={tt} formatter={(v) => formatCurrency(v)} /><Legend wrapperStyle={{ fontSize: '11px' }} /></PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2 text-center">Fixos por Categoria</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart><Pie data={pieCategData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {pieCategData.map((e, i) => <Cell key={i} fill={CATEGORY_COLORS[e.name] || '#6b7280'} />)}
                  </Pie><Tooltip contentStyle={tt} formatter={(v) => formatCurrency(v)} /><Legend wrapperStyle={{ fontSize: '10px' }} /></PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Custos Fixos */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div><h2 className="text-slate-800 font-medium text-sm">Custos Fixos Mensais</h2><p className="text-slate-400 text-xs mt-0.5">Custos que independem do volume de vendas</p></div>
          <button onClick={() => addCusto('f')} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-600 border border-brand-200 rounded-md text-xs font-medium hover:bg-brand-100 transition-colors"><Plus size={14} /> Adicionar</button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-pro">
            <thead><tr className="border-b border-slate-100"><th className="text-left px-5 py-2.5">Custo</th><th className="text-left px-5 py-2.5">Categoria</th><th className="text-right px-5 py-2.5">Valor Mensal</th><th className="text-right px-5 py-2.5 w-20">Ações</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {custosFixos.map((custo) => (
                <tr key={custo.id} className="hover:bg-slate-50 group">
                  {editingId === custo.id ? (
                    <>
                      <td className="px-5 py-2"><input type="text" value={editValue.nome} onChange={(e) => setEditValue({ ...editValue, nome: e.target.value })} className="bg-white border border-slate-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:border-brand-500" /></td>
                      <td className="px-5 py-2"><select value={editValue.categoria} onChange={(e) => setEditValue({ ...editValue, categoria: e.target.value })} className="bg-white border border-slate-300 rounded px-2 py-1 text-sm">{Object.keys(CATEGORY_COLORS).map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></td>
                      <td className="px-5 py-2 text-right"><input type="number" value={editValue.valor} onChange={(e) => setEditValue({ ...editValue, valor: parseFloat(e.target.value) || 0 })} className="bg-white border border-slate-300 rounded px-2 py-1 text-sm w-24 text-right" /></td>
                      <td className="px-5 py-2 text-right"><div className="flex gap-1 justify-end"><button onClick={() => saveEdit('f')} className="p-1 text-brand-600 hover:bg-brand-50 rounded"><Save size={14} /></button><button onClick={() => setEditingId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded"><X size={14} /></button></div></td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-2.5 text-slate-700">{custo.nome}</td>
                      <td className="px-5 py-2.5"><span className="inline-block px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${CATEGORY_COLORS[custo.categoria] || '#6b7280'}15`, color: CATEGORY_COLORS[custo.categoria] || '#6b7280' }}>{custo.categoria}</span></td>
                      <td className="px-5 py-2.5 text-right font-mono text-slate-700">{formatCurrency(custo.valor)}</td>
                      <td className="px-5 py-2.5 text-right"><div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => startEdit(custo)} className="p-1 text-slate-400 hover:text-blue-600 rounded"><Edit3 size={13} /></button><button onClick={() => removeCusto(custo.id, 'f')} className="p-1 text-slate-400 hover:text-red-600 rounded"><Trash2 size={13} /></button></div></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="border-t border-slate-200"><td className="px-5 py-3 font-medium text-slate-700" colSpan={2}>Total Custos Fixos</td><td className="px-5 py-3 text-right font-semibold text-brand-600 font-mono">{formatCurrency(totalFixos)}</td><td></td></tr></tfoot>
          </table>
        </div>
      </Card>

      {/* Custos Variáveis */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div><h2 className="text-slate-800 font-medium text-sm">Custos Variáveis por Unidade</h2><p className="text-slate-400 text-xs mt-0.5">Custos que variam conforme o volume de produção/vendas</p></div>
          <button onClick={() => addCusto('v')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors"><Plus size={14} /> Adicionar</button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-pro">
            <thead><tr className="border-b border-slate-100"><th className="text-left px-5 py-2.5">Custo</th><th className="text-left px-5 py-2.5">Categoria</th><th className="text-right px-5 py-2.5">Valor/Unidade</th><th className="text-right px-5 py-2.5">Total ({quantidadeMensal} un.)</th><th className="text-right px-5 py-2.5 w-16">Ações</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {custosVariaveis.map((custo) => (
                <tr key={custo.id} className="hover:bg-slate-50 group">
                  <td className="px-5 py-2.5 text-slate-700">{custo.nome}</td>
                  <td className="px-5 py-2.5"><span className="inline-block px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${CATEGORY_COLORS[custo.categoria] || '#6b7280'}15`, color: CATEGORY_COLORS[custo.categoria] || '#6b7280' }}>{custo.categoria}</span></td>
                  <td className="px-5 py-2.5 text-right font-mono text-slate-700">{formatCurrency(custo.valor)}</td>
                  <td className="px-5 py-2.5 text-right font-mono text-slate-600">{formatCurrency(custo.valor * quantidadeMensal)}</td>
                  <td className="px-5 py-2.5 text-right"><button onClick={() => removeCusto(custo.id, 'v')} className="p-1 text-slate-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={13} /></button></td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="border-t border-slate-200"><td className="px-5 py-3 font-medium text-slate-700" colSpan={3}>Total Custos Variáveis</td><td className="px-5 py-3 text-right font-semibold text-blue-600 font-mono">{formatCurrency(totalVariaveis)}</td><td></td></tr></tfoot>
          </table>
        </div>
      </Card>

      <Card className="border-brand-200">
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-md"><p className="text-slate-400 text-xs mb-1">Custos Fixos</p><p className="text-lg font-semibold text-slate-700 font-mono">{formatCurrency(totalFixos)}</p></div>
            <div className="text-center p-3 bg-slate-50 rounded-md"><p className="text-slate-400 text-xs mb-1">Custos Variáveis</p><p className="text-lg font-semibold text-slate-700 font-mono">{formatCurrency(totalVariaveis)}</p></div>
            <div className="text-center p-3 bg-slate-50 rounded-md"><p className="text-slate-400 text-xs mb-1">Folha + Pró-labore</p><p className="text-lg font-semibold text-slate-700 font-mono">{formatCurrency(custoFolha)}</p></div>
            <div className="text-center p-3 bg-brand-50 border border-brand-200 rounded-md"><p className="text-brand-600 text-xs mb-1 font-medium">CUSTO TOTAL MENSAL</p><p className="text-xl font-bold text-brand-700 font-mono">{formatCurrency(totalGeral)}</p><p className="text-xs text-slate-500 mt-0.5">{formatCurrency(custoPorUnidade)}/unidade</p></div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
