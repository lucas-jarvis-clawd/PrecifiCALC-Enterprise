import { useState } from 'react';
import { CalendarDays, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import { SelectField } from '../components/InputField';

const obrigacoes = {
  mei: [
    { nome: 'DAS-MEI', vencimento: 'Dia 20 de cada mês', periodicidade: 'Mensal', observacao: 'Guia única com INSS + ISS/ICMS. Gerada no PGMEI.' },
    { nome: 'DASN-SIMEI', vencimento: '31 de maio', periodicidade: 'Anual', observacao: 'Declaração Anual do Simples Nacional para o MEI.' },
  ],
  simples: [
    { nome: 'DAS (PGDAS-D)', vencimento: 'Dia 20 de cada mês', periodicidade: 'Mensal', observacao: 'Documento de Arrecadação do Simples Nacional.' },
    { nome: 'DEFIS', vencimento: '31 de março', periodicidade: 'Anual', observacao: 'Declaração de Informações Socioeconômicas e Fiscais.' },
    { nome: 'DIRF', vencimento: 'Último dia útil de fevereiro', periodicidade: 'Anual', observacao: 'Declaração do Imposto de Renda Retido na Fonte.' },
    { nome: 'DESTDA', vencimento: 'Dia 28 de cada mês', periodicidade: 'Mensal', observacao: 'Declaração de Substituição Tributária, Diferencial de Alíquota e Antecipação.' },
    { nome: 'Relatório Mensal de Receita', vencimento: 'Dia 20 de cada mês', periodicidade: 'Mensal', observacao: 'Relatório das receitas brutas mensais.' },
  ],
  presumido: [
    { nome: 'PIS', vencimento: 'Dia 25 de cada mês', periodicidade: 'Mensal', observacao: 'Programa de Integração Social (cumulativo 0,65%).' },
    { nome: 'COFINS', vencimento: 'Dia 25 de cada mês', periodicidade: 'Mensal', observacao: 'Contribuição para o Financiamento da Seguridade Social (cumulativo 3%).' },
    { nome: 'IRPJ', vencimento: 'Último dia útil do mês seguinte ao trimestre', periodicidade: 'Trimestral', observacao: 'Imposto de Renda Pessoa Jurídica sobre a base presumida.' },
    { nome: 'CSLL', vencimento: 'Último dia útil do mês seguinte ao trimestre', periodicidade: 'Trimestral', observacao: 'Contribuição Social sobre o Lucro Líquido.' },
    { nome: 'ISS', vencimento: 'Varia por município (geralmente dia 10 ou 15)', periodicidade: 'Mensal', observacao: 'Imposto Sobre Serviços - verificar legislação municipal.' },
    { nome: 'DCTF', vencimento: 'Dia 15 do 2º mês seguinte', periodicidade: 'Mensal', observacao: 'Declaração de Débitos e Créditos Tributários Federais.' },
    { nome: 'ECD (SPED Contábil)', vencimento: 'Último dia útil de maio', periodicidade: 'Anual', observacao: 'Escrituração Contábil Digital.' },
    { nome: 'ECF', vencimento: 'Último dia útil de julho', periodicidade: 'Anual', observacao: 'Escrituração Contábil Fiscal.' },
    { nome: 'DIRF', vencimento: 'Último dia útil de fevereiro', periodicidade: 'Anual', observacao: 'Declaração do Imposto de Renda Retido na Fonte.' },
  ],
  real: [
    { nome: 'PIS (não-cumulativo)', vencimento: 'Dia 25 de cada mês', periodicidade: 'Mensal', observacao: 'PIS não-cumulativo (1,65%) com direito a créditos.' },
    { nome: 'COFINS (não-cumulativo)', vencimento: 'Dia 25 de cada mês', periodicidade: 'Mensal', observacao: 'COFINS não-cumulativo (7,6%) com direito a créditos.' },
    { nome: 'IRPJ', vencimento: 'Último dia útil do mês seguinte ao trimestre', periodicidade: 'Trimestral', observacao: 'IRPJ sobre lucro real apurado. Pode ser mensal por estimativa.' },
    { nome: 'CSLL', vencimento: 'Último dia útil do mês seguinte ao trimestre', periodicidade: 'Trimestral', observacao: 'CSLL sobre lucro real apurado.' },
    { nome: 'ISS', vencimento: 'Varia por município (geralmente dia 10 ou 15)', periodicidade: 'Mensal', observacao: 'Imposto Sobre Serviços - verificar legislação municipal.' },
    { nome: 'DCTF', vencimento: 'Dia 15 do 2º mês seguinte', periodicidade: 'Mensal', observacao: 'Declaração de Débitos e Créditos Tributários Federais.' },
    { nome: 'EFD-Contribuições', vencimento: 'Dia 10 do 2º mês seguinte', periodicidade: 'Mensal', observacao: 'Escrituração Fiscal Digital das Contribuições (PIS/COFINS).' },
    { nome: 'ECD (SPED Contábil)', vencimento: 'Último dia útil de maio', periodicidade: 'Anual', observacao: 'Escrituração Contábil Digital.' },
    { nome: 'ECF', vencimento: 'Último dia útil de julho', periodicidade: 'Anual', observacao: 'Escrituração Contábil Fiscal.' },
    { nome: 'DIRF', vencimento: 'Último dia útil de fevereiro', periodicidade: 'Anual', observacao: 'Declaração do Imposto de Renda Retido na Fonte.' },
    { nome: 'LALUR/LACS', vencimento: 'Trimestral ou anual', periodicidade: 'Trimestral', observacao: 'Livro de Apuração do Lucro Real e Livro de Apuração da CSLL.' },
  ],
};

const obrigacoesTrabalhistas = [
  { nome: 'FGTS (GRF)', vencimento: 'Dia 7 de cada mês', periodicidade: 'Mensal', observacao: 'Fundo de Garantia do Tempo de Serviço - 8% sobre remuneração.' },
  { nome: 'INSS (GPS/DARF)', vencimento: 'Dia 20 de cada mês', periodicidade: 'Mensal', observacao: 'Contribuição previdenciária patronal e dos empregados.' },
  { nome: 'IRRF sobre Salários', vencimento: 'Dia 20 de cada mês', periodicidade: 'Mensal', observacao: 'Imposto de Renda Retido na Fonte sobre salários.' },
  { nome: 'eSocial - Eventos Periódicos', vencimento: 'Dia 15 de cada mês', periodicidade: 'Mensal', observacao: 'Transmissão mensal dos eventos de folha no eSocial.' },
  { nome: 'DCTFWeb', vencimento: 'Dia 15 de cada mês', periodicidade: 'Mensal', observacao: 'Declaração de Débitos e Créditos Tributários Federais Previdenciários.' },
  { nome: 'CAGED (via eSocial)', vencimento: 'Até o dia 15 do mês seguinte', periodicidade: 'Mensal', observacao: 'Cadastro Geral de Empregados e Desempregados.' },
  { nome: 'RAIS (via eSocial)', vencimento: 'Março', periodicidade: 'Anual', observacao: 'Relação Anual de Informações Sociais.' },
  { nome: 'DIRF (retenções)', vencimento: 'Último dia útil de fevereiro', periodicidade: 'Anual', observacao: 'Declaração de IR retido na fonte sobre pagamentos a terceiros.' },
];

const regimeLabels = {
  mei: 'MEI',
  simples: 'Simples Nacional',
  presumido: 'Lucro Presumido',
  real: 'Lucro Real',
};

function BadgePeriodo({ periodicidade }) {
  const styles = {
    Mensal: 'bg-blue-50 text-blue-700',
    Trimestral: 'bg-violet-50 text-violet-700',
    Anual: 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[periodicidade] || 'bg-slate-100 text-slate-600'}`}>
      {periodicidade}
    </span>
  );
}

function ObrigacoesTable({ items, title }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-slate-800 font-medium text-sm">{title}</h2>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3 text-slate-500 text-xs font-medium uppercase tracking-wider">Obrigação</th>
              <th className="text-left px-5 py-3 text-slate-500 text-xs font-medium uppercase tracking-wider">Vencimento</th>
              <th className="text-left px-5 py-3 text-slate-500 text-xs font-medium uppercase tracking-wider">Periodicidade</th>
              <th className="text-left px-5 py-3 text-slate-500 text-xs font-medium uppercase tracking-wider">Observação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-5 py-3 text-slate-800 font-medium">{item.nome}</td>
                <td className="px-5 py-3 text-slate-700">{item.vencimento}</td>
                <td className="px-5 py-3"><BadgePeriodo periodicidade={item.periodicidade} /></td>
                <td className="px-5 py-3 text-slate-500 text-xs max-w-xs">{item.observacao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function CalendarioFiscal() {
  const [regime, setRegime] = useState('simples');

  const currentItems = obrigacoes[regime] || [];
  const totalMensal = currentItems.filter(o => o.periodicidade === 'Mensal').length;
  const totalTrimestral = currentItems.filter(o => o.periodicidade === 'Trimestral').length;
  const totalAnual = currentItems.filter(o => o.periodicidade === 'Anual').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <CalendarDays className="text-brand-600" size={22} />
          Calendário Fiscal
        </h1>
        <p className="text-slate-500 text-sm mt-1">Obrigações tributárias e prazos de vencimento por regime</p>
      </div>

      <div className="flex items-center gap-4">
        <SelectField
          label="Regime Tributário"
          value={regime}
          onChange={setRegime}
          options={[
            { value: 'mei', label: 'MEI' },
            { value: 'simples', label: 'Simples Nacional' },
            { value: 'presumido', label: 'Lucro Presumido' },
            { value: 'real', label: 'Lucro Real' },
          ]}
          className="w-64"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={CalendarDays} label="Total de Obrigações" value={currentItems.length + obrigacoesTrabalhistas.length} subvalue={regimeLabels[regime]} color="brand" />
        <StatCard icon={Clock} label="Mensais" value={totalMensal} subvalue="obrigações recorrentes" color="blue" />
        <StatCard icon={AlertTriangle} label="Trimestrais" value={totalTrimestral} subvalue="apuração trimestral" color="purple" />
        <StatCard icon={CheckCircle2} label="Anuais" value={totalAnual} subvalue="declarações anuais" color="amber" />
      </div>

      <ObrigacoesTable
        title={`Obrigações Fiscais - ${regimeLabels[regime]}`}
        items={currentItems}
      />

      <ObrigacoesTable
        title="Obrigações Trabalhistas (todos os regimes com funcionários)"
        items={obrigacoesTrabalhistas}
      />

      <Card>
        <CardBody>
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-slate-700 font-medium">Atenção</p>
              <p className="text-xs text-slate-500 mt-1">
                Os prazos apresentados são referências gerais. Quando o vencimento cai em dia não útil, o prazo é antecipado para o dia útil anterior.
                Verifique sempre a legislação municipal para prazos do ISS e outras obrigações locais. Datas podem sofrer alterações por legislação complementar.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
