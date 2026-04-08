import type { IncomingMessage, ServerResponse } from 'node:http';
import { pool } from '../database/pool.db.js';
import crypto from 'node:crypto';
import { generateAuthCookie } from '../utils/token.utils.js';

export async function otpVerificationController(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const { email, otp } = req.body;

  const hashedToken = crypto.createHash('sha256').update(otp).digest('hex');

  try {
    const existing = await pool.query(
      `SELECT user_id, google_id, email, full_name, verification_token, verification_token_expires_at FROM users WHERE email=$1 AND verification_token=$2`,
      [email, hashedToken],
    );

    if (existing.rows.length === 0) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid OTP' }));
      return;
    }

    const expiresAt = new Date(existing.rows[0].verification_token_expires_at);
    const now = new Date();

    if (expiresAt < now) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'OTP expired. Click resend to get a new otp.',
        }),
      );
      return;
    }

    await pool.query(
      `UPDATE users SET is_verified=true, verification_token=NULL, verification_token_expires_at=NULL WHERE email=$1 AND verification_token=$2`,
      [email, hashedToken],
    );

    generateAuthCookie(
      existing.rows[0].user_id,
      existing.rows[0].email,
      existing.rows[0].full_name,
      existing.rows[0].google_id,
      res,
    );
    res.statusCode = 200;
    res.end();
  } catch (err) {
    console.error('verifyOTPController error:', err);
    res.statusCode = 500;
    res.end();
  }
}
