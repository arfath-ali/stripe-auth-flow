import { getElement, getElements } from '../../utils/dom.utils.js';

export function resetAuthState(): void {
  const authStatus = getElement<HTMLElement>('.auth__status-message');
  const authInputs = getElements<HTMLInputElement>('.auth__input');

  const authPasswordInputs = getElements<HTMLInputElement>(
    '.auth__input-password-wrapper .auth__input',
  );

  const authCheckboxInput = getElement<HTMLInputElement>(
    '.auth__input--checkbox',
  );

  const passwordToggleImgs = getElements<HTMLImageElement>(
    '.auth__password-toggle img',
  );

  const dropdownInput = getElement<HTMLInputElement>('.auth__input--dropdown');
  const dropdownFlag = getElement<HTMLImageElement>('.auth__dropdown-flag');
  const dropdownCountry = getElement<HTMLSpanElement>(
    '.auth__dropdown-country',
  );

  const authBtns = getElements<HTMLButtonElement>('.auth__btn');

  const authErrors = getElements<HTMLElement>('.auth__error');

  const passwordStrengthLabels = getElements<HTMLElement>(
    '.auth__label--password-strength',
  );

  const authErrorTexts = getElements<HTMLElement>('.auth__error p');

  authStatus.classList.add('hidden');

  authInputs.forEach((authInput) => {
    if (
      !authInput.classList.contains('auth__input--signup-google') &&
      !authInput.classList.contains('auth__input--dropdown')
    )
      authInput.value = '';
  });

  authPasswordInputs.forEach((authPasswordInput) => {
    authPasswordInput.type = 'password';
  });

  authCheckboxInput.checked = false;

  passwordToggleImgs.forEach((passwordToggleImg) => {
    passwordToggleImg.src = 'assets/images/hidepassword-icon.png';
  });

  authBtns.forEach((btn) => {
    btn.classList.remove('auth__btn--active');
  });

  authErrors.forEach((authError) => {
    authError.classList.add('hidden');
  });

  passwordStrengthLabels.forEach((label) => {
    label.textContent = '';
  });

  dropdownInput.value = 'us';

  dropdownFlag.src = 'https://flagcdn.com/us.svg';

  dropdownCountry.textContent = 'United States';

  authErrorTexts.forEach((authErrorText) => {
    if (
      authErrorText.closest('#signup-error-password') ||
      authErrorText.closest('#new-password-error') ||
      authErrorText.closest('#confirm-password-error') ||
      authErrorText.closest('.auth__error--reset-timeout')
    )
      return;

    authErrorText.textContent = '';
  });
}

export function revertResetPasswordUI() {
  const resetFormContainer = getElement<HTMLElement>(
    '.auth__reset-password-page',
  );
  const mailSentUI = getElement<HTMLElement>('.auth__mail-sent');
  const userEmail = getElement<HTMLElement>('.auth__email--reset-target');
  const authDescEmailSent = getElement<HTMLElement>(
    '.auth__description--email-sent',
  );
  const authDescResend = getElement<HTMLElement>('.auth__description--resend');

  mailSentUI.classList.add('hidden');
  userEmail.textContent = '';
  resetFormContainer.removeAttribute('inert');
  authDescEmailSent.classList.remove('hidden');
  authDescResend.classList.add('hidden');
}
