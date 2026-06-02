import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getApiError } from '../lib/api.js';
import { todayISO } from '../lib/format.js';
import Modal from './Modal.jsx';
import Spinner from './Spinner.jsx';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank', label: 'Bank transfer' },
  { value: 'other', label: 'Other' },
];

const emptyForm = () => ({
  amount: '',
  category_id: '',
  expense_date: todayISO(),
  payment_method: 'cash',
  description: '',
});

export default function ExpenseFormModal({ open, onClose, onSaved, expense }) {
  const editing = Boolean(expense);
  const [form, setForm] = useState(emptyForm());
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(
      editing
        ? {
            amount: String(expense.amount),
            category_id: expense.category_id ? String(expense.category_id) : '',
            expense_date: (expense.expense_date || '').slice(0, 10) || todayISO(),
            payment_method: expense.payment_method || 'cash',
            description: expense.description || '',
          }
        : emptyForm()
    );
    api
      .get('/categories')
      .then(({ data }) => setCategories(data.data.categories))
      .catch(() => setCategories([]));
  }, [open, editing, expense]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!(amount > 0)) return setError('Enter an amount greater than 0.');
    if (!form.expense_date) return setError('Please pick a date.');

    setError('');
    setLoading(true);
    const payload = {
      amount,
      description: form.description.trim(),
      expense_date: form.expense_date,
      payment_method: form.payment_method,
      category_id: form.category_id ? Number(form.category_id) : null,
    };
    try {
      if (editing) await api.put(`/expenses/${expense.id}`, payload);
      else await api.post('/expenses', payload);
      toast.success(editing ? 'Expense updated' : 'Expense added');
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(getApiError(err, 'Could not save expense.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit expense' : 'Add expense'}
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" form="expense-form" className="btn-primary" disabled={loading}>
            {loading ? <Spinner size={16} /> : editing ? 'Save changes' : 'Add expense'}
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-200">
          {error}
        </div>
      )}

      <form id="expense-form" onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              required
              autoFocus
              className="input"
              placeholder="0.00"
              value={form.amount}
              onChange={set('amount')}
            />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" required className="input" value={form.expense_date} onChange={set('expense_date')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category_id} onChange={set('category_id')}>
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Payment</label>
            <select className="input" value={form.payment_method} onChange={set('payment_method')}>
              {PAYMENT_METHODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <input
            type="text"
            maxLength={255}
            className="input"
            placeholder="What was this for?"
            value={form.description}
            onChange={set('description')}
          />
        </div>
      </form>
    </Modal>
  );
}
