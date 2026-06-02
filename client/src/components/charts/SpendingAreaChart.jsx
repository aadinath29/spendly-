import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatCurrency, formatDate } from '../../lib/format.js';

function ChartTooltip({ active, payload, label, range }) {
  if (!active || !payload?.length) return null;
  const pattern = range === '12m' ? 'MMMM yyyy' : 'MMM d, yyyy';
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2 text-sm shadow-xl backdrop-blur">
      <div className="text-slate-400">{formatDate(label, pattern)}</div>
      <div className="font-semibold text-white">{formatCurrency(payload[0].value)}</div>
    </div>
  );
}

export default function SpendingAreaChart({ data, range }) {
  const fmtX = (v) => (range === '12m' ? formatDate(v, 'MMM') : formatDate(v, 'MMM d'));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="period"
            tickFormatter={fmtX}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={(v) => formatCurrency(v, { compact: true })}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip content={<ChartTooltip range={range} />} cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1 }} />
          <Area type="monotone" dataKey="total" stroke="#a78bfa" strokeWidth={2.5} fill="url(#spendFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
