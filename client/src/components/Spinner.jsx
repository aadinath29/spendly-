import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={`animate-spin ${className}`} />;
}

export function FullPageSpinner() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-slate-400">
      <Spinner size={28} />
    </div>
  );
}
