import { getElement } from '../../utils/dom.utils.js';

export function handlePasswordUpdated(email: string) {
  const userEmail = getElement<HTMLElement>('.auth__email--account-confirmed');

  userEmail.textContent = email;

  sessionStorage.removeItem('email');
}
