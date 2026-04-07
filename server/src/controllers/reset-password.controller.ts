import type { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'crypto';

import { pool } from '../database/pool.db.js';
import { sendNoAccountEmail, sendResetPasswordEmail } from '../utils/mailer.utils.js';

export async function resetPasswordController(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const { email } = req.body;
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const result = await pool.query(
      `SELECT user_id FROM users WHERE email=$1`,
      [email],
    );

    if (result.rows.length === 0) {
      await sendNoAccountEmail(email);
      res.statusCode = 200;
      res.end();
      return;
    }

    const userId = result.rows[0].user_id;

    await pool.query(
      `INSERT INTO reset_tokens (user_id, token, expires_at) VALUES($1, $2, $3)`,
      [userId, token, expiresAt],
    );

    const resetLink = `http://localhost:8000/reset?token=${token}`;
    await sendResetPasswordEmail(email, resetLink);

    res.statusCode = 200;
    res.end();
  } catch (err) {
    console.error('resetPasswordController error:', err);
    res.statusCode = 500;
    res.end();
  }
}
