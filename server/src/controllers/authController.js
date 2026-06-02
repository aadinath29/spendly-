import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/errors.js';
import { DEFAULT_CATEGORIES } from '../utils/defaultCategories.js';

const signToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

export const register = asyncHandler(async (req, res) => {
  const name = req.body.name.trim();
  const email = req.body.email.trim().toLowerCase();
  const { password } = req.body;

  const existing = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  if (existing.length) throw httpError(409, 'An account with that email already exists.');

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, passwordHash]
  );
  const userId = result.insertId;

  // Seed starter categories in a single multi-row insert.
  const rows = DEFAULT_CATEGORIES.map((c) => [userId, c.name, c.color, c.icon]);
  await query('INSERT INTO categories (user_id, name, color, icon) VALUES ?', [rows]);

  const user = { id: userId, name, email };
  res.status(201).json({ success: true, data: { user: publicUser(user), token: signToken(user) } });
});

export const login = asyncHandler(async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const { password } = req.body;

  const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  const user = rows[0];
  if (!user) throw httpError(401, 'Invalid email or password.');

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw httpError(401, 'Invalid email or password.');

  res.json({ success: true, data: { user: publicUser(user), token: signToken(user) } });
});

export const me = asyncHandler(async (req, res) => {
  const rows = await query(
    'SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1',
    [req.user.id]
  );
  if (!rows.length) throw httpError(404, 'User not found.');
  res.json({ success: true, data: { user: rows[0] } });
});
