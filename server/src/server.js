import 'dotenv/config';
import app from './app.js';
import { checkConnection } from './config/db.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`\n  💸 Expense Tracker API → http://localhost:${PORT}`);

  if (!process.env.JWT_SECRET) {
    console.log('  ⚠ JWT_SECRET is not set. Copy server/.env.example to server/.env before logging in.');
  }

  const dbUp = await checkConnection();
  if (dbUp) {
    console.log('  ✓ Database connection OK\n');
  } else {
    console.log('  ⚠ Database not reachable. The API is up, but data routes need MySQL.');
    console.log('    → Set DB_* values in server/.env, then run: npm run db:init\n');
  }
});
