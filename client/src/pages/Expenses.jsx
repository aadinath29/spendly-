import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Plus, Search, Pencil, Trash2, ArrowUp, ArrowDown, ReceiptText, X,
} from 'lucide-react';
import api, { getApiError } from '../lib/api.js';
import { formatCurrency, formatDate } from '../lib/format.js';
import PageHeader from '../components/PageHeader.jsx';
import CategoryPill from '../components/CategoryPill.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ExpenseFormModal from '../components/ExpenseFormModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const PAGE_SIZE = 12;
const PAYMENT_LABEL = { cash: 'Cash', card: 'Card', upi: 'UPI', bank: 'Bank', other: 'Other' };

const initialFilters = { q: '', categoryId: '', from: '', to: '', sort: 'date', dir: 'desc', page: 1 };

export default function Expenses() {
  const [filters, setFilters] = useState(initialFilters);
  const [qInput, setQInput] = useState('');
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState({ open: false, expense: null });
  const [confirm, setConfirm] = useState({ open: false, expense: null, loading: false });

  // Load categories once for the filter dropdown.
  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data.categories)).catch(() => {});
  }, []);

  // Debounce the search box into the filter state.
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, q: qInput, page: 1 })), 350);
    return () => clearTimeout(t);
  }, [qInput]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = { pageSize: PAGE_SIZE, page: filters.page, sort: filters.sort, dir: filters.dir };
    if (filters.q) params.q = filters.q;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    try {
      const { data } = await api.get('/expenses', { params });
      setRows(data.data.expenses);
      setPagination(data.data.pagination);
      setFilteredTotal(data.data.filteredTotal);
    } catch (err) {
      toast.error(getApiError(err, 'Could not load expenses.'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleSort = (col) =>
    setFilters((f) => ({ ...f, sort: col, dir: f.sort === col && f.dir === 'desc' ? 'asc' : 'desc', page: 1 }));

  const setPage = (page) => setFilters((f) => ({ ...f, page }));

  const clearFilters = () => {
    setQInput('');
    setFilters(initialFilters);
  };

  const hasFilters = filters.q || filters.categoryId || filters.from || filters.to;

  const doDelete = async () => {
    setConfirm((c) => ({ ...c, loading: true }));
    try {
      await api.delete(`/expenses/${confirm.expense.id}`);
      toast.success('Expense deleted');
      setConfirm({ open: false, expense: null, loading: false });
      // Step back a page if we just removed the last item on it.
      if (rows.length === 1 && filters.page > 1) setPage(filters.page - 1);
      else load();
    } catch (err) {
      toast.error(getApiError(err, 'Could not delete expense.'));
      setConfirm((c) => ({ ...c, loading: false }));
    }
  };

  const SortIcon = ({ col }) =>
    filters.sort === col ? (
      filters.dir === 'desc' ? <ArrowDown size={13} /> : <ArrowUp size={13} />
    ) : null;

  return (
    <>
      <PageHeader title="Expenses" subtitle="Search, filter, and manage everything you spend.">
        <button className="btn-primary" onClick={() => setModal({ open: true, expense: null })}>
          <Plus size={17} /> Add expense
        </button>
      </PageHeader>

      {/* Filters */}
      <div className="card mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input pl-10"
              placeholder="Search description…"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
            />
          </div>
          <select
            className="input"
            value={filters.categoryId}
            onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value, page: 1 }))}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="input"
            value={filters.from}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value, page: 1 }))}
          />
          <input
            type="date"
            className="input"
            value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value, page: 1 }))}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-400">
            {pagination.total} {pagination.total === 1 ? 'expense' : 'expenses'} ·{' '}
            <span className="font-semibold text-slate-100">{formatCurrency(filteredTotal)}</span>
          </span>
          {hasFilters && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200">
              <X size={13} /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!loading && rows.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={hasFilters ? 'No matching expenses' : 'No expenses yet'}
          description={hasFilters ? 'Try adjusting your filters.' : 'Add your first expense to get started.'}
          action={
            !hasFilters && (
              <button className="btn-primary" onClick={() => setModal({ open: true, expense: null })}>
                <Plus size={17} /> Add expense
              </button>
            )
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">
                    <button onClick={() => toggleSort('date')} className="inline-flex items-center gap-1 hover:text-slate-300">
                      Date <SortIcon col="date" />
                    </button>
                  </th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 text-right font-medium">
                    <button onClick={() => toggleSort('amount')} className="inline-flex items-center gap-1 hover:text-slate-300">
                      Amount <SortIcon col="amount" />
                    </button>
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-5 py-4" colSpan={6}>
                          <div className="h-5 w-full skeleton" />
                        </td>
                      </tr>
                    ))
                  : rows.map((e) => (
                      <tr key={e.id} className="group transition hover:bg-white/[0.03]">
                        <td className="whitespace-nowrap px-5 py-3.5 text-slate-300">{formatDate(e.expense_date)}</td>
                        <td className="max-w-xs truncate px-5 py-3.5 text-slate-200">{e.description || '—'}</td>
                        <td className="px-5 py-3.5">
                          <CategoryPill name={e.category_name} color={e.category_color} icon={e.category_icon} />
                        </td>
                        <td className="px-5 py-3.5 text-slate-400">{PAYMENT_LABEL[e.payment_method] || e.payment_method}</td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold text-white">
                          {formatCurrency(e.amount)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                            <button
                              onClick={() => setModal({ open: true, expense: e })}
                              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setConfirm({ open: true, expense: e, loading: false })}
                              className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/15 hover:text-rose-300"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-20 p-4" />)
              : rows.map((e) => (
                  <div key={e.id} className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-100">{e.description || e.category_name || 'Expense'}</div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {formatDate(e.expense_date)} · {PAYMENT_LABEL[e.payment_method] || e.payment_method}
                        </div>
                        <div className="mt-2">
                          <CategoryPill name={e.category_name} color={e.category_color} icon={e.category_icon} />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">{formatCurrency(e.amount)}</div>
                        <div className="mt-1 flex justify-end gap-1">
                          <button
                            onClick={() => setModal({ open: true, expense: e })}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setConfirm({ open: true, expense: e, loading: false })}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-300"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                className="btn-ghost px-3 py-1.5 text-sm"
                disabled={filters.page <= 1}
                onClick={() => setPage(filters.page - 1)}
              >
                Previous
              </button>
              <span className="px-2 text-sm text-slate-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn-ghost px-3 py-1.5 text-sm"
                disabled={filters.page >= pagination.totalPages}
                onClick={() => setPage(filters.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <ExpenseFormModal
        open={modal.open}
        expense={modal.expense}
        onClose={() => setModal({ open: false, expense: null })}
        onSaved={load}
      />
      <ConfirmDialog
        open={confirm.open}
        loading={confirm.loading}
        onClose={() => setConfirm({ open: false, expense: null, loading: false })}
        onConfirm={doDelete}
        title="Delete expense?"
        message="This will permanently remove this expense. This action cannot be undone."
      />
    </>
  );
}
