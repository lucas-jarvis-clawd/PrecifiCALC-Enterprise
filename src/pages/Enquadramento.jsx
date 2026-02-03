import { useState, useMemo } from 'react';
import { UserCheck, CheckCircle2, XCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { Card, CardBody, CardHeader, StatCard } from '../components/Card';
import InputField, { SelectField } from '../components/InputField';
import { formatCurrency } from '../data/taxData';

const atividadeOptions = [
  { value: 'comercio', label: 'Comércio' },
  { value: 'industria', label: 'Indústria' },
  { value: 'servicos', label: 'Serviços em Geral' },
  { value: 'servicos_intelectuais', label: 'Serviços Intelectuais (TI, Engenharia, etc.)' },
  { value: 'construcao', label: 'Construção Civil' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'saude', label: 'Saúde (Medicina, Odontologia)' },
];

function scoreRegimes({ receitaAnual, atividade, numSocios, numFuncionarios, folhaMensal, margemLucro, permiteMei, permiteSimples }) {
  const regimes = [];

  // ---- MEI ----
  if (permiteMei) {
    let score = 0;
    const pros = [];
    const contras = [];
    const justificativa = [];

    if (receitaAnual <= 81000) {
      score += 40;
      pros.push('Dentro do limite de faturamento (R$ 81.000/ano)');
    } else {
      score -= 100;
      contras.push('Faturamento excede o limite MEI');
    }
    if (numSocios <= 1) {
      score += 15;
      pros.push('Apenas 1 titular, compatível com MEI');
    } else {
      score -= 50;
      contras.push('MEI não permite sócios');
    }
    if (numFuncionarios <= 1) {
      score += 10;
      pros.push('Permite até 1 funcionário');
    } else {
      score -= 50;
      contras.push('MEI permite no máximo 1 funcionário');
    }
    if (['saude', 'servicos_intelectuais'].includes(atividade)) {
      score -= 30;
      contras.push('Atividades intelectuais/saúde geralmente não permitidas no MEI');
    } else {
      score += 10;
      pros.push('Atividade compatível com MEI');
    }

    score += 20; // bonus simplicidade
    pros.push('Menor custo tributário fixo (DAS ~R$ 77-82/mês)');
    pros.push('Dispensa de contabilidade formal');

    justificativa.push('Regime mais simples e barato para micro empreendedores individuais.');

    const finalScore = Math.max(0, Math.min(100, score));
    regimes.push({
      nome: 'MEI',
      score: finalScore,
      pros,
      contras,
      justificativa: justificativa.join(' '),
      cor: 'emerald',
    });
  }

  // ---- Simples Nacional ----
  if (permiteSimples) {
    let score = 0;
    const pros = [];
    const contras = [];

    if (receitaAnual <= 4800000) {
      score += 30;
      pros.push('Dentro do limite do Simples Nacional (R$ 4,8 milhões/ano)');
    } else {
      score -= 100;
      contras.push('Faturamento excede o limite do Simples Nacional');
    }

    if (receitaAnual <= 360000) {
      score += 20;
      pros.push('Faixa inicial com alíquotas mais baixas');
    } else if (receitaAnual <= 1800000) {
      score += 10;
      pros.push('Faixas intermediárias ainda competitivas');
    }

    const fatorR = receitaAnual > 0 ? (folhaMensal * 12) / receitaAnual : 0;
    if (['servicos', 'servicos_intelectuais'].includes(atividade) && fatorR >= 0.28) {
      score += 15;
      pros.push(`Fator R de ${(fatorR * 100).toFixed(1)}% permite tributação pelo Anexo III (alíquotas menores)`);
    } else if (['servicos_intelectuais'].includes(atividade) && fatorR < 0.28) {
      score -= 10;
      contras.push(`Fator R de ${(fatorR * 100).toFixed(1)}% obriga tributação pelo Anexo V (alíquotas maiores)`);
    }

    if (['comercio', 'industria'].includes(atividade)) {
      score += 10;
      pros.push('Comércio e indústria possuem alíquotas mais favoráveis nos Anexos I e II');
    }

    score += 15;
    pros.push('Guia única DAS simplifica o recolhimento');
    pros.push('Dispensa de diversas obrigações acessórias');

    if (numFuncionarios > 20) {
      contras.push('Muitos funcionários podem tornar outros regimes mais vantajosos');
    }

    const finalScore = Math.max(0, Math.min(100, score));
    regimes.push({
      nome: 'Simples Nacional',
      score: finalScore,
      pros,
      contras,
      justificativa: 'Regime unificado com guia única. Indicado para PMEs com faturamento até R$ 4,8 milhões.',
      cor: 'blue',
    });
  }

  // ---- Lucro Presumido ----
  {
    let score = 0;
    const pros = [];
    const contras = [];

    if (receitaAnual <= 78000000) {
      score += 20;
      pros.push('Dentro do limite do Lucro Presumido (R$ 78 milhões/ano)');
    } else {
      score -= 100;
      contras.push('Faturamento excede o limite do Lucro Presumido');
    }

    if (margemLucro > 30) {
      score += 25;
      pros.push(`Margem de lucro alta (${margemLucro}%) favorece a base presumida`);
    } else if (margemLucro > 15) {
      score += 10;
    } else {
      score -= 10;
      contras.push(`Margem de lucro baixa (${margemLucro}%) pode gerar tributação sobre receita não realizada como lucro`);
    }

    if (['servicos', 'servicos_intelectuais', 'saude'].includes(atividade)) {
      if (margemLucro > 32) {
        score += 15;
        pros.push('Presunção de 32% é vantajosa quando a margem real é superior');
      }
    }

    if (['comercio', 'industria'].includes(atividade)) {
      score += 10;
      pros.push('Presunção de 8% para IRPJ é favorável para comércio/indústria');
    }

    pros.push('PIS e COFINS cumulativos (alíquotas menores, sem créditos)');
    pros.push('Menos obrigações acessórias que o Lucro Real');

    contras.push('Não permite aproveitamento de prejuízos fiscais');

    if (receitaAnual > 4800000) {
      score += 10;
      pros.push('Alternativa natural para empresas que excedem o Simples Nacional');
    }

    const finalScore = Math.max(0, Math.min(100, score));
    regimes.push({
      nome: 'Lucro Presumido',
      score: finalScore,
      pros,
      contras,
      justificativa: 'Base de cálculo presumida pela Receita Federal. Indicado para margens de lucro acima da presunção.',
      cor: 'violet',
    });
  }

  // ---- Lucro Real ----
  {
    let score = 0;
    const pros = [];
    const contras = [];

    score += 10; // sempre disponível
    pros.push('Sem limite de faturamento');

    if (margemLucro < 10) {
      score += 30;
      pros.push(`Margem de lucro baixa (${margemLucro}%) favorece tributação sobre o lucro efetivo`);
    } else if (margemLucro < 20) {
      score += 15;
    } else {
      contras.push('Margem alta pode gerar mais tributos que no Lucro Presumido');
    }

    if (receitaAnual > 78000000) {
      score += 40;
      pros.push('Obrigatório para receita bruta acima de R$ 78 milhões');
    }

    if (receitaAnual > 4800000 && margemLucro < 15) {
      score += 15;
      pros.push('Melhor opção para grandes empresas com margens apertadas');
    }

    pros.push('PIS e COFINS não-cumulativos permitem créditos');
    pros.push('Permite compensação de prejuízos fiscais');
    pros.push('Possibilidade de incentivos fiscais (PAT, PDTI, etc.)');

    contras.push('Maior complexidade contábil e obrigações acessórias');
    contras.push('Exige escrituração completa (LALUR, ECD, ECF, EFD)');

    if (numFuncionarios > 50) {
      score += 5;
      pros.push('Empresas maiores frequentemente se beneficiam do Lucro Real');
    }

    const finalScore = Math.max(0, Math.min(100, score));
    regimes.push({
      nome: 'Lucro Real',
      score: finalScore,
      pros,
      contras,
      justificativa: 'Tributação sobre o lucro efetivamente apurado. Obrigatório em alguns casos, vantajoso para margens baixas.',
      cor: 'amber',
    });
  }

  // Sort by score descending
  regimes.sort((a, b) => b.score - a.score);
  return regimes;
}

function ScoreBar({ score, cor }) {
  const colorMap = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
  };
  const bgMap = {
    emerald: 'bg-emerald-100',
    blue: 'bg-blue-100',
    violet: 'bg-violet-100',
    amber: 'bg-amber-100',
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 h-2.5 rounded-full ${bgMap[cor] || 'bg-slate-100'}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorMap[cor] || 'bg-slate-400'}`}
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-slate-700 w-10 text-right">{score}</span>
    </div>
  );
}

export default function Enquadramento() {
  const [receitaAnual, setReceitaAnual] = useState(500000);
  const [atividade, setAtividade] = useState('servicos');
  const [numSocios, setNumSocios] = useState(2);
  const [numFuncionarios, setNumFuncionarios] = useState(5);
  const [folhaMensal, setFolhaMensal] = useState(15000);
  const [margemLucro, setMargemLucro] = useState(25);
  const [permiteMei, setPermiteMei] = useState(false);
  const [permiteSimples, setPermiteSimples] = useState(true);

  const resultados = useMemo(() => scoreRegimes({
    receitaAnual, atividade, numSocios, numFuncionarios, folhaMensal, margemLucro, permiteMei, permiteSimples,
  }), [receitaAnual, atividade, numSocios, numFuncionarios, folhaMensal, margemLucro, permiteMei, permiteSimples]);

  const melhor = resultados[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <UserCheck className="text-brand-600" size={22} />
          Enquadramento Tributário
        </h1>
        <p className="text-slate-500 text-sm mt-1">Recomendação de regime tributário com base no perfil da empresa</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={UserCheck} label="Regime Recomendado" value={melhor?.nome || '-'} subvalue={`Score: ${melhor?.score || 0}/100`} color="brand" />
        <StatCard icon={CheckCircle2} label="Regimes Analisados" value={resultados.length} subvalue="opções comparadas" color="blue" />
        <StatCard icon={AlertTriangle} label="Faturamento Anual" value={formatCurrency(receitaAnual)} color="purple" />
        <StatCard icon={ChevronRight} label="Margem de Lucro" value={`${margemLucro}%`} subvalue="estimada" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <Card>
          <CardHeader>
            <h2 className="text-slate-800 font-medium text-sm">Dados da Empresa</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <InputField label="Receita Bruta Anual" value={receitaAnual} onChange={setReceitaAnual} prefix="R$" />
            <SelectField label="Atividade Principal" value={atividade} onChange={setAtividade} options={atividadeOptions} />
            <InputField label="Número de Sócios" value={numSocios} onChange={setNumSocios} min={1} max={50} />
            <InputField label="Número de Funcionários" value={numFuncionarios} onChange={setNumFuncionarios} min={0} max={500} />
            <InputField label="Folha de Pagamento Mensal" value={folhaMensal} onChange={setFolhaMensal} prefix="R$" />
            <InputField label="Margem de Lucro Estimada" value={margemLucro} onChange={setMargemLucro} suffix="%" min={0} max={100} />

            <div className="pt-3 space-y-2">
              <p className="text-xs text-slate-400 font-medium">Elegibilidade</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permiteMei}
                  onChange={(e) => setPermiteMei(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500/20"
                />
                <span className="text-sm text-slate-700">Atividade permite MEI</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permiteSimples}
                  onChange={(e) => setPermiteSimples(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500/20"
                />
                <span className="text-sm text-slate-700">Atividade permite Simples Nacional</span>
              </label>
            </div>
          </CardBody>
        </Card>

        {/* Recommendations */}
        <div className="lg:col-span-2 space-y-4">
          {resultados.map((regime, idx) => {
            const isBest = idx === 0;
            const borderColor = {
              emerald: 'border-emerald-300',
              blue: 'border-blue-300',
              violet: 'border-violet-300',
              amber: 'border-amber-300',
            };
            return (
              <Card key={regime.nome} className={isBest ? `ring-2 ring-brand-200 ${borderColor[regime.cor] || ''}` : ''}>
                <CardBody>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        {isBest && (
                          <span className="bg-brand-100 text-brand-700 text-xs font-medium px-2 py-0.5 rounded">
                            Recomendado
                          </span>
                        )}
                        <h3 className="text-slate-800 font-semibold">{regime.nome}</h3>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">{regime.justificativa}</p>
                    </div>
                    <span className={`text-2xl font-bold ${regime.score >= 50 ? 'text-emerald-600' : regime.score >= 25 ? 'text-amber-600' : 'text-red-500'}`}>
                      {regime.score}
                    </span>
                  </div>

                  <ScoreBar score={regime.score} cor={regime.cor} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Pros */}
                    <div>
                      <p className="text-xs text-emerald-600 font-medium mb-2 uppercase tracking-wider">Vantagens</p>
                      <ul className="space-y-1">
                        {regime.pros.map((p, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                            <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Cons */}
                    <div>
                      <p className="text-xs text-red-500 font-medium mb-2 uppercase tracking-wider">Desvantagens</p>
                      <ul className="space-y-1">
                        {regime.contras.length > 0 ? regime.contras.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                            <XCircle size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
                            <span>{c}</span>
                          </li>
                        )) : (
                          <li className="text-xs text-slate-400 italic">Nenhuma desvantagem identificada</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
