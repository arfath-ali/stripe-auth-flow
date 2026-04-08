import type { IncomingMessage, ServerResponse } from 'node:http';
import type { googleProfileType } from '../types/google-profile.types.js';
import { pool } from '../database/pool.db.js';
import { generateAuthCookie } from '../utils/token.utils.js';
import { getCountryFromIP } from '../utils/get-country.utils.js';
import { getUserFromToken } from '../utils/auth.utils.js';

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  FRONTEND_URL,
} = process.env;

export async function googleCallbackController(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const url = new URL(req.url ?? '', `${FRONTEND_URL}`);
  const code = url.searchParams.get('code') ?? undefined;
  const mode = url.searchParams.get('state') ?? 'signin';

  const sessionUser = mode === 'delete' ? getUserFromToken(req) : null;
  if (mode === 'delete' && !sessionUser) {
    res.statusCode = 302;
    res.setHeader('Location', `${FRONTEND_URL}/signin`);
    res.end();
    return;
  }

  if (!code) {
    if (mode === 'delete') {
      res.statusCode = 302;
      res.setHeader('Location', `${FRONTEND_URL}/profile`);
      res.end();
      return;
    } else {
      res.statusCode = 302;
      res.setHeader('Location', `${FRONTEND_URL}/signin`);
      res.end();
      return;
    }
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    });

    const { access_token } = (await tokenRes.json()) as {
      access_token: string;
    };

    const profileRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      { headers: { Authorization: `Bearer ${access_token}` } },
    );

    const profile = (await profileRes.json()) as googleProfileType;

    if (!profile.email_verified) {
      res.statusCode = 302;
      res.setHeader('Location', `${FRONTEND_URL}/signin`);
      res.end();
      return;
    }

    const existing = await pool.query(
      `SELECT user_id, google_id, email, full_name FROM users WHERE google_id=$1`,
      [profile.sub],
    );

    if (mode === 'delete') {
      if (
        existing.rows.length === 0 ||
        existing.rows[0].email !== sessionUser!.email
      ) {
        res.statusCode = 302;
        res.setHeader(
          'Location',
          `${FRONTEND_URL}/profile?error=wrong_account`,
        );
        res.end();
        return;
      }

      await pool.query(`DELETE FROM users WHERE user_id=$1`, [
        existing.rows[0].user_id,
      ]);
      res.setHeader(
        'Set-Cookie',
        'token=; Max-Age=0; HttpOnly; Path=/; SameSite=None; Secure',
      );
      res.statusCode = 302;
      res.setHeader('Location', `${FRONTEND_URL}/signin?message=deleted`);
      res.end();
      return;
    }

    if (existing.rows.length > 0) {
      generateAuthCookie(
        existing.rows[0].user_id,
        existing.rows[0].email,
        existing.rows[0].full_name,
        existing.rows[0].google_id,
        res,
      );

      res.statusCode = 302;
      res.setHeader('Location', `${FRONTEND_URL}/home`);
      res.end();
      return;
    }

    const country = await getCountryFromIP(req);
    const newUser = await pool.query(
      `INSERT INTO users(google_id, email, full_name, country, is_verified) VALUES($1, $2, $3, $4, $5) ON CONFLICT(email) DO UPDATE SET google_id=EXCLUDED.google_id, is_verified = EXCLUDED.is_verified RETURNING user_id, email, full_name, google_id`,
      [profile.sub, profile.email, profile.name, country, true],
    );

    generateAuthCookie(
      newUser.rows[0].user_id,
      newUser.rows[0].email,
      newUser.rows[0].full_name,
      newUser.rows[0].google_id,
      res,
    );
    res.statusCode = 302;
    res.setHeader('Location', `${FRONTEND_URL}/home`);
    res.end();
  } catch (err) {
    console.error('[Google Callback]', err);
    if (mode === 'delete') {
      res.statusCode = 302;
      res.setHeader('Location', `${FRONTEND_URL}/profile`);
      res.end();
      return;
    } else {
      res.statusCode = 302;
      res.setHeader('Location', `${FRONTEND_URL}/signin`);
      res.end();
    }
  }
}
