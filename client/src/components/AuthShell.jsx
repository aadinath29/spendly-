import { Wallet, TrendingUp, PieChart, ShieldCheck } from 'lucide-react';

const FEATURES = [
  { icon: TrendingUp, title: 'Track every rupee', desc: 'Log expenses in seconds and watch your spending trends.' },
  { icon: PieChart, title: 'Beautiful insights', desc: 'Category breakdowns and charts that actually make sense.' },
  { icon: ShieldCheck, title: 'Private & secure', desc: 'Your data is tied to your account — yours alone.' },
];

export default function AuthShell({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Hero (desktop only) */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="bg-brand-gradient absolute inset-0" />
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage:
              'radial-gradient(600px circle at 20% 20%, rgba(255,255,255,0.35), transparent 40%), radial-gradient(500px circle at 80% 80%, rgba(0,0,0,0.4), transparent 45%)',
          }}
        />
        <div className="relative flex items-center gap-3 text-white">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20 backdrop-blur">
            <Wallet size={22} />
          </div>
          <span className="text-2xl font-extrabold">Spendly</span>
        </div>

        <div className="relative">
          <h1 className="max-w-md text-4xl font-extrabold leading-tight text-white">
            Take control of your money, beautifully.
          </h1>
          <p className="mt-3 max-w-sm text-white/80">
            A modern expense tracker that turns your spending into clear, actionable insight.
          </p>

          <div className="mt-10 space-y-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-3.5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 text-white backdrop-blur">
                  <f.icon size={18} />
                </div>
                <div>
                  <div className="font-semibold text-white">{f.title}</div>
                  <div className="text-sm text-white/75">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-sm text-white/60">© {new Date().getFullYear()} Spendly</div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="bg-brand-gradient grid h-10 w-10 place-items-center rounded-xl">
              <Wallet size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">Spendly</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
