import { API__ENDPOINTS, BASE_URL } from '../constants/api.constants.js';

export function googleAuthAPI(mode: 'signin' | 'delete') {
  window.location.href = `${BASE_URL}/${API__ENDPOINTS.GOOGLE_AUTH}?mode=${mode}`;
}
