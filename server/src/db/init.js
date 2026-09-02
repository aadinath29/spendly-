import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const {
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'expense_tracker',
  DB_SSL = 'false',
} = process.env;

// DB_NAME is interpolated into SQL, so guard it against anything unexpected.
if (!/^[A-Za-z0-9_]+$/.test(DB_NAME)) {
  console.error(`✗ Invalid DB_NAME "${DB_NAME}". Use only letters, numbers, and underscores.`);
  process.exit(1);
}

async function main() {
  const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');

  // Connect WITHOUT a database first, so we can create it if it doesn't exist.
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
    ...(DB_SSL === 'true' && { ssl: { rejectUnauthorized: true } }),
  });

  try {
    console.log(`→ Ensuring database \`${DB_NAME}\` exists...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.query(`USE \`${DB_NAME}\`;`);

    console.log('→ Creating tables...');
    await connection.query(schema);

    console.log(`✓ Database "${DB_NAME}" initialized successfully.`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('✗ Database initialization failed:', err.message);
  console.error('  Check your MySQL server is running and the credentials in server/.env are correct.');
  process.exit(1);
});
