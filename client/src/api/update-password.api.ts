import { API__ENDPOINTS, BASE_URL } from '../constants/api.constants.js';

export async function updatePasswordAPI(
  token: string,
  password: string,
): Promise<any> {
  try {
    const response = await fetch(
      `${BASE_URL}/${API__ENDPOINTS.UPDATE_PASSWORD}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password }),
      },
    );
    return response;
  } catch (err) {
    console.error(err);
  }
}
