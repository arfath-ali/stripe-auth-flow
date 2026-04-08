import type { ServerResponse } from 'node:http';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export function generateAuthCookie(
  userId: string,
  userEmail: string,
  fullName: string,
  googleId: string,
  res: ServerResponse,
) {
  try {
    const jwtSecretKey = process.env.JWT_SECRET;

    if (!jwtSecretKey) {
      res.statusCode = 500;
      res.end();
      return;
    }

    const jsonwebtoken = jwt.sign(
      {
        user_id: userId,
        email: userEmail,
        full_name: fullName,
        google_id: googleId,
      },
      jwtSecretKey,
      {
        expiresIn: '1h',
      },
    );

    res.setHeader('Set-Cookie', [
      `token=${jsonwebtoken}; HttpOnly; Path=/; Max-Age=3600; SameSite=None; Secure`,
    ]);
  } catch (err) {
    console.error('generateAuthCookie error:', err);
  }
}
