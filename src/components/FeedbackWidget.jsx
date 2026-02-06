import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Star, CheckCircle, Heart, ThumbsUp, ThumbsDown, Bug, Lightbulb } from 'lucide-react';

const FEEDBACK_TYPES = [
  { id: 'bug', label: 'Encontrei um erro', icon: Bug, color: 'text-red-500' },
  { id: 'ideia', label: 'Tenho uma sugestão', icon: Lightbulb, color: 'text-amber-500' },
  { id: 'elogio', label: 'Quero elogiar', icon: Heart, color: 'text-pink-500' },
  { id: 'duvida', label: 'Tenho uma dúvida', icon: MessageSquare, color: 'text-blue-500' },
];

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('type'); // type, form, rating, done
  const [feedbackType, setFeedbackType] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [email, setEmail] = useState('');
  const [pagina, setPagina] = useState('');
  const panelRef = useRef(null);

  // Get current page
  useEffect(() => {
    setPagina(window.location.pathname || '/');
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('.feedback-trigger')) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    // Save feedback to localStorage
    try {
      const feedbacks = JSON.parse(localStorage.getItem('precificalc_feedbacks') || '[]');
      feedbacks.push({
        id: Date.now(),
        type: feedbackType,
        message,
        rating,
        email,
        pagina,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
      localStorage.setItem('precificalc_feedbacks', JSON.stringify(feedbacks));
    } catch { /* ignore */ }

    setStep('done');
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep('type');
      setFeedbackType('');
      setMessage('');
      setRating(0);
      setEmail('');
    }, 300);
  };

  const handleTypeSelect = (type) => {
    setFeedbackType(type);
    setStep('form');
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="feedback-trigger fixed bottom-5 right-5 z-[90] w-12 h-12 rounded-full bg-brand-600 text-white shadow-xl hover:bg-brand-700 hover:shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
        title="Enviar feedback"
        aria-label="Abrir formulário de feedback"
      >
        {isOpen ? (
          <X size={20} className="transition-transform" />
        ) : (
          <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
        )}
      </button>

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed bottom-20 right-5 z-[90] w-[340px] max-h-[480px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-4 text-white">
          <h3 className="font-bold text-sm">
            {step === 'type' && '💬 Como podemos melhorar?'}
            {step === 'form' && `${FEEDBACK_TYPES.find(t => t.id === feedbackType)?.label || 'Feedback'}`}
            {step === 'rating' && '⭐ Avalie sua experiência'}
            {step === 'done' && '✅ Obrigado!'}
          </h3>
          <p className="text-brand-200 text-xs mt-0.5">
            {step === 'type' && 'Seu feedback nos ajuda a melhorar'}
            {step === 'form' && 'Descreva com detalhes'}
            {step === 'rating' && 'De 1 a 5, como foi usar o PrecifiCALC?'}
            {step === 'done' && 'Seu feedback foi registrado'}
          </p>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Step: Type */}
          {step === 'type' && (
            <div className="space-y-2">
              {FEEDBACK_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-all text-left group"
                  >
                    <Icon size={18} className={type.color} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-brand-700 dark:group-hover:text-brand-400">
                      {type.label}
                    </span>
                  </button>
                );
              })}
              
              {/* Quick rating */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Ou avalie rapidamente:</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setRating(5); setFeedbackType('elogio'); setMessage('Gostei muito!'); setStep('rating'); }}
                    className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                  >
                    <ThumbsUp size={16} /> <span className="text-xs font-medium">Gostei</span>
                  </button>
                  <button
                    onClick={() => { setRating(2); setFeedbackType('ideia'); setStep('form'); }}
                    className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                  >
                    <ThumbsDown size={16} /> <span className="text-xs font-medium">Melhorar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step: Form */}
          {step === 'form' && (
            <div className="space-y-3">
              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    feedbackType === 'bug' ? 'Descreva o erro que encontrou...' :
                    feedbackType === 'ideia' ? 'Qual sua sugestão de melhoria?' :
                    feedbackType === 'elogio' ? 'O que você mais gostou?' :
                    'Qual sua dúvida?'
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm resize-none h-24 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-700 dark:text-slate-200"
                  autoFocus
                />
              </div>

              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu email (opcional, para resposta)"
                  className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-700 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep('type')}
                  className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  ← Voltar
                </button>
                <button
                  onClick={() => setStep('rating')}
                  disabled={!message.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Próximo <Send size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Step: Rating */}
          {step === 'rating' && (
            <div className="space-y-5 text-center">
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125"
                  >
                    <Star
                      size={32}
                      className={`transition-colors ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {rating === 0 && 'Toque nas estrelas para avaliar'}
                {rating === 1 && '😞 Poxa... vamos melhorar!'}
                {rating === 2 && '😕 Entendido, temos trabalho a fazer'}
                {rating === 3 && '🤔 Razoável, mas pode melhorar'}
                {rating === 4 && '😊 Muito bom! Obrigado!'}
                {rating === 5 && '🤩 Incrível! Isso nos motiva!'}
              </p>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep(message ? 'form' : 'type')}
                  className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={rating === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  <Send size={14} /> Enviar Feedback
                </button>
              </div>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Feedback registrado!</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Obrigado por ajudar a melhorar o PrecifiCALC. 
                {email && ' Responderemos pelo email informado.'}
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-brand-600 text-white text-sm font-medium rounded-xl hover:bg-brand-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
