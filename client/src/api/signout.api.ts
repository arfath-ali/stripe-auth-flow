import { API__ENDPOINTS, BASE_URL } from '../constants/api.constants.js';

export async function signOutAPI(): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/${API__ENDPOINTS.SIGNOUT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    return response;
  } catch (err) {
    console.error(err);
  }
}
