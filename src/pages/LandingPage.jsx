import { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, CheckCircle, Star, Zap, Shield, Calculator,
  TrendingUp, BarChart3, Users, ChevronDown, Play, Sparkles,
  Clock, DollarSign, Target, Award, MessageSquare, ChevronRight,
  ExternalLink, Heart, Rocket,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Calculator, title: 'Precificação Inteligente',
    desc: 'Descubra o preço ideal dos seus produtos e serviços com cálculos tributários reais',
    color: 'from-brand-500 to-brand-600',
  },
  {
    icon: BarChart3, title: 'Comparativo de Regimes',
    desc: 'Compare MEI, Simples, Presumido e Lucro Real lado a lado — veja onde paga menos imposto',
    color: 'from-violet-500 to-violet-600',
  },
  {
    icon: TrendingUp, title: 'Projeção de Crescimento',
    desc: 'Simule: "Se eu crescer 30%, o que muda nos impostos?" — planeje antes de investir',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: Target, title: 'Ponto de Equilíbrio',
    desc: 'Saiba exatamente quantas vendas precisa por mês para cobrir todos os custos',
    color: 'from-amber-500 to-amber-600',
  },
  {
    icon: DollarSign, title: 'DRE Simplificado',
    desc: 'Quanto entrou, quanto saiu, quanto sobrou — resultado mensal sem complicação',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: Shield, title: 'Calendário Fiscal',
    desc: 'Nunca mais perca um prazo de imposto — alertas automáticos de vencimentos',
    color: 'from-rose-500 to-rose-600',
  },
];

const TESTIMONIALS = [
  {
    name: 'Maria Clara',
    role: 'Dona de confeitaria',
    text: 'Finalmente entendi quanto cobrar pelos meus bolos! Estava cobrando R$ 80 e o preço certo era R$ 135. Estava no prejuízo sem saber.',
    stars: 5,
    avatar: '',
  },
  {
    name: 'Roberto Silva',
    role: 'Consultor de TI',
    text: 'Descobri que minha hora valia quase o dobro do que eu cobrava. Em 3 meses recuperei todo o tempo investido.',
    stars: 5,
    avatar: '',
  },
  {
    name: 'Ana Paula',
    role: 'Loja de roupas',
    text: 'O comparativo de regimes me mostrou que eu poderia economizar R$ 18 mil por ano só mudando de Simples para Presumido!',
    stars: 5,
    avatar: '',
  },
];

const FAQ = [
  {
    q: 'Preciso entender de contabilidade para usar?',
    a: 'Não! O PrecifiCALC foi feito para empresários. Sem jargão técnico. Você responde perguntas simples e a ferramenta calcula tudo automaticamente.',
  },
  {
    q: 'Os cálculos tributários estão atualizados?',
    a: 'Sim! Usamos as tabelas oficiais do Simples Nacional (2025), alíquotas atualizadas de Lucro Presumido e Lucro Real, e valores corretos do MEI.',
  },
  {
    q: 'Funciona para qualquer tipo de negócio?',
    a: 'Sim! Comércio, serviços, indústria, consultoria, alimentação — qualquer negócio que precise calcular preço de venda e entender seus impostos.',
  },
  {
    q: 'Meus dados ficam salvos?',
    a: 'Seus dados ficam armazenados localmente no seu navegador (localStorage). Nada é enviado para servidores externos. Total privacidade.',
  },
  {
    q: 'É gratuito?',
    a: 'Sim! Todas as funcionalidades estão disponíveis gratuitamente. Sem pegadinhas, sem trial, sem limite de uso.',
  },
  {
    q: 'Posso usar no celular?',
    a: 'Sim! O PrecifiCALC é totalmente responsivo e funciona em qualquer dispositivo — celular, tablet ou computador.',
  },
];

function AnimatedNumber({ value, prefix = '', suffix = '', duration = 2000 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(value * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          animate();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{prefix}{display.toLocaleString('pt-BR')}{suffix}</span>;
}

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span className="font-semibold text-slate-800 dark:text-slate-200 pr-4">{item.q}</span>
        <ChevronDown className={`flex-shrink-0 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} size={20} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-5 px-5' : 'max-h-0'}`}>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.a}</p>
      </div>
    </div>
  );
}

