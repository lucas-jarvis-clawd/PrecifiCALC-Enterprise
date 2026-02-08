import { FileText } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../components/Card';

const CSOSN_CODES = [
  { codigo: '102', descricao: 'Tributação normal sem permissão de crédito' },
  { codigo: '300', descricao: 'Imune de ICMS' },
  { codigo: '500', descricao: 'ICMS cobrado anteriormente por ST' },
];

const CST_CODES = [
  { codigo: '00', descricao: 'Tributação integral' },
  { codigo: '10', descricao: 'Tributação com cobrança de ICMS por ST' },
  { codigo: '40', descricao: 'Isenta de ICMS' },
  { codigo: '60', descricao: 'ICMS cobrado anteriormente por ST' },
];

function getCodigosParaRegime(regime, tipoAtividade) {
  if (regime === 'mei' || regime === 'simples') {
    if (tipoAtividade === 'servicos') {
      return {
        tipo: 'CSOSN',
        codigos: [CSOSN_CODES[0]],
        nota: 'Prestação de serviços: usar CSOSN 102. ISS é o tributo principal.',
      };
    }
    return {
      tipo: 'CSOSN',
      codigos: CSOSN_CODES,
      nota: 'Simples Nacional usa CSOSN (Código de Situação da Operação no Simples Nacional).',
    };
  }

  // Lucro Presumido / Lucro Real
  if (tipoAtividade === 'servicos') {
    return {
      tipo: 'CST',
      codigos: [CST_CODES[0], CST_CODES[2]],
      nota: 'Serviços: ISS é o tributo principal. CST de ICMS geralmente 40 (isenta).',
    };
  }
  return {
    tipo: 'CST',
    codigos: CST_CODES,
    nota: 'Lucro Presumido/Real usa CST (Código de Situação Tributária).',
  };
}

const REGIME_LABELS = {
  mei: 'MEI',
  simples: 'Simples Nacional',
  presumido: 'Lucro Presumido',
  real: 'Lucro Real',
};

const ATIVIDADE_LABELS = {
  comercio: 'Comércio',
  servicos: 'Serviços',
  industria: 'Indústria',
};

export default function OrientacaoNF({ regime, tipoAtividade }) {
  const orientacao = getCodigosParaRegime(regime, tipoAtividade);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-brand-600 dark:text-brand-400" />
          <h2 className="text-slate-800 dark:text-slate-200 font-medium text-sm">
            Orientação para Nota Fiscal ({REGIME_LABELS[regime]} - {ATIVIDADE_LABELS[tipoAtividade] || tipoAtividade})
          </h2>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Códigos de situação tributária sugeridos ({orientacao.tipo})
        </p>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400">Tributo</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400">Código</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400">Descrição</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {orientacao.codigos.map((cod) => (
                <tr key={cod.codigo} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{orientacao.tipo}</td>
                  <td className="px-3 py-2 font-mono font-medium text-brand-600 dark:text-brand-400">{cod.codigo}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{cod.descricao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
          {orientacao.nota}
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
          Consulte seu contador para confirmar o código correto para cada operação.
        </p>
      </CardBody>
    </Card>
  );
}
