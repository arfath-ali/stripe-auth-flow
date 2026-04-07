import { API__ENDPOINTS, BASE_URL } from '../constants/api.constants.js';

export async function deleteAccountAPI(password: string): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/${API__ENDPOINTS.DELETE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });
    return response;
  } catch (err) {
    console.error(err);
  }
}
