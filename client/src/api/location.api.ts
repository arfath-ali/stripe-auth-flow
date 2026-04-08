import { API__ENDPOINTS, BASE_URL } from '../constants/api.constants.js';

export async function getUserLocation(): Promise<string> {
  const res = await fetch(`${BASE_URL}/${API__ENDPOINTS.LOCATION}`, {
    method: 'GET',
    credentials: 'include',
  });
  const data = await res.json();
  return data.country;
}
