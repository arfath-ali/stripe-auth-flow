import type { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';
import { pool } from '../database/pool.db.js';
import { sendVerificationEmail } from '../utils/mailer.utils.js';

export async function resendOTPController(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedToken = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      ` UPDATE users 
              SET verification_token = $1,
                  verification_token_expires_at = $2
              WHERE email = $3 AND is_verified = false`,
      [hashedToken, expiresAt, email],
    );

    await sendVerificationEmail(email, otp);

    res.statusCode = 200;
    res.end();
  } catch (err) {
    console.error('resendOTPController error:', err);
    res.statusCode = 500;
    res.end();
  }
}
