import { ArrowLeft } from 'lucide-react';

export default function TermosDeUso({ onBack }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:underline mb-8 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Termos de Uso</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-6">
          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">1. Aceitação dos Termos</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Ao acessar e utilizar o Vértice ("Ferramenta"), você concorda com estes Termos de Uso. 
              Se não concordar, não utilize a Ferramenta.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">2. Descrição do Serviço</h2>
            <p className="text-slate-600 dark:text-slate-400">
              O Vértice é uma ferramenta de apoio à decisão para precificação de produtos e serviços. 
              Fornece cálculos baseados em dados tributários oficiais brasileiros, incluindo tabelas do 
              Simples Nacional, Lucro Presumido, Lucro Real e MEI.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">3. Limitações e Isenção de Responsabilidade</h2>
            <p className="text-slate-600 dark:text-slate-400">
              <strong>IMPORTANTE:</strong> O Vértice é uma ferramenta de apoio e simulação. Os cálculos 
              apresentados são estimativas baseadas nas informações fornecidas pelo usuário e nas tabelas 
              tributárias vigentes.
            </p>
            <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400 space-y-2 mt-3">
              <li>Esta ferramenta <strong>NÃO substitui</strong> a consultoria de um contador habilitado.</li>
              <li>Os resultados são <strong>estimativas</strong> e podem variar conforme particularidades do negócio.</li>
              <li>Legislação tributária pode mudar — sempre consulte um profissional contábil.</li>
              <li>Não nos responsabilizamos por decisões tomadas exclusivamente com base nos cálculos da ferramenta.</li>
              <li>Os dados do Simples Nacional são baseados na Lei Complementar 123/2006 e alterações posteriores.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">4. Uso Permitido</h2>
            <p className="text-slate-600 dark:text-slate-400">Você pode:</p>
            <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400 space-y-1 mt-2">
              <li>Usar a ferramenta para fins pessoais e comerciais</li>
              <li>Gerar relatórios e propostas para seus clientes</li>
              <li>Utilizar os cálculos como base para decisões empresariais (sempre com apoio profissional)</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400 mt-3">Você <strong>NÃO</strong> pode:</p>
            <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400 space-y-1 mt-2">
              <li>Copiar, modificar ou redistribuir o código-fonte sem autorização</li>
              <li>Usar a ferramenta para fins ilícitos ou fraudulentos</li>
              <li>Tentar obter acesso não autorizado a sistemas relacionados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">5. Dados e Privacidade</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Todos os dados informados pelo usuário são armazenados localmente no navegador (localStorage). 
              Não coletamos, armazenamos ou transmitimos dados pessoais para servidores externos. 
              Consulte nossa Política de Privacidade para mais detalhes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">6. Propriedade Intelectual</h2>
            <p className="text-slate-600 dark:text-slate-400">
              O Vértice, incluindo sua interface, código, design e conteúdo, é protegido por leis de 
              propriedade intelectual. Todos os direitos são reservados aos seus criadores.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">7. Alterações nos Termos</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Reservamo-nos o direito de alterar estes Termos a qualquer momento. As alterações entram em 
              vigor imediatamente após a publicação. O uso continuado da ferramenta após alterações 
              constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">8. Legislação Aplicável</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Quaisquer disputas 
              serão submetidas ao foro da comarca de domicílio do usuário.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">9. Contato</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Para dúvidas sobre estes Termos, entre em contato através do formulário de feedback 
              disponível na ferramenta.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
