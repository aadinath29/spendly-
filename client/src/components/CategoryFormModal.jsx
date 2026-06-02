import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getApiError } from '../lib/api.js';
import Modal from './Modal.jsx';
import Spinner from './Spinner.jsx';
import { ICON_NAMES, CategoryIcon } from '../lib/icons.jsx';

const PALETTE = [
  '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#f59e0b',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#64748b',
];

const emptyForm = () => ({ name: '', color: '#6366f1', icon: 'tag' });

export default function CategoryFormModal({ open, onClose, onSaved, category }) {
  const editing = Boolean(category);
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(editing ? { name: category.name, color: category.color, icon: category.icon } : emptyForm());
  }, [open, editing, category]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Please enter a category name.');
    setError('');
    setLoading(true);
    try {
      if (editing) await api.put(`/categories/${category.id}`, form);
      else await api.post('/categories', form);
      toast.success(editing ? 'Category updated' : 'Category created');
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(getApiError(err, 'Could not save category.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit category' : 'New category'}
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" form="category-form" className="btn-primary" disabled={loading}>
            {loading ? <Spinner size={16} /> : editing ? 'Save changes' : 'Create category'}
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-200">
          {error}
        </div>
      )}

      <form id="category-form" onSubmit={submit} className="space-y-5">
        <div>
          <label className="label">Name</label>
          <input
            className="input"
            autoFocus
            maxLength={80}
            placeholder="e.g. Coffee"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>

        <div>
          <label className="label">Color</label>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setForm((f) => ({ ...f, color: c }))}
                className={`h-8 w-8 rounded-lg transition ${
                  form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="label">Icon</label>
          <div className="grid grid-cols-8 gap-2">
            {ICON_NAMES.map((name) => (
              <button
                type="button"
                key={name}
                onClick={() => setForm((f) => ({ ...f, icon: name }))}
                className={`grid aspect-square place-items-center rounded-lg border transition ${
                  form.icon === name ? 'border-transparent text-white' : 'border-white/10 text-slate-400 hover:bg-white/5'
                }`}
                style={form.icon === name ? { backgroundColor: form.color } : undefined}
                aria-label={name}
              >
                <CategoryIcon name={name} size={16} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Preview</label>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: `${form.color}22`, color: form.color }}
          >
            <CategoryIcon name={form.icon} size={13} />
            {form.name || 'Category'}
          </span>
        </div>
      </form>
    </Modal>
  );
}
