import { useState, useEffect, useMemo, useRef } from 'react';
import { Wallet, Plus, Trash2, Edit3, Save, X, Users, Calculator } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import { formatCurrency, calcEncargos, calcEncargoCLT } from '../data/taxData';
import PageHeader from '../components/PageHeader';
import CostBreakdownChart from '../components/CostBreakdownChart';
import ConfirmDialog from '../components/ConfirmDialog';

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
  const [numSocios, setNumSocios] = useState(1);
  const [ratPercent, setRatPercent] = useState(2);
  const [issAliquota, setIssAliquota] = useState(5);
  const [showEncargos, setShowEncargos] = useState(false);
  const [salarioCLTCalc, setSalarioCLTCalc] = useState(3000);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, type: null, nome: '' });

  // Undo toast state
  const [undoItem, setUndoItem] = useState(null);
  const undoTimerRef = useRef(null);
  const [regime, setRegime] = useState(() => {
    try {
      const sim = localStorage.getItem('precificalc_simulador');
      if (sim) return JSON.parse(sim).regime || 'simples';
    } catch { /* ignore */ }
    return 'simples';
  });

  const totalFixos = custosFixos.reduce((sum, c) => sum + c.valor, 0);
  const totalVariaveis = custosVariaveis.reduce((sum, c) => sum + c.valor, 0) * quantidadeMensal;
  const encargos = calcEncargos(ratPercent / 100);

  // Pro-labore per socio calculations
  const TETO_INSS_2026 = 932.31; // 11% sobre teto INSS
  const inssSocioPorSocio = Math.min(proLabore * 0.11, TETO_INSS_2026);
  // INSS patronal sobre pró-labore: 20% para LP/LR (Lei 8.212/91, Art. 22), 0% para Simples (exceto Anexo IV)
  const regimeComPatronal = ['presumido', 'real'].includes(regime);
  const inssPatronalPorSocio = regimeComPatronal ? proLabore * 0.20 : 0;
  const custoProLaborePorSocio = proLabore + inssPatronalPorSocio;
  const custoProLaboreTotal = custoProLaborePorSocio * numSocios;
  const custoFolhaCLT = numFuncionarios * salarioMedio * encargos.multiplicador;
  const custoFolha = custoFolhaCLT + custoProLaboreTotal;
  const totalGeral = totalFixos + totalVariaveis + custoFolha;
  const custoPorUnidade = quantidadeMensal > 0 ? totalGeral / quantidadeMensal : 0;
  const custoVariavelUnitario = custosVariaveis.reduce((sum, c) => sum + c.valor, 0);

  // CLT calculator (informational)
  const cltCalc = useMemo(() => {
    return calcEncargoCLT(salarioCLTCalc, Math.round(ratPercent));
  }, [salarioCLTCalc, ratPercent]);

  // Salvar no localStorage para integração com Precificação
  useEffect(() => {
    localStorage.setItem('precificalc_custos', JSON.stringify({
      totalFixos, totalVariaveis, custoFolha, totalGeral, custoPorUnidade,
      quantidadeMensal, custoVariavelUnitario,
      despesasFixas: totalFixos + custoFolha,
      issAliquota,
      ratPercent,
      multiplicadorEncargos: encargos.multiplicador,
      folhaMensal: custoFolha,
      numFuncionarios, salarioMedio, proLabore, numSocios,
    }));
  }, [totalFixos, totalVariaveis, custoFolha, totalGeral, custoPorUnidade, quantidadeMensal, custoVariavelUnitario, issAliquota, ratPercent, encargos.multiplicador, numFuncionarios, salarioMedio, proLabore, numSocios]);

  const pieData = [
    { name: 'Custos Fixos', value: totalFixos },
    { name: 'Custos Variáveis', value: totalVariaveis },
    { name: 'Folha + Pró-Labore', value: custoFolha },
  ];
  const pieCategorias = {};
  custosFixos.forEach(c => { pieCategorias[c.categoria] = (pieCategorias[c.categoria] || 0) + c.valor; });
  const pieCategData = Object.entries(pieCategorias).map(([name, value]) => ({ name, value }));
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
  function confirmRemoveCusto() {
    const { id, type } = deleteConfirm;
    const list = type === 'f' ? custosFixos : custosVariaveis;
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      const item = list[idx];
      setUndoItem({ item, idx, type });
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => setUndoItem(null), 5000);
    }
    removeCusto(id, type);
    setDeleteConfirm({ open: false, id: null, type: null, nome: '' });
  }

  function handleUndo() {
    if (undoItem) {
      if (undoItem.type === 'f') {
        setCustosFixos(prev => [...prev.slice(0, undoItem.idx), undoItem.item, ...prev.slice(undoItem.idx)]);
      } else {
        setCustosVariaveis(prev => [...prev.slice(0, undoItem.idx), undoItem.item, ...prev.slice(undoItem.idx)]);
      }
      setUndoItem(null);
      clearTimeout(undoTimerRef.current);
    }
  }
  function startEdit(item) { setEditingId(item.id); setEditValue({ ...item }); }
  function saveEdit(type) {
    if (type === 'f') setCustosFixos(custosFixos.map(c => c.id === editingId ? { ...editValue } : c));
    else setCustosVariaveis(custosVariaveis.map(c => c.id === editingId ? { ...editValue } : c));
    setEditingId(null);
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader icon={Wallet} title="Custos Operacionais" description="Mapeie todos os custos do negócio para formar preço e analisar viabilidade" />

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
            <InputField label="Salário Médio" value={salarioMedio} onChange={setSalarioMedio} prefix="R$" step={500} help={`Custo total aprox. ${encargos.multiplicador.toFixed(2)}x com encargos`} />
            <InputField label="Pró-Labore por Sócio" value={proLabore} onChange={setProLabore} prefix="R$" step={1000} />
            <InputField label="Número de Sócios" value={numSocios} onChange={setNumSocios} min={1} max={20} step={1} />
            <SelectField label="Regime Tributário" value={regime} onChange={setRegime} options={[
              { value: 'simples', label: 'Simples Nacional' },
              { value: 'presumido', label: 'Lucro Presumido' },
              { value: 'real', label: 'Lucro Real' },
            ]} help="Define INSS patronal sobre pró-labore (20% para LP/LR)" />
            <InputField label="Alíquota ISS do Município (%)" value={issAliquota} onChange={setIssAliquota} suffix="%" min={2} max={5} step={0.5} help="Varia por município (2% a 5%)" />
            <InputField label="RAT/GILRAT (%)" value={ratPercent} onChange={setRatPercent} suffix="%" min={1} max={3} step={0.5} help="Risco de acidente (1-3%)" />
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">CLT Total ({encargos.multiplicador.toFixed(2)}x)</span><span className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(custoFolhaCLT)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">+ Pró-Labore ({numSocios} {numSocios === 1 ? 'sócio' : 'sócios'})</span><span className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(proLabore * numSocios)}</span></div>
              {inssPatronalPorSocio > 0 && (
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">+ INSS Patronal (20% pró-labore × {numSocios})</span><span className="text-amber-600 dark:text-amber-400 font-mono">{formatCurrency(inssPatronalPorSocio * numSocios)}</span></div>
              )}
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">Pró-labore não tem FGTS, férias ou 13o salário</p>
              <div className="flex justify-between font-medium"><span className="text-slate-700 dark:text-slate-300">= Folha Total</span><span className="text-brand-600 dark:text-brand-400 font-mono">{formatCurrency(custoFolha)}</span></div>
              <button onClick={() => setShowEncargos(!showEncargos)} className="text-xs text-brand-600 hover:text-brand-700 mt-2 flex items-center gap-1">
                {showEncargos ? '\u25BC' : '\u25B6'} Detalhamento de Encargos (multiplicador: {encargos.multiplicador.toFixed(2)}x)
              </button>
              {showEncargos && (
                <div className="mt-2 text-xs space-y-1">
                  {encargos.detalhamento.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-slate-500">{item.nome}</span>
                      <span className="text-slate-700 font-mono">{(item.percentual * 100).toFixed(2)}% = {formatCurrency(salarioMedio * item.percentual)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium border-t border-slate-200 pt-1">
                    <span className="text-slate-700">Total Encargos</span>
                    <span className="text-brand-600 font-mono">{(encargos.total * 100).toFixed(2)}%</span>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><h2 className="text-slate-800 font-medium text-sm">Distribuição de Custos</h2></CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-2 text-center">Por Tipo</p>
                <CostBreakdownChart items={pieData.map(d => ({ label: d.name, value: d.value }))} />
                <details className="mt-2">
                  <summary className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                    Ver dados em tabela
                  </summary>
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-1 px-2">Tipo</th>
                          <th className="text-right py-1 px-2">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pieData.map((item) => (
                          <tr key={item.name} className="border-b border-slate-100 dark:border-slate-700">
                            <td className="py-1 px-2 text-slate-700 dark:text-slate-300">{item.name}</td>
                            <td className="py-1 px-2 text-right text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(item.value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2 text-center">Fixos por Categoria</p>
                <CostBreakdownChart items={pieCategData.map(d => ({ label: d.name, value: d.value }))} />
                <details className="mt-2">
                  <summary className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                    Ver dados em tabela
                  </summary>
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-1 px-2">Categoria</th>
                          <th className="text-right py-1 px-2">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pieCategData.map((item) => (
                          <tr key={item.name} className="border-b border-slate-100 dark:border-slate-700">
                            <td className="py-1 px-2 text-slate-700 dark:text-slate-300">{item.name}</td>
                            <td className="py-1 px-2 text-right text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(item.value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
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
                      <td className="px-5 py-2.5 text-right"><div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => startEdit(custo)} className="p-1 text-slate-400 hover:text-blue-600 rounded"><Edit3 size={13} /></button><button onClick={() => setDeleteConfirm({ open: true, id: custo.id, type: 'f', nome: custo.nome })} className="p-1 text-slate-400 hover:text-red-600 rounded"><Trash2 size={13} /></button></div></td>
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
                  <td className="px-5 py-2.5 text-right"><button onClick={() => setDeleteConfirm({ open: true, id: custo.id, type: 'v', nome: custo.nome })} className="p-1 text-slate-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={13} /></button></td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="border-t border-slate-200"><td className="px-5 py-3 font-medium text-slate-700" colSpan={3}>Total Custos Variáveis</td><td className="px-5 py-3 text-right font-semibold text-blue-600 font-mono">{formatCurrency(totalVariaveis)}</td><td></td></tr></tfoot>
          </table>
        </div>
      </Card>

      {/* Pró-labore dos Sócios */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-violet-600 dark:text-violet-400" />
            <div>
              <h2 className="text-slate-800 dark:text-slate-200 font-medium text-sm">Pró-labore dos Sócios</h2>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Remuneração mensal obrigatória dos sócios administradores</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
              <p className="text-slate-400 dark:text-slate-500 text-xs mb-1">Pró-labore por sócio</p>
              <p className="text-slate-700 dark:text-slate-300 font-mono font-medium">{formatCurrency(proLabore)}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
              <p className="text-slate-400 dark:text-slate-500 text-xs mb-1">INSS sócio (11%, teto {formatCurrency(TETO_INSS_2026)})</p>
              <p className="text-red-600 dark:text-red-400 font-mono font-medium">-{formatCurrency(inssSocioPorSocio)}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
              <p className="text-slate-400 dark:text-slate-500 text-xs mb-1">INSS patronal (20%){!regimeComPatronal ? ' — N/A Simples' : ''}</p>
              <p className={`font-mono font-medium ${inssPatronalPorSocio > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                {inssPatronalPorSocio > 0 ? formatCurrency(inssPatronalPorSocio) : 'R$ 0,00'}
              </p>
            </div>
            <div className="p-3 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 rounded-md">
              <p className="text-violet-600 dark:text-violet-400 text-xs mb-1 font-medium">Custo total ({numSocios} {numSocios === 1 ? 'sócio' : 'sócios'})</p>
              <p className="text-violet-700 dark:text-violet-300 font-mono font-bold text-lg">{formatCurrency(custoProLaboreTotal)}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">Pró-labore não tem FGTS, férias ou 13o salário. INSS sócio: Lei 8.212/91, Art. 21.</p>
        </CardBody>
      </Card>

      {/* Calculadora CLT Rápida */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-slate-800 dark:text-slate-200 font-medium text-sm">Calculadora CLT Rápida</h2>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Simule o custo real de um funcionário CLT (informativo)</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="max-w-xs mb-4">
            <InputField label="Salário bruto (CLT)" value={salarioCLTCalc} onChange={setSalarioCLTCalc} prefix="R$" step={500} min={0} />
          </div>
          {cltCalc && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Salário bruto</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(cltCalc.salarioBruto)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">INSS patronal (20%)</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(cltCalc.encargosDetalhados.inssPatronal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">FGTS (8%)</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(cltCalc.encargosDetalhados.fgts)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">13o provisionado</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(cltCalc.encargosDetalhados.prov13)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Ferias + 1/3</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(cltCalc.encargosDetalhados.provFerias)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">RAT/GILRAT</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(cltCalc.encargosDetalhados.rat)}</span>
              </div>
              <div className="col-span-1 sm:col-span-2 border-t border-slate-200 dark:border-slate-700 pt-2 mt-1 flex justify-between">
                <span className="text-slate-800 dark:text-slate-200 font-medium">Custo total empresa</span>
                <span className="text-brand-600 dark:text-brand-400 font-bold font-mono">{formatCurrency(cltCalc.custoTotal)} ({cltCalc.multiplicador.toFixed(2)}x)</span>
              </div>
            </div>
          )}
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 italic">Esta calculadora e apenas informativa e nao adiciona valores aos custos da pagina.</p>
        </CardBody>
      </Card>

      <Card className="border-brand-200 dark:border-brand-800">
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-md"><p className="text-slate-400 text-xs mb-1">Custos Fixos</p><p className="text-lg font-semibold text-slate-700 font-mono">{formatCurrency(totalFixos)}</p></div>
            <div className="text-center p-3 bg-slate-50 rounded-md"><p className="text-slate-400 text-xs mb-1">Custos Variáveis</p><p className="text-lg font-semibold text-slate-700 font-mono">{formatCurrency(totalVariaveis)}</p></div>
            <div className="text-center p-3 bg-slate-50 rounded-md"><p className="text-slate-400 text-xs mb-1">Folha + Pró-labore</p><p className="text-lg font-semibold text-slate-700 font-mono">{formatCurrency(custoFolha)}</p></div>
            <div className="text-center p-3 bg-brand-50 border border-brand-200 rounded-md"><p className="text-brand-600 text-xs mb-1 font-medium">CUSTO TOTAL MENSAL</p><p className="text-xl font-bold text-brand-700 font-mono">{formatCurrency(totalGeral)}</p><p className="text-xs text-slate-500 mt-0.5">{formatCurrency(custoPorUnidade)}/unidade</p></div>
          </div>
        </CardBody>
      </Card>

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title="Excluir custo?"
        message={`Excluir "${deleteConfirm.nome}"?`}
        confirmLabel="Excluir"
        onConfirm={confirmRemoveCusto}
        onCancel={() => setDeleteConfirm({ open: false, id: null, type: null, nome: '' })}
      />

      {undoItem && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-800 dark:bg-slate-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fadeIn">
          <span className="text-sm">Item excluído.</span>
          <button onClick={handleUndo} className="text-sm font-medium text-brand-400 hover:text-brand-300">
            Desfazer
          </button>
        </div>
      )}
    </div>
  );
}
