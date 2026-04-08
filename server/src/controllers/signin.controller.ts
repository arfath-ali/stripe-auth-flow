import type { IncomingMessage, ServerResponse } from 'node:http';
import { pool } from '../database/pool.db.js';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { generateAuthCookie } from '../utils/token.utils.js';
import 'dotenv/config';
import { sendVerificationEmail } from '../utils/mailer.utils.js';

export async function signinController(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const { email, password } = req.body;

    const existing = await pool.query(
      'SELECT user_id, google_id, email, full_name, password, is_verified FROM users WHERE email=$1',
      [email],
    );

    if (existing.rows.length === 0) {
      res.statusCode = 409;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Incorrect email or password' }));
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existing.rows[0].password,
    );

    if (!isPasswordValid) {
      res.statusCode = 409;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Incorrect email or password' }));
      return;
    }

    if (!existing.rows[0].is_verified) {
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

      try {
        await sendVerificationEmail(email, otp);
      } catch (mailErr) {
        console.error('Signin Mailer Error:', mailErr);
      }

      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          action: 'VERIFY_REQUIRED',
        }),
      );
      return;
    }

    const userId = existing.rows[0].user_id;
    const userEmail = existing.rows[0].email;
    const fullName = existing.rows[0].full_name;
    const googleId = existing.rows[0].google_id;

    generateAuthCookie(userId, userEmail, fullName, googleId, res);

    res.statusCode = 200;
    res.end();
  } catch (err) {
    console.error('signinController error:', err);
    res.statusCode = 500;
    res.end();
  }
}
