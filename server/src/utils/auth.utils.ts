import type { IncomingMessage } from 'node:http';
import jwt from 'jsonwebtoken';

type JwtPayload = {
  user_id: string;
  email: string;
  full_name: string;
};

export function getUserFromToken(req: IncomingMessage) {
  const cookie = req.headers.cookie || '';

  const token = cookie
    .split('; ')
    .find((row) => row.startsWith('token='))
    ?.split('=')[1];

  if (!token) return null;

  try {
    const jwtSecretKey = process.env.JWT_SECRET;
    if (!jwtSecretKey) return null;

    return jwt.verify(token, jwtSecretKey) as JwtPayload;
  } catch {
    return null;
  }
}
