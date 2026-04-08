import { BASE_URL, API__ENDPOINTS } from '../constants/api.constants.js';

export async function signupAPI(
  email: string,
  full_name: string,
  password: string,
  country: string,
): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/${API__ENDPOINTS.SIGNUP}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, full_name, password, country }),
    });

    return response;
  } catch (err) {
    console.log(err);
  }
}
