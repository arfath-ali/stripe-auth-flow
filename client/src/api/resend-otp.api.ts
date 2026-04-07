import { API__ENDPOINTS, BASE_URL } from '../constants/api.constants.js';

export async function resendOTPAPI(email: string): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/${API__ENDPOINTS.RESEND_OTP}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    return response;
  } catch (err) {
    console.error(err);
  }
}
