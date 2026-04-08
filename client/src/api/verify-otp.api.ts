import { API__ENDPOINTS, BASE_URL } from '../constants/api.constants.js';

export async function otpVerificationAPI(
  email: string,
  otp: string,
): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/${API__ENDPOINTS.VERIFY_OTP}`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ email, otp }),
    });
    return response;
  } catch (err) {
    console.error(err);
  }
}
