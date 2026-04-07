import type { IncomingMessage } from 'node:http';

export async function getCountryFromIP(
  req: IncomingMessage,
): Promise<string | null> {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    const rawIP = Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded?.split(',')[0] || req.socket.remoteAddress;

    const userIP = rawIP?.replace(/^::ffff:/, '');

    if (!userIP || userIP === '::1' || userIP === '127.0.0.1') {
      return 'India';
    }

    const response = await fetch(
      `https://api.ipinfo.io/lite/${userIP}?token=${process.env.IPINFO_TOKEN}`,
    );
    const data = (await response.json()) as { country: string };
    return data.country ?? null;
  } catch (err) {
    console.error('getCountryFromIP error:', err);
    return null;
  }
}
