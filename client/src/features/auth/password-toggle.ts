import type { PrefixType } from '../../types/prefix.types.js';
import { getAuthPasswordDOMElements } from '../../dom/password.dom.js';

let PasswordToggleListenerController: AbortController | null = null;

export function initPasswordToggle(prefix: PrefixType) {
  PasswordToggleListenerController?.abort();
  PasswordToggleListenerController = new AbortController();

  const passwordDomElements = getAuthPasswordDOMElements(prefix);

  passwordDomElements.passwordToggleBtns.forEach((passwordToggleBtn) => {
    passwordToggleBtn.addEventListener(
      'click',
      (e) => {
        e.stopPropagation();
        const passwordInputWrapper = passwordToggleBtn.closest(
          `.${prefix}__input-password-wrapper`,
        );
        const passwordInput = passwordInputWrapper?.querySelector(
          `.${prefix}__input`,
        ) as HTMLInputElement | null;
        const passwordToggleImg = passwordInputWrapper?.querySelector(
          'img',
        ) as HTMLImageElement | null;

        if (!passwordInput || !passwordToggleImg) return;

        const passwordToggleIconPath = passwordToggleImg.getAttribute('src');

        const isHidden = passwordToggleIconPath?.includes('hidepassword');

        const passwordToggleIcon = isHidden ? 'showpassword' : 'hidepassword';
        const passwordType = isHidden ? 'text' : 'password';

        passwordToggleImg.src = `assets/images/${passwordToggleIcon}-icon.png`;
        passwordInput.type = passwordType;
      },
      { signal: PasswordToggleListenerController!.signal },
    );
  });
}
