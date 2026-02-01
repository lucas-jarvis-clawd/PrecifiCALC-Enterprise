import { useState, useRef } from 'react';
import { FileText, Download, Plus, Trash2, Building, User, Calendar, Send } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import { formatCurrency, servicosContabeis } from '../data/taxData';

export default function Propostas() {
  const [empresa, setEmpresa] = useState({
    nome: '',
    cnpj: '',
    contato: '',
    email: '',
    regime: 'simples',
    faturamento: 50000,
    funcionarios: 5,
  });

  const [escritorio, setEscritorio] = useState({
    nome: 'Seu Escritório Contábil',
    cnpj: '00.000.000/0001-00',
    responsavel: 'Contador Responsável',
    crc: 'CRC-SP 000000/O',
    telefone: '(11) 99999-9999',
    email: 'contato@escritorio.com.br',
  });

  const [itens, setItens] = useState([
    { id: 1, servico: 'Escrituração Contábil Mensal', descricao: 'Classificação contábil, conciliação e balancetes mensais', valor: 1200, tipo: 'mensal' },
    { id: 2, servico: 'Escrituração Fiscal', descricao: 'Apuração de impostos, SPED Fiscal e EFD-Contribuições', valor: 1500, tipo: 'mensal' },
    { id: 3, servico: 'Folha de Pagamento', descricao: 'Processamento mensal para até 5 funcionários', valor: 800, tipo: 'mensal' },
  ]);

  const [desconto, setDesconto] = useState(0);
  const [validade, setValidade] = useState(15);
  const [observacoes, setObservacoes] = useState(
    'Valores sujeitos a reajuste anual conforme INPC.\nServiços adicionais serão cotados separadamente.\nPagamento até o dia 10 de cada mês.'
  );

  const previewRef = useRef(null);

  const totalMensal = itens.filter(i => i.tipo === 'mensal').reduce((s, i) => s + i.valor, 0);
  const totalPontual = itens.filter(i => i.tipo !== 'mensal').reduce((s, i) => s + i.valor, 0);
  const descontoValor = totalMensal * (desconto / 100);
  const totalComDesconto = totalMensal - descontoValor;

  function addItem() {
    setItens([...itens, {
      id: Date.now(),
      servico: '',
      descricao: '',
      valor: 0,
      tipo: 'mensal',
    }]);
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
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #10b981; }
            .logo-area h1 { font-size: 24px; color: #10b981; margin-bottom: 4px; }
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
            .total-row { background: #f0fdf4; font-weight: 700; }
            .total-row td { color: #059669; border-bottom: 2px solid #10b981; }
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
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FileText className="text-cyan-400" size={28} />
          Gerador de Propostas
        </h1>
        <p className="text-dark-400 mt-1">Monte propostas comerciais profissionais para seus clientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Office Info */}
        <Card>
          <CardHeader>
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Building size={18} className="text-primary-400" /> Dados do Escritório
            </h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <InputField type="text" label="Nome do Escritório" value={escritorio.nome} onChange={(v) => setEscritorio({...escritorio, nome: v})} />
            <div className="grid grid-cols-2 gap-3">
              <InputField type="text" label="CNPJ" value={escritorio.cnpj} onChange={(v) => setEscritorio({...escritorio, cnpj: v})} />
              <InputField type="text" label="CRC" value={escritorio.crc} onChange={(v) => setEscritorio({...escritorio, crc: v})} />
            </div>
            <InputField type="text" label="Responsável" value={escritorio.responsavel} onChange={(v) => setEscritorio({...escritorio, responsavel: v})} />
            <div className="grid grid-cols-2 gap-3">
              <InputField type="text" label="Telefone" value={escritorio.telefone} onChange={(v) => setEscritorio({...escritorio, telefone: v})} />
              <InputField type="text" label="E-mail" value={escritorio.email} onChange={(v) => setEscritorio({...escritorio, email: v})} />
            </div>
          </CardBody>
        </Card>

        {/* Client Info */}
        <Card>
          <CardHeader>
            <h2 className="text-white font-semibold flex items-center gap-2">
              <User size={18} className="text-blue-400" /> Dados do Cliente
            </h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <InputField type="text" label="Razão Social" value={empresa.nome} onChange={(v) => setEmpresa({...empresa, nome: v})} placeholder="Nome da empresa" />
            <div className="grid grid-cols-2 gap-3">
              <InputField type="text" label="CNPJ" value={empresa.cnpj} onChange={(v) => setEmpresa({...empresa, cnpj: v})} placeholder="00.000.000/0001-00" />
              <SelectField label="Regime Tributário" value={empresa.regime} onChange={(v) => setEmpresa({...empresa, regime: v})} options={[
                { value: 'mei', label: 'MEI' },
                { value: 'simples', label: 'Simples Nacional' },
                { value: 'presumido', label: 'Lucro Presumido' },
                { value: 'real', label: 'Lucro Real' },
              ]} />
            </div>
            <InputField type="text" label="Contato" value={empresa.contato} onChange={(v) => setEmpresa({...empresa, contato: v})} placeholder="Nome do contato" />
            <div className="grid grid-cols-2 gap-3">
              <InputField type="text" label="E-mail" value={empresa.email} onChange={(v) => setEmpresa({...empresa, email: v})} placeholder="email@empresa.com" />
              <InputField label="Nº Funcionários" value={empresa.funcionarios} onChange={(v) => setEmpresa({...empresa, funcionarios: v})} min={0} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Services */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Serviços da Proposta</h2>
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-lg text-sm font-medium hover:bg-primary-500/20 transition-colors"
          >
            <Plus size={16} /> Adicionar Serviço
          </button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700/30">
                <th className="text-left px-4 py-3 text-dark-400 font-medium">Serviço</th>
                <th className="text-left px-4 py-3 text-dark-400 font-medium">Descrição</th>
                <th className="text-center px-4 py-3 text-dark-400 font-medium">Tipo</th>
                <th className="text-right px-4 py-3 text-dark-400 font-medium">Valor</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/20">
              {itens.map(item => (
                <tr key={item.id} className="hover:bg-dark-800/30">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.servico}
                      onChange={(e) => updateItem(item.id, 'servico', e.target.value)}
                      className="w-full bg-dark-900/60 border border-dark-600/50 rounded px-2 py-1.5 text-sm text-dark-100"
                      placeholder="Nome do serviço"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.descricao}
                      onChange={(e) => updateItem(item.id, 'descricao', e.target.value)}
                      className="w-full bg-dark-900/60 border border-dark-600/50 rounded px-2 py-1.5 text-sm text-dark-100"
                      placeholder="Descrição breve"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={item.tipo}
                      onChange={(e) => updateItem(item.id, 'tipo', e.target.value)}
                      className="bg-dark-900/60 border border-dark-600/50 rounded px-2 py-1.5 text-sm text-dark-100"
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
                      className="w-28 bg-dark-900/60 border border-dark-600/50 rounded px-2 py-1.5 text-sm text-dark-100 text-right font-mono"
                      step={50}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => removeItem(item.id)} className="p-1 text-dark-500 hover:text-rose-400 rounded">
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
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Resumo</label>
              <div className="bg-dark-900/60 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-400">Mensal</span>
                  <span className="text-dark-200">{formatCurrency(totalMensal)}</span>
                </div>
                {desconto > 0 && (
                  <div className="flex justify-between">
                    <span className="text-dark-400">Desconto ({desconto}%)</span>
                    <span className="text-rose-400">-{formatCurrency(descontoValor)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t border-dark-700/30 pt-1">
                  <span className="text-primary-400">Total Mensal</span>
                  <span className="text-primary-400">{formatCurrency(totalComDesconto)}</span>
                </div>
                {totalPontual > 0 && (
                  <div className="flex justify-between">
                    <span className="text-dark-400">Pontuais</span>
                    <span className="text-dark-200">{formatCurrency(totalPontual)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="w-full bg-dark-900/60 border border-dark-600/50 rounded-lg px-3 py-2 text-sm text-dark-100 focus:outline-none focus:border-primary-500/50"
            />
          </div>
        </CardBody>
      </Card>

      {/* Print Button */}
      <div className="flex justify-end">
        <button
          onClick={printProposta}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/20"
        >
          <Download size={18} /> Gerar PDF / Imprimir
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
              <div className="info-item"><span>Razão Social: </span><strong>{empresa.nome || '_______________'}</strong></div>
              <div className="info-item"><span>CNPJ: </span><strong>{empresa.cnpj || '_______________'}</strong></div>
              <div className="info-item"><span>Contato: </span><strong>{empresa.contato || '_______________'}</strong></div>
              <div className="info-item"><span>E-mail: </span><strong>{empresa.email || '_______________'}</strong></div>
              <div className="info-item"><span>Regime: </span><strong>{empresa.regime === 'simples' ? 'Simples Nacional' : empresa.regime === 'presumido' ? 'Lucro Presumido' : empresa.regime === 'real' ? 'Lucro Real' : 'MEI'}</strong></div>
              <div className="info-item"><span>Funcionários: </span><strong>{empresa.funcionarios}</strong></div>
            </div>
          </div>

          <div className="section">
            <div className="section-title">Serviços Propostos</div>
            <table>
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Descrição</th>
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
              <div className="section-title">Condições e Observações</div>
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
            <p>Proposta gerada por PrecifiCALC | {dataFormatada} | Válida até {validadeFormatada}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
