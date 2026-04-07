import { type AppState } from '../types/app-state.types.js';
import { getElement } from '../utils/dom.utils.js';
import syncPageTitle from '../utils/metadata.utils.js';

export let pendingVerificationEmail: string | null = null;

export function setPendingVerificationEmail(email: string | null) {
  pendingVerificationEmail = email;
}

export function setAppState(state: AppState): void {
  const body = getElement<HTMLInputElement>('.site-body');

  body.dataset.state = state;

  syncPageTitle(state);
}
