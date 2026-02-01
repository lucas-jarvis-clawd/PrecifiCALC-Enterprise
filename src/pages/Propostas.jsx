import { useState, useRef } from 'react';
import { FileText, Download, Plus, Trash2, Building, User } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import { formatCurrency } from '../data/taxData';

export default function Propostas() {
  const [empresa, setEmpresa] = useState({
    nome: '',
    cnpj: '',
    contato: '',
    email: '',
    regime: 'simples',
    funcionarios: 5,
  });

  const [escritorio, setEscritorio] = useState({
    nome: 'Seu Escritorio Contabil',
    cnpj: '00.000.000/0001-00',
    responsavel: 'Contador Responsavel',
    crc: 'CRC-SP 000000/O',
    telefone: '(11) 99999-9999',
    email: 'contato@escritorio.com.br',
  });

  const [itens, setItens] = useState([
    { id: 1, servico: 'Escrituracao Contabil Mensal', descricao: 'Classificacao contabil, conciliacao e balancetes mensais', valor: 1200, tipo: 'mensal' },
    { id: 2, servico: 'Escrituracao Fiscal', descricao: 'Apuracao de impostos, SPED Fiscal e EFD-Contribuicoes', valor: 1500, tipo: 'mensal' },
    { id: 3, servico: 'Folha de Pagamento', descricao: 'Processamento mensal para ate 5 funcionarios', valor: 800, tipo: 'mensal' },
  ]);

  const [desconto, setDesconto] = useState(0);
  const [validade, setValidade] = useState(15);
  const [observacoes, setObservacoes] = useState(
    'Valores sujeitos a reajuste anual conforme INPC.\nServicos adicionais serao cotados separadamente.\nPagamento ate o dia 10 de cada mes.'
  );

  const previewRef = useRef(null);

  const totalMensal = itens.filter(i => i.tipo === 'mensal').reduce((s, i) => s + i.valor, 0);
  const totalPontual = itens.filter(i => i.tipo !== 'mensal').reduce((s, i) => s + i.valor, 0);
  const descontoValor = totalMensal * (desconto / 100);
  const totalComDesconto = totalMensal - descontoValor;

  function addItem() {
    setItens([...itens, { id: Date.now(), servico: '', descricao: '', valor: 0, tipo: 'mensal' }]);
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
          <title>Proposta - ${empresa.nome}</title>
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

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-surface-700 pb-4">
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <FileText className="text-brand-400" size={22} />
          Gerador de Propostas
        </h1>
        <p className="text-surface-400 text-sm mt-1">Monte propostas comerciais profissionais para seus clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados do Escritorio */}
        <Card>
          <CardHeader>
            <h2 className="text-white font-medium text-sm flex items-center gap-2">
              <Building size={16} className="text-brand-400" /> Dados do Escritorio
            </h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <InputField type="text" label="Nome do Escritorio" value={escritorio.nome} onChange={(v) => setEscritorio({ ...escritorio, nome: v })} />
            <div className="grid grid-cols-2 gap-3">
              <InputField type="text" label="CNPJ" value={escritorio.cnpj} onChange={(v) => setEscritorio({ ...escritorio, cnpj: v })} />
              <InputField type="text" label="CRC" value={escritorio.crc} onChange={(v) => setEscritorio({ ...escritorio, crc: v })} />
            </div>
            <InputField type="text" label="Responsavel" value={escritorio.responsavel} onChange={(v) => setEscritorio({ ...escritorio, responsavel: v })} />
            <div className="grid grid-cols-2 gap-3">
              <InputField type="text" label="Telefone" value={escritorio.telefone} onChange={(v) => setEscritorio({ ...escritorio, telefone: v })} />
              <InputField type="text" label="E-mail" value={escritorio.email} onChange={(v) => setEscritorio({ ...escritorio, email: v })} />
            </div>
          </CardBody>
        </Card>

        {/* Dados do Cliente */}
        <Card>
          <CardHeader>
            <h2 className="text-white font-medium text-sm flex items-center gap-2">
              <User size={16} className="text-blue-400" /> Dados do Cliente
            </h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <InputField type="text" label="Razao Social" value={empresa.nome} onChange={(v) => setEmpresa({ ...empresa, nome: v })} placeholder="Nome da empresa" />
            <div className="grid grid-cols-2 gap-3">
              <InputField type="text" label="CNPJ" value={empresa.cnpj} onChange={(v) => setEmpresa({ ...empresa, cnpj: v })} placeholder="00.000.000/0001-00" />
              <SelectField label="Regime Tributario" value={empresa.regime} onChange={(v) => setEmpresa({ ...empresa, regime: v })} options={[
                { value: 'mei', label: 'MEI' },
                { value: 'simples', label: 'Simples Nacional' },
                { value: 'presumido', label: 'Lucro Presumido' },
                { value: 'real', label: 'Lucro Real' },
              ]} />
            </div>
            <InputField type="text" label="Contato" value={empresa.contato} onChange={(v) => setEmpresa({ ...empresa, contato: v })} placeholder="Nome do contato" />
            <div className="grid grid-cols-2 gap-3">
              <InputField type="text" label="E-mail" value={empresa.email} onChange={(v) => setEmpresa({ ...empresa, email: v })} placeholder="email@empresa.com" />
              <InputField label="Funcionarios" value={empresa.funcionarios} onChange={(v) => setEmpresa({ ...empresa, funcionarios: v })} min={0} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Servicos */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-white font-medium text-sm">Servicos da Proposta</h2>
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/10 text-brand-400 border border-brand-600/20 rounded-md text-xs font-medium hover:bg-brand-600/20 transition-colors"
          >
            <Plus size={14} /> Adicionar
          </button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700">
                <th className="text-left px-4 py-3 text-surface-400 font-medium text-xs uppercase tracking-wider">Servico</th>
                <th className="text-left px-4 py-3 text-surface-400 font-medium text-xs uppercase tracking-wider">Descricao</th>
                <th className="text-center px-4 py-3 text-surface-400 font-medium text-xs uppercase tracking-wider">Tipo</th>
                <th className="text-right px-4 py-3 text-surface-400 font-medium text-xs uppercase tracking-wider">Valor</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {itens.map(item => (
                <tr key={item.id} className="hover:bg-surface-900/50">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.servico}
                      onChange={(e) => updateItem(item.id, 'servico', e.target.value)}
                      className="w-full bg-surface-900 border border-surface-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500"
                      placeholder="Nome do servico"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) => updateItem(item.id, 'descricao', e.target.value)}
                      className="w-full bg-surface-900 border border-surface-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500"
                      placeholder="Descricao breve"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={item.tipo}
                      onChange={(e) => updateItem(item.id, 'tipo', e.target.value)}
                      className="bg-surface-900 border border-surface-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="mensal">Mensal</option>
                      <option value="pontual">Pontual</option>
                      <option value="avulso">Avulso</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={item.valor}
                      onChange={(e) => updateItem(item.id, 'valor', parseFloat(e.target.value) || 0)}
                      className="w-28 bg-surface-900 border border-surface-600 rounded px-2 py-1.5 text-sm text-white text-right font-mono focus:outline-none focus:border-brand-500"
                      step={50}
                    />
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField label="Desconto (%)" value={desconto} onChange={setDesconto} suffix="%" min={0} max={30} step={1} />
            <InputField label="Validade (dias)" value={validade} onChange={setValidade} suffix="dias" min={5} max={90} step={5} />
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Resumo</label>
              <div className="bg-surface-900 rounded-md p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-400">Mensal</span>
                  <span className="text-surface-200 font-mono">{formatCurrency(totalMensal)}</span>
                </div>
                {desconto > 0 && (
                  <div className="flex justify-between">
                    <span className="text-surface-400">Desconto ({desconto}%)</span>
                    <span className="text-red-400 font-mono">-{formatCurrency(descontoValor)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t border-surface-700 pt-1">
                  <span className="text-brand-400">Total Mensal</span>
                  <span className="text-brand-400 font-mono">{formatCurrency(totalComDesconto)}</span>
                </div>
                {totalPontual > 0 && (
                  <div className="flex justify-between">
                    <span className="text-surface-400">Pontuais</span>
                    <span className="text-surface-200 font-mono">{formatCurrency(totalPontual)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-surface-400 mb-1.5">Observacoes</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="w-full bg-surface-900 border border-surface-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </CardBody>
      </Card>

      {/* Botao Gerar */}
      <div className="flex justify-end">
        <button
          onClick={printProposta}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-md font-medium hover:bg-brand-700 transition-colors"
        >
          <Download size={16} /> Gerar PDF / Imprimir
        </button>
      </div>

      {/* Hidden Print Preview */}
      <div className="hidden">
        <div ref={previewRef}>
          <div className="header">
            <div className="logo-area">
              <h1>{escritorio.nome}</h1>
              <p>CNPJ: {escritorio.cnpj} | {escritorio.crc}</p>
              <p>{escritorio.telefone} | {escritorio.email}</p>
            </div>
            <div className="meta">
              <p><strong>PROPOSTA COMERCIAL</strong></p>
              <p>{dataFormatada}</p>
              <p>Validade: {validadeFormatada}</p>
            </div>
          </div>

          <div className="section">
            <div className="section-title">Dados do Cliente</div>
            <div className="info-grid">
              <div className="info-item"><span>Razao Social: </span><strong>{empresa.nome || '_______________'}</strong></div>
              <div className="info-item"><span>CNPJ: </span><strong>{empresa.cnpj || '_______________'}</strong></div>
              <div className="info-item"><span>Contato: </span><strong>{empresa.contato || '_______________'}</strong></div>
              <div className="info-item"><span>E-mail: </span><strong>{empresa.email || '_______________'}</strong></div>
              <div className="info-item"><span>Regime: </span><strong>{empresa.regime === 'simples' ? 'Simples Nacional' : empresa.regime === 'presumido' ? 'Lucro Presumido' : empresa.regime === 'real' ? 'Lucro Real' : 'MEI'}</strong></div>
              <div className="info-item"><span>Funcionarios: </span><strong>{empresa.funcionarios}</strong></div>
            </div>
          </div>

          <div className="section">
            <div className="section-title">Servicos Propostos</div>
            <table>
              <thead>
                <tr>
                  <th>Servico</th>
                  <th>Descricao</th>
                  <th>Periodicidade</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {itens.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.servico}</strong></td>
                    <td>{item.descricao}</td>
                    <td>{item.tipo === 'mensal' ? 'Mensal' : item.tipo === 'pontual' ? 'Pontual' : 'Avulso'}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.valor)}</td>
                  </tr>
                ))}
                {desconto > 0 && (
                  <tr>
                    <td colSpan={3}><em>Desconto especial ({desconto}%)</em></td>
                    <td style={{ textAlign: 'right', color: '#dc2626' }}>-{formatCurrency(descontoValor)}</td>
                  </tr>
                )}
                <tr className="total-row">
                  <td colSpan={3}><strong>TOTAL MENSAL</strong></td>
                  <td style={{ textAlign: 'right' }}><strong>{formatCurrency(totalComDesconto)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {observacoes && (
            <div className="section">
              <div className="section-title">Condicoes e Observacoes</div>
              <div className="obs">{observacoes}</div>
            </div>
          )}

          <div className="signature">
            <div className="sig-line">
              <p><strong>{escritorio.responsavel}</strong></p>
              <p>{escritorio.nome}</p>
            </div>
            <div className="sig-line">
              <p><strong>{empresa.contato || 'Cliente'}</strong></p>
              <p>{empresa.nome || 'Empresa'}</p>
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
