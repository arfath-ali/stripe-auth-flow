import { pool } from './pool.db.js';

export async function setupUsersTable() {
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS users(
    user_id SERIAL PRIMARY KEY, 
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL, 
    full_name VARCHAR(128) NOT NULL, 
    password TEXT, 
    country VARCHAR(100), 
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token TEXT DEFAULT NULL,
    verification_token_expires_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`,
    );
    console.log('users table ready');
  } catch (err) {
    console.error('users table setup failed:', err);
    process.exit(1);
  }
}
