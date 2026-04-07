import { API__ENDPOINTS, BASE_URL } from '../constants/api.constants.js';

export async function verifyTokenAPI(token: string): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/${API__ENDPOINTS.VERIFY_RESET_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return response;
  } catch (err) {
    console.error(err);
  }
}
