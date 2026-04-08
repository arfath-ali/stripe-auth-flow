import { API__ENDPOINTS, BASE_URL } from '../constants/api.constants.js';

export async function googleAuthAPI(mode: 'signin' | 'delete') {
  const res = await fetch(
    `${BASE_URL}/${API__ENDPOINTS.GOOGLE_AUTH}?mode=${mode}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );
  const url = await res.json();
  window.location.href = url;
}
