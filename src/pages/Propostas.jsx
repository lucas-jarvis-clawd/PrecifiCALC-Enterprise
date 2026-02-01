import { useState, useRef } from 'react';
import { FileText, Download, Plus, Trash2, Building, User } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import { formatCurrency } from '../data/taxData';

export default function Propostas() {
  const [empresa, setEmpresa] = useState({
    nome: '',
    cnpj: '',
    responsavel: '',
    telefone: '',
    email: '',
    segmento: 'comercio',
  });

  const [cliente, setCliente] = useState({
    nome: '',
    cnpj: '',
    contato: '',
    email: '',
  });

  const [itens, setItens] = useState([
    { id: 1, produto: 'Produto/Servico A', descricao: 'Descricao detalhada do item', quantidade: 10, valorUnitario: 250, tipo: 'produto' },
    { id: 2, produto: 'Produto/Servico B', descricao: 'Descricao detalhada do item', quantidade: 5, valorUnitario: 500, tipo: 'produto' },
    { id: 3, produto: 'Servico de instalacao', descricao: 'Instalacao e configuracao', quantidade: 1, valorUnitario: 1500, tipo: 'servico' },
  ]);

  const [desconto, setDesconto] = useState(0);
  const [validade, setValidade] = useState(15);
  const [condicaoPagamento, setCondicaoPagamento] = useState('30dias');
  const [observacoes, setObservacoes] = useState(
    'Valores sujeitos a alteracao sem aviso previo.\nFrete nao incluso, cotado separadamente.\nGarantia conforme especificacoes de cada produto.'
  );

  const previewRef = useRef(null);

  const subtotal = itens.reduce((s, i) => s + (i.quantidade * i.valorUnitario), 0);
  const descontoValor = subtotal * (desconto / 100);
  const totalFinal = subtotal - descontoValor;

  function addItem() {
    setItens([...itens, { id: Date.now(), produto: '', descricao: '', quantidade: 1, valorUnitario: 0, tipo: 'produto' }]);
  }

  function removeItem(id) {
    setItens(itens.filter(i => i.id !== id));
  }

  function updateItem(id, field, value) {
    setItens(itens.map(i => i.id === id ? { ...i, [field]: value } : i));
  }

  function printProposta() {
    const printContent = previewRef.current;
    if (!printContent) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Proposta Comercial - ${cliente.nome}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a2e; background: white; padding: 40px; font-size: 14px; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #2563eb; }
            .logo-area h1 { font-size: 24px; color: #2563eb; margin-bottom: 4px; }
            .logo-area p { color: #666; font-size: 12px; }
            .meta { text-align: right; font-size: 12px; color: #666; }
            .meta strong { color: #333; }
            .section { margin: 25px 0; }
            .section-title { font-size: 16px; font-weight: 700; color: #1a1a2e; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #eee; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            .info-item { font-size: 13px; }
            .info-item span { color: #666; }
            .info-item strong { color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th { background: #f8f9fa; padding: 10px 12px; text-align: left; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #eee; }
            td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
            .total-row { background: #eff6ff; font-weight: 700; }
            .total-row td { color: #2563eb; border-bottom: 2px solid #2563eb; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 11px; color: #999; text-align: center; }
            .obs { background: #f8f9fa; padding: 15px; border-radius: 8px; font-size: 12px; color: #666; white-space: pre-line; }
            .signature { margin-top: 60px; display: flex; justify-content: space-between; }
            .sig-line { width: 45%; text-align: center; padding-top: 10px; border-top: 1px solid #ccc; font-size: 12px; color: #666; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>window.print();<\/script>
        </body>
      </html>
    `);
    win.document.close();
  }

  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const validadeDate = new Date(hoje.getTime() + validade * 24 * 60 * 60 * 1000);
  const validadeFormatada = validadeDate.toLocaleDateString('pt-BR');
  const condPagLabel = { 'avista': 'A vista', '30dias': '30 dias', '30_60': '30/60 dias', '30_60_90': '30/60/90 dias' };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-surface-700 pb-4">
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <FileText className="text-brand-400" size={22} />
          Gerador de Propostas Comerciais
        </h1>
        <p className="text-surface-400 text-sm mt-1">Crie propostas comerciais de produtos e servicos para enviar aos clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados da Empresa */}
        <Card>
          <CardHeader>
            <h2 className="text-white font-medium text-sm flex items-center gap-2">
              <Building size={16} className="text-brand-400" /> Dados da Empresa
            </h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <InputField type="text" label="Razao Social" value={empresa.nome} onChange={(v) => setEmpresa({ ...empresa, nome: v })} placeholder="Nome da empresa" />
            <div className="grid grid-cols-2 gap-3">
              <InputField type="text" label="CNPJ" value={empresa.cnpj} onChange={(v) => setEmpresa({ ...empresa, cnpj: v })} placeholder="00.000.000/0001-00" />
              <SelectField label="Segmento" value={empresa.segmento} onChange={(v) => setEmpresa({ ...empresa, segmento: v })} options={[
                { value: 'comercio', label: 'Comercio' },
                { value: 'industria', label: 'Industria' },
                { value: 'servicos', label: 'Servicos' },
              ]} />
            </div>
            <InputField type="text" label="Responsavel" value={empresa.responsavel} onChange={(v) => setEmpresa({ ...empresa, responsavel: v })} placeholder="Nome do responsavel" />
            <div className="grid grid-cols-2 gap-3">
              <InputField type="text" label="Telefone" value={empresa.telefone} onChange={(v) => setEmpresa({ ...empresa, telefone: v })} />
              <InputField type="text" label="E-mail" value={empresa.email} onChange={(v) => setEmpresa({ ...empresa, email: v })} />
            </div>
          </CardBody>
        </Card>

        {/* Dados do Cliente */}
        <Card>
          <CardHeader>
            <h2 className="text-white font-medium text-sm flex items-center gap-2">
              <User size={16} className="text-blue-400" /> Destinatario da Proposta
            </h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <InputField type="text" label="Razao Social" value={cliente.nome} onChange={(v) => setCliente({ ...cliente, nome: v })} placeholder="Nome do cliente" />
            <InputField type="text" label="CNPJ / CPF" value={cliente.cnpj} onChange={(v) => setCliente({ ...cliente, cnpj: v })} placeholder="00.000.000/0001-00" />
            <InputField type="text" label="Contato" value={cliente.contato} onChange={(v) => setCliente({ ...cliente, contato: v })} placeholder="Nome do contato" />
            <InputField type="text" label="E-mail" value={cliente.email} onChange={(v) => setCliente({ ...cliente, email: v })} placeholder="email@cliente.com" />
          </CardBody>
        </Card>
      </div>

      {/* Itens da Proposta */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-white font-medium text-sm">Itens da Proposta</h2>
          <button onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/10 text-brand-400 border border-brand-600/20 rounded-md text-xs font-medium hover:bg-brand-600/20 transition-colors">
            <Plus size={14} /> Adicionar Item
          </button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700">
                <th className="text-left px-4 py-3 text-surface-400 font-medium text-xs uppercase tracking-wider">Produto/Servico</th>
                <th className="text-left px-4 py-3 text-surface-400 font-medium text-xs uppercase tracking-wider">Descricao</th>
                <th className="text-center px-4 py-3 text-surface-400 font-medium text-xs uppercase tracking-wider">Qtd</th>
                <th className="text-right px-4 py-3 text-surface-400 font-medium text-xs uppercase tracking-wider">Valor Unit.</th>
                <th className="text-right px-4 py-3 text-surface-400 font-medium text-xs uppercase tracking-wider">Subtotal</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {itens.map(item => (
                <tr key={item.id} className="hover:bg-surface-900/50">
                  <td className="px-4 py-2">
                    <input type="text" value={item.produto} onChange={(e) => updateItem(item.id, 'produto', e.target.value)}
                      className="w-full bg-surface-900 border border-surface-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500" placeholder="Nome do item" />
                  </td>
                  <td className="px-4 py-2">
                    <input type="text" value={item.descricao} onChange={(e) => updateItem(item.id, 'descricao', e.target.value)}
                      className="w-full bg-surface-900 border border-surface-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500" placeholder="Descricao" />
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" value={item.quantidade} onChange={(e) => updateItem(item.id, 'quantidade', parseInt(e.target.value) || 0)}
                      className="w-16 bg-surface-900 border border-surface-600 rounded px-2 py-1.5 text-sm text-white text-center font-mono focus:outline-none focus:border-brand-500" min={1} />
                  </td>
                  <td className="px-4 py-2">
                    <input type="number" value={item.valorUnitario} onChange={(e) => updateItem(item.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                      className="w-28 bg-surface-900 border border-surface-600 rounded px-2 py-1.5 text-sm text-white text-right font-mono focus:outline-none focus:border-brand-500" step={10} />
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-surface-300 text-sm">
                    {formatCurrency(item.quantidade * item.valorUnitario)}
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => removeItem(item.id)} className="p-1 text-surface-500 hover:text-red-400 rounded transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <InputField label="Desconto (%)" value={desconto} onChange={setDesconto} suffix="%" min={0} max={50} step={1} />
            <InputField label="Validade (dias)" value={validade} onChange={setValidade} suffix="dias" min={5} max={90} step={5} />
            <SelectField label="Condicao de Pagamento" value={condicaoPagamento} onChange={setCondicaoPagamento} options={[
              { value: 'avista', label: 'A vista' },
              { value: '30dias', label: '30 dias' },
              { value: '30_60', label: '30/60 dias' },
              { value: '30_60_90', label: '30/60/90 dias' },
            ]} />
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Resumo</label>
              <div className="bg-surface-900 rounded-md p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-400">Subtotal</span>
                  <span className="text-surface-200 font-mono">{formatCurrency(subtotal)}</span>
                </div>
                {desconto > 0 && (
                  <div className="flex justify-between">
                    <span className="text-surface-400">Desconto ({desconto}%)</span>
                    <span className="text-red-400 font-mono">-{formatCurrency(descontoValor)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t border-surface-700 pt-1">
                  <span className="text-brand-400">Total</span>
                  <span className="text-brand-400 font-mono">{formatCurrency(totalFinal)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-surface-400 mb-1.5">Observacoes</label>
            <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3}
              className="w-full bg-surface-900 border border-surface-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500" />
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <button onClick={printProposta}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-md font-medium hover:bg-brand-700 transition-colors">
          <Download size={16} /> Gerar PDF / Imprimir
        </button>
      </div>

      {/* Hidden Print Preview */}
      <div className="hidden">
        <div ref={previewRef}>
          <div className="header">
            <div className="logo-area">
              <h1>{empresa.nome || 'Empresa'}</h1>
              <p>CNPJ: {empresa.cnpj || '_______________'}</p>
              <p>{empresa.telefone} | {empresa.email}</p>
            </div>
            <div className="meta">
              <p><strong>PROPOSTA COMERCIAL</strong></p>
              <p>{dataFormatada}</p>
              <p>Validade: {validadeFormatada}</p>
            </div>
          </div>

          <div className="section">
            <div className="section-title">Destinatario</div>
            <div className="info-grid">
              <div className="info-item"><span>Razao Social: </span><strong>{cliente.nome || '_______________'}</strong></div>
              <div className="info-item"><span>CNPJ/CPF: </span><strong>{cliente.cnpj || '_______________'}</strong></div>
              <div className="info-item"><span>Contato: </span><strong>{cliente.contato || '_______________'}</strong></div>
              <div className="info-item"><span>E-mail: </span><strong>{cliente.email || '_______________'}</strong></div>
            </div>
          </div>

          <div className="section">
            <div className="section-title">Itens da Proposta</div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Descricao</th>
                  <th style={{ textAlign: 'center' }}>Qtd</th>
                  <th style={{ textAlign: 'right' }}>Valor Unit.</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {itens.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.produto}</strong></td>
                    <td>{item.descricao}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantidade}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.valorUnitario)}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.quantidade * item.valorUnitario)}</td>
                  </tr>
                ))}
                {desconto > 0 && (
                  <tr>
                    <td colSpan={4}><em>Desconto ({desconto}%)</em></td>
                    <td style={{ textAlign: 'right', color: '#dc2626' }}>-{formatCurrency(descontoValor)}</td>
                  </tr>
                )}
                <tr className="total-row">
                  <td colSpan={4}><strong>TOTAL</strong></td>
                  <td style={{ textAlign: 'right' }}><strong>{formatCurrency(totalFinal)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="section">
            <div className="section-title">Condicoes Comerciais</div>
            <div className="info-grid">
              <div className="info-item"><span>Pagamento: </span><strong>{condPagLabel[condicaoPagamento]}</strong></div>
              <div className="info-item"><span>Validade: </span><strong>{validade} dias ({validadeFormatada})</strong></div>
            </div>
          </div>

          {observacoes && (
            <div className="section">
              <div className="section-title">Observacoes</div>
              <div className="obs">{observacoes}</div>
            </div>
          )}

          <div className="signature">
            <div className="sig-line">
              <p><strong>{empresa.responsavel || 'Responsavel'}</strong></p>
              <p>{empresa.nome || 'Empresa'}</p>
            </div>
            <div className="sig-line">
              <p><strong>{cliente.contato || 'Cliente'}</strong></p>
              <p>{cliente.nome || 'Cliente'}</p>
            </div>
          </div>

          <div className="footer">
            <p>Proposta gerada por PrecifiCALC | {dataFormatada} | Valida ate {validadeFormatada}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
