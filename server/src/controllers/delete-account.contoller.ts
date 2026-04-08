import type { IncomingMessage, ServerResponse } from 'node:http';
import { getUserFromToken } from '../utils/auth.utils.js';
import { pool } from '../database/pool.db.js';
import bcrypt from 'bcrypt';

export async function deleteAccountController(
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

    const { password } = req.body;

    const existing = await pool.query(
      'SELECT user_id, password FROM users WHERE user_id=$1',
      [user.user_id],
    );

    if (!existing.rows.length) {
      res.statusCode = 404;
      res.end();
      return;
    }

    if (existing?.rows[0].password === null) {
      res.statusCode = 401;
      res.end();
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existing?.rows[0].password,
    );

    if (!isPasswordValid) {
      res.writeHead(401);
      res.end();
      return;
    }

    await pool.query(`DELETE FROM users WHERE user_id=$1`, [
      existing.rows[0].user_id,
    ]);

    res.setHeader(
      'Set-Cookie',
      'token=; Max-Age=0; HttpOnly; Path=/; SameSite=Lax',
    );
    res.statusCode = 200;
    res.end();
  } catch (err) {
    console.error('deleteAccountController error:', err);
    res.statusCode = 500;
    res.end();
  }
}
