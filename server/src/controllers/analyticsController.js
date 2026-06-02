import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Totals + this-month vs last-month comparison, in a single pass. */
export const summary = asyncHandler(async (req, res) => {
  const [row] = await query(
    `SELECT
        COALESCE(SUM(amount), 0) AS total,
        COUNT(*) AS total_count,
        COALESCE(SUM(CASE WHEN expense_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                          THEN amount ELSE 0 END), 0) AS this_month,
        COALESCE(SUM(CASE WHEN expense_date >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01')
                          AND expense_date <  DATE_FORMAT(CURDATE(), '%Y-%m-01')
                          THEN amount ELSE 0 END), 0) AS last_month,
        COALESCE(SUM(CASE WHEN expense_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                          THEN 1 ELSE 0 END), 0) AS this_month_count
     FROM expenses WHERE user_id = ?`,
    [req.user.id]
  );

  const thisMonth = Number(row.this_month);
  const lastMonth = Number(row.last_month);
  const changePct =
    lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : thisMonth > 0 ? 100 : 0;

  res.json({
    success: true,
    data: {
      total: Number(row.total),
      totalCount: Number(row.total_count),
      thisMonth,
      lastMonth,
      thisMonthCount: Number(row.this_month_count),
      changePct: Math.round(changePct * 10) / 10,
    },
  });
});

/** Spend grouped by category for a date window (defaults to the current month). */
export const byCategory = asyncHandler(async (req, res) => {
  const from = req.query.from || firstOfMonth();
  const to = req.query.to || today();

  const categories = await query(
    `SELECT c.id AS category_id, c.name, c.color, c.icon,
            COALESCE(SUM(e.amount), 0) AS total, COUNT(e.id) AS count
     FROM categories c
     LEFT JOIN expenses e
       ON e.category_id = c.id AND e.user_id = c.user_id
      AND e.expense_date BETWEEN ? AND ?
     WHERE c.user_id = ?
     GROUP BY c.id
     HAVING total > 0
     ORDER BY total DESC`,
    [from, to, req.user.id]
  );

  res.json({ success: true, data: { from, to, categories } });
});

/** Time series of spend. range = '30d' | '90d' | '12m'. */
export const overTime = asyncHandler(async (req, res) => {
  const range = ['30d', '90d', '12m'].includes(req.query.range) ? req.query.range : '30d';
  let series;

  if (range === '12m') {
    series = await query(
      `SELECT DATE_FORMAT(expense_date, '%Y-%m-01') AS period, COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = ? AND expense_date >= DATE_FORMAT(CURDATE() - INTERVAL 11 MONTH, '%Y-%m-01')
       GROUP BY period ORDER BY period ASC`,
      [req.user.id]
    );
  } else {
    const days = range === '90d' ? 90 : 30;
    series = await query(
      `SELECT expense_date AS period, COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = ? AND expense_date >= CURDATE() - INTERVAL ? DAY
       GROUP BY expense_date ORDER BY expense_date ASC`,
      [req.user.id, days - 1]
    );
  }

  res.json({ success: true, data: { range, series } });
});

function today() {
  return new Date().toISOString().slice(0, 10);
}
function firstOfMonth() {
  return today().slice(0, 7) + '-01';
}
