import { ArrowLeft, Shield } from 'lucide-react';

export default function PoliticaPrivacidade({ onBack }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:underline mb-8 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="flex items-center gap-3 mb-2">
          <Shield className="text-brand-600" size={28} />
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Política de Privacidade</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

        <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-6">
          {/* Highlights */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
            <h3 className="text-emerald-700 dark:text-emerald-400 font-bold mb-3">Resumo (TL;DR)</h3>
            <ul className="space-y-2 text-emerald-700 dark:text-emerald-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">-</span>
                <span>Seus dados ficam <strong>apenas no seu navegador</strong> (localStorage)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">-</span>
                <span><strong>Nenhum dado pessoal</strong> é enviado para servidores externos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">-</span>
                <span>Não usamos cookies de rastreamento de terceiros</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">-</span>
                <span>Você pode apagar todos os dados a qualquer momento</span>
              </li>
            </ul>
          </div>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">1. Introdução</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Esta Política de Privacidade descreve como o PrecifiCALC ("nós", "nosso") lida com 
              as informações quando você utiliza nossa ferramenta de precificação. Respeitamos sua 
              privacidade e estamos comprometidos com a proteção dos seus dados pessoais, em 
              conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">2. Dados que Você Fornece</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Ao utilizar o PrecifiCALC, você pode fornecer informações como:
            </p>
            <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400 space-y-1 mt-2">
              <li>Nome da empresa</li>
              <li>CNPJ (opcional)</li>
              <li>Regime tributário</li>
              <li>Receita Bruta (Faturamento) e custos estimados</li>
              <li>Atividade econômica</li>
              <li>Dados de produtos e serviços para precificação</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">3. Como Seus Dados São Armazenados</h2>
            <p className="text-slate-600 dark:text-slate-400">
              <strong>Todos os dados são armazenados localmente no seu navegador</strong> utilizando a 
              tecnologia localStorage. Isso significa que:
            </p>
            <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400 space-y-2 mt-3">
              <li>Os dados ficam <strong>apenas no seu dispositivo</strong></li>
              <li>Nenhuma informação é transmitida para servidores externos</li>
              <li>Não temos acesso aos dados que você insere na ferramenta</li>
              <li>Ao limpar os dados do navegador, todas as informações são apagadas</li>
              <li>Cada navegador/dispositivo mantém seus próprios dados separados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">4. Dados que NÃO Coletamos</h2>
            <p className="text-slate-600 dark:text-slate-400">Nós <strong>NÃO</strong> coletamos:</p>
            <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400 space-y-1 mt-2">
              <li>Informações de identificação pessoal em nossos servidores</li>
              <li>Dados de pagamento ou cartão de crédito</li>
              <li>Dados de localização precisa</li>
              <li>Histórico de navegação fora da ferramenta</li>
              <li>Dados de outros aplicativos do seu dispositivo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">5. Cookies e Tecnologias de Rastreamento</h2>
            <p className="text-slate-600 dark:text-slate-400">
              O PrecifiCALC utiliza apenas localStorage para salvar suas preferências e dados de cálculo. 
              Não utilizamos cookies de rastreamento, pixels de tracking ou ferramentas de análise de 
              terceiros que coletem dados pessoais.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">6. Seus Direitos (LGPD)</h2>
            <p className="text-slate-600 dark:text-slate-400">
              De acordo com a LGPD, você tem direito a:
            </p>
            <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400 space-y-1 mt-2">
              <li><strong>Acesso:</strong> Todos os seus dados estão visíveis nas Configurações da ferramenta</li>
              <li><strong>Correção:</strong> Você pode alterar qualquer dado a qualquer momento</li>
              <li><strong>Eliminação:</strong> Use a opção "Limpar todos os dados" nas Configurações, ou limpe o localStorage do navegador</li>
              <li><strong>Portabilidade:</strong> A função de exportar relatórios permite levar seus dados</li>
              <li><strong>Informação:</strong> Esta política explica claramente o tratamento de dados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">7. Segurança</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Como os dados ficam apenas no seu dispositivo, a segurança depende principalmente da 
              proteção do seu navegador e dispositivo. Recomendamos:
            </p>
            <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400 space-y-1 mt-2">
              <li>Manter seu navegador atualizado</li>
              <li>Usar senhas fortes no seu dispositivo</li>
              <li>Não compartilhar o navegador com terceiros se inserir dados sensíveis</li>
              <li>Usar a navegação privada se estiver em computador compartilhado</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">8. Menores de Idade</h2>
            <p className="text-slate-600 dark:text-slate-400">
              O PrecifiCALC é destinado a empresários e profissionais. Não direcionamos nossos serviços 
              a menores de 18 anos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">9. Alterações nesta Política</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Podemos atualizar esta Política periodicamente. Recomendamos revisá-la regularmente. 
              Alterações significativas serão destacadas na ferramenta.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">10. Contato</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Para dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos seus dados, 
              utilize o formulário de feedback disponível na ferramenta.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
