import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Wallet, CalendarDays, TrendingUp, Hash, PieChart as PieIcon, AlertCircle, RefreshCw } from 'lucide-react';
import api, { getApiError } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatDate } from '../lib/format.js';
import { CategoryIcon } from '../lib/icons.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Spinner from '../components/Spinner.jsx';
import ExpenseFormModal from '../components/ExpenseFormModal.jsx';
import SpendingAreaChart from '../components/charts/SpendingAreaChart.jsx';
import CategoryDonut from '../components/charts/CategoryDonut.jsx';

const RANGES = [
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '12m', label: '12M' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [series, setSeries] = useState([]);
  const [recent, setRecent] = useState([]);
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const loadCore = useCallback(async () => {
    const [s, c, r] = await Promise.all([
      api.get('/analytics/summary'),
      api.get('/analytics/by-category'),
      api.get('/expenses', { params: { pageSize: 6, sort: 'date', dir: 'desc' } }),
    ]);
    setSummary(s.data.data);
    setByCategory(c.data.data.categories);
    setRecent(r.data.data.expenses);
  }, []);

  const loadSeries = useCallback(async (rng) => {
    const { data } = await api.get('/analytics/over-time', { params: { range: rng } });
    setSeries(data.data.series);
  }, []);

  const refreshCore = useCallback(() => {
    setLoading(true);
    setLoadError('');
    loadCore()
      .catch((err) => setLoadError(getApiError(err, 'Could not load your dashboard.')))
      .finally(() => setLoading(false));
  }, [loadCore]);

  useEffect(() => {
    refreshCore();
  }, [refreshCore]);

  useEffect(() => {
    setSeriesLoading(true);
    loadSeries(range)
      .catch(() => setSeries([]))
      .finally(() => setSeriesLoading(false));
  }, [range, loadSeries]);

  const onSaved = () => {
    refreshCore();
    loadSeries(range);
  };

  const firstName = user?.name?.split(' ')[0] || 'there';
  const donutTotal = byCategory.reduce((acc, c) => acc + Number(c.total), 0);
  const isEmpty = !loading && summary && summary.totalCount === 0;

  if (loadError) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle={`Welcome back, ${firstName}`} />
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <AlertCircle className="text-rose-300" />
          <p className="text-slate-300">{loadError}</p>
          <button className="btn-ghost" onClick={refreshCore}>
            <RefreshCw size={15} /> Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" subtitle={`Welcome back, ${firstName} 👋`}>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={17} /> Add expense
        </button>
      </PageHeader>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="This month"
          value={formatCurrency(summary?.thisMonth)}
          icon={CalendarDays}
          trend={summary ? summary.changePct : undefined}
          trendLabel="vs last month"
          loading={loading}
        />
        <StatCard label="Last month" value={formatCurrency(summary?.lastMonth)} icon={TrendingUp} loading={loading} />
        <StatCard label="All-time total" value={formatCurrency(summary?.total)} icon={Wallet} loading={loading} />
        <StatCard label="Transactions" value={summary?.totalCount ?? 0} icon={Hash} loading={loading} />
      </div>

      {isEmpty ? (
        <div className="mt-6">
          <EmptyState
            icon={Wallet}
            title="No expenses yet"
            description="Add your first expense to see your spending come to life with charts and insights."
            action={
              <button className="btn-primary" onClick={() => setModalOpen(true)}>
                <Plus size={17} /> Add your first expense
              </button>
            }
          />
        </div>
      ) : (
        <>
          {/* Charts */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="card p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-white">Spending over time</h3>
                <div className="flex rounded-lg border border-white/10 bg-white/5 p-0.5">
                  {RANGES.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setRange(r.value)}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                        range === r.value ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              {seriesLoading ? (
                <div className="grid h-72 place-items-center text-slate-500">
                  <Spinner size={24} />
                </div>
              ) : series.length === 0 ? (
                <div className="grid h-72 place-items-center text-sm text-slate-500">No spending in this period.</div>
              ) : (
                <SpendingAreaChart data={series} range={range} />
              )}
            </div>

            <div className="card p-5">
              <h3 className="mb-4 font-semibold text-white">By category · this month</h3>
              {byCategory.length === 0 ? (
                <div className="grid h-64 place-items-center text-center text-sm text-slate-500">
                  <div>
                    <PieIcon className="mx-auto mb-2 opacity-50" />
                    No spending this month yet.
                  </div>
                </div>
              ) : (
                <>
                  <CategoryDonut data={byCategory} total={donutTotal} />
                  <div className="mt-4 space-y-2">
                    {byCategory.slice(0, 5).map((c) => (
                      <div key={c.category_id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-slate-300">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                          {c.name}
                        </span>
                        <span className="font-medium text-slate-200">{formatCurrency(c.total)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Recent */}
          <div className="card mt-4 p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold text-white">Recent expenses</h3>
              <Link to="/expenses" className="text-sm font-medium text-brand-400 hover:text-brand-500">
                View all
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">Nothing here yet.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {recent.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                        style={{ backgroundColor: `${e.category_color || '#64748b'}22`, color: e.category_color || '#94a3b8' }}
                      >
                        <CategoryIcon name={e.category_icon} size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-200">
                          {e.description || e.category_name || 'Expense'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatDate(e.expense_date)} · {e.category_name || 'Uncategorized'}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-white">{formatCurrency(e.amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <ExpenseFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={onSaved} />
    </>
  );
}
