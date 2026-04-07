import type { IncomingMessage, ServerResponse } from 'node:http';
import { pool } from '../database/pool.db.js';
import { generateAuthCookie } from '../utils/token.utils.js';
import { getUserFromToken } from '../utils/auth.utils.js';

export async function profileController(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;
    const user = getUserFromToken(req);

    if (!user) {
      res.statusCode = 401;
      res.end();
      return;
    }

    const { email, full_name } = req.body;

    if (!email && !full_name) {
      res.statusCode = 400;
      res.end();
      return;
    }

    if (email && email !== user.email) {
      const existing = await pool.query(
        `SELECT user_id FROM users WHERE email=$1`,
        [email],
      );

      if (
        existing.rows.length > 0 &&
        existing.rows[0].user_id !== user.user_id
      ) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Email already exists' }));
        return;
      } else {
        updates.push(`email=$${i++}`);
        values.push(email);
      }
    }

    if (full_name) {
      updates.push(`full_name=$${i++}`);
      values.push(full_name);
    }

    values.push(user.user_id);

    const existing = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE user_id=$${i} RETURNING user_id, email, full_name, google_id`,
      values,
    );

    if (existing.rows.length === 0) {
      res.statusCode = 409;
      res.end();
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
    console.error('profileController error:', err);
    res.statusCode = 500;
    res.end();
  }
}
