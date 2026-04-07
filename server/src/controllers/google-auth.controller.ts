import type { IncomingMessage, ServerResponse } from 'node:http';
import 'dotenv/config';

export function googleAuthController(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } = process.env;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
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

    res.writeHead(302, {
      Location: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    });
    res.end();
  } catch (err) {
    console.error('googleAuthController error:', err);
    res.statusCode = 500;
    res.end();
  }
}