export default function LandingPage({ onStart, onDemo }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      {/* === NAV === */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg shadow-sm border-b border-slate-200/50 dark:border-slate-800/50' : ''
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <span className="text-white font-bold text-base">P</span>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">PrecifiCALC</span>
              <span className="text-[10px] text-brand-500 font-semibold block -mt-1 tracking-wider">ENTERPRISE</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onDemo}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 rounded-lg transition-colors"
            >
              <Play size={14} /> Ver Demo
            </button>
            <button
              onClick={onStart}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30"
            >
              Começar Grátis <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* === HERO === */}
      <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/80 via-white to-white dark:from-brand-950/30 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-100/80 dark:bg-brand-900/40 rounded-full text-brand-700 dark:text-brand-300 text-sm font-medium mb-6 animate-fadeIn">
            <Sparkles size={14} />
            <span>100% Gratuito • Sem cadastro obrigatório</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight animate-fadeIn">
            Descubra o <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-cyan-500">preço certo</span> dos seus produtos
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed animate-fadeIn">
            Pare de chutar preços. Calcule com precisão quanto cobrar, 
            quanto paga de imposto e quanto sobra no bolso — em minutos.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-fadeIn">
            <button
              onClick={onStart}
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-lg font-bold rounded-2xl hover:shadow-2xl hover:shadow-brand-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand-500/20"
            >
              <Rocket size={20} />
              Calcular Meu Preço Agora
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onDemo}
              className="group flex items-center gap-2 px-6 py-4 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play size={16} className="text-brand-600 ml-0.5" />
              </div>
              Ver demonstração
            </button>
          </div>

          {/* Social proof mini */}
          <div className="mt-10 flex flex-col items-center gap-2 animate-fadeIn">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={16} className="text-amber-400 fill-amber-400" />)}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Usado por <strong className="text-slate-700 dark:text-slate-300">consultores e empresários</strong> em todo o Brasil
            </p>
          </div>
        </div>
      </section>

      {/* === STATS === */}
      <section className="py-16 border-y border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: 13, suffix: '+', label: 'Módulos de análise', icon: Zap },
              { value: 4, label: 'Regimes tributários', icon: Shield },
              { value: 100, suffix: '%', label: 'Gratuito', icon: Heart },
              { value: 5, label: 'Minutos para precificar', icon: Clock },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <stat.icon size={24} className="text-brand-500 mb-2" />
                <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix || ''} />
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === PROBLEM / SOLUTION === */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Problem */}
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-4">Sem o PrecifiCALC...</h3>
              <ul className="space-y-3">
                {[
                  'Preço baseado em "achismo" ou cópia do concorrente',
                  'Não sabe se está tendo lucro ou prejuízo real',
                  'Paga mais imposto do que deveria',
                  'Não consegue planejar crescimento',
                  'Perde prazos fiscais e paga multas',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                    <span className="text-red-400 mt-0.5">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-4">Com o PrecifiCALC...</h3>
              <ul className="space-y-3">
                {[
                  'Preço calculado com todos os custos e impostos inclusos',
                  'Sabe exatamente quanto sobra de lucro por venda',
                  'Descobre o melhor regime tributário para economizar',
                  'Simula cenários de crescimento antes de investir',
                  'Calendário fiscal com todos os prazos do ano',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                    <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* === FEATURES === */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase tracking-wider">Funcionalidades</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
              Tudo que sua empresa precisa
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-lg mx-auto">
              13 módulos profissionais para você dominar seus números
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-brand-200 dark:hover:border-brand-800 transition-all hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-2">{feat.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase tracking-wider">Como funciona</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
              3 passos simples
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Informe seus dados', desc: 'Nome da empresa, tipo de negócio e regime tributário. Menos de 1 minuto.' },
              { step: 2, title: 'Calcule o preço', desc: 'Informe seus custos e a ferramenta calcula o preço ideal com impostos inclusos.' },
              { step: 3, title: 'Veja quanto sobra', desc: 'Descubra seu lucro real por venda, por mês e por ano. Sem surpresas.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                  {item.step}
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === TESTIMONIALS === */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase tracking-wider">Depoimentos</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
              Quem usa, recomenda
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-0.5 mb-3">
                  {Array(t.stars).fill(0).map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-2xl">{t.avatar}</span>
                  <div>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{t.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FAQ === */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase tracking-wider">Dúvidas Frequentes</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
              Perguntas e Respostas
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ.map((item, i) => <FAQItem key={i} item={item} />)}
          </div>
        </div>
      </section>

      {/* === FINAL CTA === */}
      <section className="py-24 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-cyan-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Pronto para descobrir o preço certo?
          </h2>
          <p className="text-brand-200 text-lg mt-4">
            Comece agora mesmo. É gratuito, não precisa criar conta, e seus dados ficam apenas no seu navegador.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={onStart}
              className="group flex items-center gap-2 px-10 py-4 bg-white text-brand-700 text-lg font-bold rounded-2xl hover:bg-brand-50 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles size={20} />
              Começar Agora — Gratuito
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onDemo}
              className="flex items-center gap-2 px-6 py-4 text-white/80 font-medium hover:text-white transition-colors"
            >
              <Play size={16} /> Ou ver demonstração primeiro
            </button>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-white font-bold">PrecifiCALC</span>
              </div>
              <p className="text-sm">Ferramenta inteligente de precificação para empresários e consultores brasileiros.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Ferramenta</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={onStart} className="hover:text-white transition-colors">Calcular Preço</button></li>
                <li><button onClick={onDemo} className="hover:text-white transition-colors">Ver Demo</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#/termos" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#/privacidade" className="hover:text-white transition-colors">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs">© {new Date().getFullYear()} PrecifiCALC. Todos os direitos reservados.</p>
            <p className="text-xs">Feito com amor no Brasil</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
