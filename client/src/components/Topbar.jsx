import { Menu, Wallet } from 'lucide-react';

export default function Topbar({ onMenu }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/10 bg-slate-950/50 px-4 backdrop-blur-xl lg:hidden">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-2">
        <div className="bg-brand-gradient grid h-7 w-7 place-items-center rounded-lg">
          <Wallet size={15} className="text-white" />
        </div>
        <span className="font-semibold text-white">Spendly</span>
      </div>
    </header>
  );
}
