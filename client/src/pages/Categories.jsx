import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Tags } from 'lucide-react';
import api, { getApiError } from '../lib/api.js';
import { formatCurrency } from '../lib/format.js';
import { CategoryIcon } from '../lib/icons.jsx';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import CategoryFormModal from '../components/CategoryFormModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, category: null });
  const [confirm, setConfirm] = useState({ open: false, category: null, loading: false });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data.categories);
    } catch (err) {
      toast.error(getApiError(err, 'Could not load categories.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const doDelete = async () => {
    setConfirm((c) => ({ ...c, loading: true }));
    try {
      await api.delete(`/categories/${confirm.category.id}`);
      toast.success('Category deleted');
      setConfirm({ open: false, category: null, loading: false });
      load();
    } catch (err) {
      toast.error(getApiError(err, 'Could not delete category.'));
      setConfirm((c) => ({ ...c, loading: false }));
    }
  };

  return (
    <>
      <PageHeader title="Categories" subtitle="Organize your spending with custom categories.">
        <button className="btn-primary" onClick={() => setModal({ open: true, category: null })}>
          <Plus size={17} /> New category
        </button>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-28 p-5" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No categories yet"
          description="Create your first category to start organizing expenses."
          action={
            <button className="btn-primary" onClick={() => setModal({ open: true, category: null })}>
              <Plus size={17} /> New category
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.id} className="card group p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-11 w-11 place-items-center rounded-xl"
                    style={{ backgroundColor: `${c.color}22`, color: c.color }}
                  >
                    <CategoryIcon name={c.icon} size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-100">{c.name}</div>
                    <div className="text-xs text-slate-500">
                      {c.expense_count} {Number(c.expense_count) === 1 ? 'expense' : 'expenses'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                  <button
                    onClick={() => setModal({ open: true, category: c })}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setConfirm({ open: true, category: c, loading: false })}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-300"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between">
                <span className="text-xs text-slate-500">Total spent</span>
                <span className="text-lg font-bold text-white">{formatCurrency(c.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryFormModal
        open={modal.open}
        category={modal.category}
        onClose={() => setModal({ open: false, category: null })}
        onSaved={load}
      />
      <ConfirmDialog
        open={confirm.open}
        loading={confirm.loading}
        onClose={() => setConfirm({ open: false, category: null, loading: false })}
        onConfirm={doDelete}
        title="Delete category?"
        message="Expenses in this category will become Uncategorized. This cannot be undone."
      />
    </>
  );
}
