export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API__ENDPOINTS = {
  COUNTRIES: 'data/countries.json',
  GOOGLE_AUTH: 'api/auth/google',
  SIGNIN: 'api/signin',
  RESET_PASSWORD: 'api/reset',
  VERIFY_RESET_TOKEN: 'api/verify-reset-token',
  UPDATE_PASSWORD: 'api/update',
  SIGNUP: 'api/signup',
  RESEND_OTP: 'api/resend-otp',
  VERIFY_OTP: 'api/verify-otp',
  LOCATION: 'api/location',
  AUTH: 'api/auth/status',
  PROFILE: 'api/profile',
  SIGNOUT: 'api/signout',
  DELETE: 'api/delete',
} as const;
