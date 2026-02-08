import { AlertTriangle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 mb-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
      <p className="text-sm text-amber-800 dark:text-amber-400">
        Os calculos apresentados sao <strong>estimativas para fins de planejamento</strong>.
        Nao substitui consultoria contabil profissional. Consulte um contador habilitado (CRC ativo)
        antes de tomar decisoes tributarias. Base legal atualizada ate fev/2026.
      </p>
    </div>
  );
}
