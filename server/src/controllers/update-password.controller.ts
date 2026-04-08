import type { IncomingMessage, ServerResponse } from 'node:http';
import bcrypt from 'bcrypt';
import { pool } from '../database/pool.db.js';

export async function updatePasswordController(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const { token, password } = req.body;

    const result = await pool.query(
      `SELECT user_id FROM reset_tokens WHERE token = $1`,
      [token],
    );

    if (result.rows.length === 0) {
      await pool.query(`DELETE FROM reset_tokens WHERE token=$1`, [token]);
      res.writeHead(400);
      res.end();
      return;
    }

    const userId = result.rows[0].user_id;
    const response = await pool.query(
      `SELECT email FROM users WHERE user_id = $1`,
      [userId],
    );
    const email = response.rows[0].email;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(`UPDATE users SET password=$1 WHERE user_id=$2`, [
      hashedPassword,
      userId,
    ]);

    await pool.query(`DELETE FROM reset_tokens WHERE token=$1`, [token]);

    res.setHeader(
      'Set-Cookie',
      'token=; Max-Age=0; HttpOnly; Path=/; SameSite=None; Secure',
    );
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ email }));
  } catch (err) {
    console.error('updatePasswordController error:', err);
    res.statusCode = 500;
    res.end();
  }
}
