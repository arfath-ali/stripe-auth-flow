import type { IncomingMessage, ServerResponse } from 'node:http';
import { getUserFromToken } from '../utils/auth.utils.js';
import { pool } from '../database/pool.db.js';

export async function getSessionController(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const user = getUserFromToken(req);

    if (!user) {
      res.statusCode = 401;
      res.end();
      return;
    }

    const existing = await pool.query(
      `SELECT user_id FROM users WHERE user_id=$1`,
      [user.user_id],
    );

    if (existing.rows.length === 0) {
      res.setHeader(
        'Set-Cookie',
        'token=; Max-Age=0; HttpOnly; Path=/; SameSite=Lax',
      );
      res.statusCode = 401;
      res.end();
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
  } catch (err) {
    console.error('sessionController error:', err);
    res.statusCode = 500;
    res.end();
  }
}
