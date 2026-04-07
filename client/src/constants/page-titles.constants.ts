import { type AppState } from '../types/app-state.types.js';

export const DEFAULT_PAGE_TITLE = 'Stripe';

export const PAGE_TITLE_MAP: Partial<Record<AppState, string>> = {
  dashboard: 'Dashboard | Stripe',
  home: 'Home | Stripe',
  profile: 'Profile | Stripe',
  signin: 'Login | Stripe',
  signup: 'Sign Up | Stripe',
  reset: 'Reset | Stripe',
  'update-password': 'Reset | Stripe',
  'password-updated': 'Reset | Stripe',
  error: 'Page not found | Stripe',
} as const;
