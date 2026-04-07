import { pool } from './pool.db.js';

export async function setupResetTokensTable() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS reset_tokens(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP)`);
    console.log('reset_tokens table ready');
  } catch (err) {
    console.error('reset_tokens table setup failed:', err);
    process.exit(1);
  }
}
