import { getElements } from '../utils/dom.utils.js';

export function getAuthPasswordDOMElements(prefix: string) {
  return {
    passwordToggleBtns: getElements<HTMLButtonElement>(
      `.${prefix}__password-toggle`,
    ),
  };
}
