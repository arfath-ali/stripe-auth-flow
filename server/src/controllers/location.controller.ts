import type { IncomingMessage, ServerResponse } from 'node:http';
import 'dotenv/config';
import { getCountryFromIP } from '../utils/get-country.utils.js';

export async function locationController(
  req: IncomingMessage,
  res: ServerResponse,
) {
  try {
    const country = await getCountryFromIP(req);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ country }));
  } catch (err) {
    console.error('locationController error:', err);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ country: null }));
  }
}
