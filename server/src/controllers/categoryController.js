import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/errors.js';

export const listCategories = asyncHandler(async (req, res) => {
  const categories = await query(
    `SELECT c.id, c.name, c.color, c.icon, c.created_at,
            COUNT(e.id) AS expense_count,
            COALESCE(SUM(e.amount), 0) AS total
     FROM categories c
     LEFT JOIN expenses e ON e.category_id = c.id AND e.user_id = c.user_id
     WHERE c.user_id = ?
     GROUP BY c.id
     ORDER BY c.name ASC`,
    [req.user.id]
  );
  res.json({ success: true, data: { categories } });
});

export const createCategory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const name = req.body.name.trim();
  const { color = '#6366f1', icon = 'tag' } = req.body;

  const result = await query(
    'INSERT INTO categories (user_id, name, color, icon) VALUES (?, ?, ?, ?)',
    [userId, name, color, icon]
  );
  const [category] = await query('SELECT id, name, color, icon, created_at FROM categories WHERE id = ?', [
    result.insertId,
  ]);
  res.status(201).json({ success: true, data: { category } });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.id);

  const [existing] = await query('SELECT * FROM categories WHERE id = ? AND user_id = ? LIMIT 1', [id, userId]);
  if (!existing) throw httpError(404, 'Category not found.');

  const name = (req.body.name ?? existing.name).trim();
  const color = req.body.color ?? existing.color;
  const icon = req.body.icon ?? existing.icon;

  await query('UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ? AND user_id = ?', [
    name, color, icon, id, userId,
  ]);
  const [category] = await query('SELECT id, name, color, icon, created_at FROM categories WHERE id = ?', [id]);
  res.json({ success: true, data: { category } });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const id = Number(req.params.id);

  // Expenses keep their history; their category_id is set NULL by the FK constraint.
  const result = await query('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
  if (result.affectedRows === 0) throw httpError(404, 'Category not found.');

  res.json({ success: true, data: { id } });
});
