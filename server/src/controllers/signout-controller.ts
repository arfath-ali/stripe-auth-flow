import type { IncomingMessage, ServerResponse } from 'node:http';
import { getUserFromToken } from '../utils/auth.utils.js';

export async function signOutController(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    res.setHeader(
      'Set-Cookie',
      'token=; Max-Age=0; HttpOnly; Path=/; SameSite=None; Secure',
    );
    res.statusCode = 200;
    res.end();
  } catch (err) {
    console.error('deleteAccountController error:', err);
    res.statusCode = 500;
    res.end();
  }
}
