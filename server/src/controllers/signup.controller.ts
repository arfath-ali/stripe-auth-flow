import type { IncomingMessage, ServerResponse } from 'node:http';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { pool } from '../database/pool.db.js';
import { sendVerificationEmail } from '../utils/mailer.utils.js';

export async function signupController(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const { email, full_name, password, country } = req.body;

    const existing = await pool.query(
      `SELECT google_id, email FROM users WHERE email=$1`,
      [email],
    );

    if (existing.rows.length > 0) {
      const user = existing.rows[0];

      if (user.google_id) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            error:
              'This email is linked to a Google account. Please Sign in with Google to continue.',
          }),
        );
        return;
      } else {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Email already exists' }));
        return;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedToken = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const result = await pool.query(
      `INSERT INTO users(email, full_name, password, country, verification_token, verification_token_expires_at) 
        VALUES($1, $2, $3, $4, $5, $6)    
        RETURNING email`,
      [email, full_name, hashedPassword, country, hashedToken, expiresAt],
    );

    const userEmail = result.rows[0].email;

    try {
      await sendVerificationEmail(userEmail, otp);
    } catch (mailErr) {
      console.error('Signup Mailer Error:', mailErr);
    }

    res.statusCode = 200;
    res.end();
  } catch (err) {
    console.error('signupController error:', err);
    res.statusCode = 500;
    res.end();
  }
}
