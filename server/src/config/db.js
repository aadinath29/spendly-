import mysql from 'mysql2/promise';

/**
 * Connection pool built entirely from environment variables, so the same code
 * runs unchanged on any machine — just point the .env at the right MySQL.
 *
 * Notes:
 *  - `decimalNumbers` makes DECIMAL columns come back as JS numbers (not strings).
 *  - `dateStrings` keeps DATE columns as 'YYYY-MM-DD' so there are no timezone shifts.
 *  - The pool connects lazily on first query, so the server can boot even if the
 *    database is temporarily unreachable (the /api/health route reports status).
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'expense_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  dateStrings: true,
  charset: 'utf8mb4_unicode_ci',
  ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: true } }),
});

/** Run a parameterized query and return the rows. */
export const query = async (sql, params = []) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};

/** Ping the database; returns true if reachable, false otherwise. */
export const checkConnection = async () => {
  try {
    const conn = await pool.getConnection();
    try {
      await conn.ping();
      return true;
    } finally {
      conn.release();
    }
  } catch {
    return false;
  }
};

export default pool;
