import { BASE_URL, API__ENDPOINTS } from '../constants/api.constants.js';

export async function verifyAuthAPI(): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/${API__ENDPOINTS.AUTH}`, {
      method: 'GET',
      credentials: 'include',
    });

    return response;
  } catch (err) {
    console.error(err);
  }
}
