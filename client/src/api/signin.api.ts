import { API__ENDPOINTS, BASE_URL } from '../constants/api.constants.js';

export async function signinAPI(email: string, password: string): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/${API__ENDPOINTS.SIGNIN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    return response;
  } catch (err) {
    console.error(err);
  }
}
