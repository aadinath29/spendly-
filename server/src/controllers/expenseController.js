import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/errors.js';

const EXPENSE_SELECT = `
  SELECT e.id, e.amount, e.description, e.expense_date, e.payment_method,
         e.category_id, c.name AS category_name, c.color AS category_color, c.icon AS category_icon,
         e.created_at, e.updated_at
  FROM expenses e
  LEFT JOIN categories c ON c.id = e.category_id`;

async function getExpenseById(userId, id) {
  const rows = await query(`${EXPENSE_SELECT} WHERE e.id = ? AND e.user_id = ? LIMIT 1`, [id, userId]);
  return rows[0] || null;
}

async function assertCategoryOwned(userId, categoryId) {
  const rows = await query('SELECT id FROM categories WHERE id = ? AND user_id = ? LIMIT 1', [categoryId, userId]);
  if (!rows.length) throw httpError(400, 'That category does not exist.');
}

export const listExpenses = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { from, to, categoryId, q } = req.query;

  const where = ['e.user_id = ?'];
  const params = [userId];

  if (from) { where.push('e.expense_date >= ?'); params.push(from); }
  if (to) { where.push('e.expense_date <= ?'); params.push(to); }
  if (categoryId) { where.push('e.category_id = ?'); params.push(Number(categoryId)); }
  if (q) { where.push('e.description LIKE ?'); params.push(`%${q}%`); }

  const whereSql = `WHERE ${where.join(' AND ')}`;

  // Whitelisted sort column + direction (never interpolate user input directly).
  const sortMap = { date: 'e.expense_date', amount: 'e.amount', created: 'e.created_at' };
  const sortCol = sortMap[req.query.sort] || 'e.expense_date';
  const dir = String(req.query.dir).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
  const offset = (page - 1) * pageSize;

  const expenses = await query(
    `${EXPENSE_SELECT} ${whereSql} ORDER BY ${sortCol} ${dir}, e.id DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  const [{ total, sum }] = await query(
    `SELECT COUNT(*) AS total, COALESCE(SUM(e.amount), 0) AS sum FROM expenses e ${whereSql}`,
    params
  );

  res.json({
    success: true,
    data: {
      expenses,
      filteredTotal: sum,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    },
  });
});

export const createExpense = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { amount, description = '', expense_date, payment_method = 'cash', category_id = null } = req.body;

  if (category_id != null) await assertCategoryOwned(userId, category_id);

  const result = await query(
    `INSERT INTO expenses (user_id, category_id, amount, description, expense_date, payment_method)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, category_id || null, amount, description, expense_date, payment_method]
  );

  const expense = await getExpenseById(userId, result.insertId);
  res.status(201).json({ success: true, data: { expense } });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.id);

  const existing = await getExpenseById(userId, id);
  if (!existing) throw httpError(404, 'Expense not found.');

  const {
    amount = existing.amount,
    description = existing.description,
    expense_date = existing.expense_date,
    payment_method = existing.payment_method,
    category_id = existing.category_id,
  } = req.body;

  if (category_id != null) await assertCategoryOwned(userId, category_id);

  await query(
    `UPDATE expenses SET amount = ?, description = ?, expense_date = ?, payment_method = ?, category_id = ?
     WHERE id = ? AND user_id = ?`,
    [amount, description, expense_date, payment_method, category_id || null, id, userId]
  );

  const expense = await getExpenseById(userId, id);
  res.json({ success: true, data: { expense } });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.id);

  const result = await query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
  if (result.affectedRows === 0) throw httpError(404, 'Expense not found.');

  res.json({ success: true, data: { id } });
});
