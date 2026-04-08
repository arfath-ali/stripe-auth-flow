import { API__ENDPOINTS, BASE_URL } from '../constants/api.constants.js';

export async function resetPasswordAPI(email: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/${API__ENDPOINTS.RESET_PASSWORD}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    return;
  } catch (err) {
    console.error(err);
  }
}
