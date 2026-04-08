import type { IncomingMessage, ServerResponse } from 'node:http';
import 'dotenv/config';

export function googleAuthController(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } = process.env;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Google OAuth not configured' }));
      return;
    }

    const url = new URL(req.url ?? '', 'http://localhost');
    const mode = url.searchParams.get('mode') ?? 'signin';

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state: mode,
    });

    const authURL = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

    res.statusCode = 302;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(authURL));
  } catch (err) {
    console.error('googleAuthController error:', err);
    res.statusCode = 500;
    res.end();
  }
}
