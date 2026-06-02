import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, trend, trendLabel, loading }) {
  const hasTrend = typeof trend === 'number';
  const up = hasTrend && trend > 0;
  const down = hasTrend && trend < 0;
  const TrendIcon = up ? ArrowUpRight : down ? ArrowDownRight : Minus;
  // For spending, more is "worse" — so an increase is shown in rose, a decrease in emerald.
  const trendColor = up ? 'text-rose-300 bg-rose-500/10' : down ? 'text-emerald-300 bg-emerald-500/10' : 'text-slate-400 bg-white/5';

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        {Icon && (
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-slate-300">
            <Icon size={17} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-4 h-8 w-32 skeleton" />
      ) : (
        <div className="mt-3 text-2xl font-bold tracking-tight text-white">{value}</div>
      )}

      {hasTrend && !loading && (
        <div className="mt-3 flex items-center gap-2">
          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${trendColor}`}>
            <TrendIcon size={13} />
            {Math.abs(trend)}%
          </span>
          {trendLabel && <span className="text-xs text-slate-500">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}
