import type { IncomingMessage, ServerResponse } from 'node:http';
import { pool } from '../database/pool.db.js';

export async function verifyResetTokenController(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const { token } = req.body;

    const result = await pool.query(
      `SELECT token FROM reset_tokens WHERE token=$1`,
      [token],
    );

    if (result.rows.length === 0) {
      res.statusCode = 400;
      res.end();
      return;
    }

    res.statusCode = 200;
    res.end();
  } catch (err) {
    console.error('verifyTokenController error:', err);
    res.statusCode = 500;
    res.end();
  }
}
