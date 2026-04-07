import { API__ENDPOINTS, BASE_URL } from '../constants/api.constants.js';
import type { UpdateProfilePayload } from '../types/profile.types.js';

export async function profileAPI(
  profilePayload: UpdateProfilePayload,
): Promise<any> {
  try {
    const response = await fetch(`${BASE_URL}/${API__ENDPOINTS.PROFILE}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(profilePayload),
    });
    return response;
  } catch (err) {
    console.log(err);
  }
}
