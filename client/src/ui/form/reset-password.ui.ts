import { resetPasswordAPI } from '../../api/reset-password.api.js';
import { revertResetPasswordUI } from '../../features/auth/reset-auth.js';
import { getElement, getElements } from '../../utils/dom.utils.js';
import { validateEmail } from '../../utils/validateEmail.js';

let resetPasswordAbortListener: AbortController | null = null;

export async function handleResetPassword() {
  resetPasswordAbortListener?.abort();
  resetPasswordAbortListener = new AbortController();

  const mode = new URLSearchParams(window.location.search).get('mode');
  const isResetLinkExpired = new URLSearchParams(window.location.search).get(
    'expired',
  );
  let hasToken = sessionStorage.getItem('isTokenGenerated');

  const resetFormContainer = getElement<HTMLElement>(
    '.auth__reset-password-page',
  );
  const resetPasswordSection = getElement<HTMLFormElement>(
    '.auth--reset-password',
  );
  const resetPasswordHeading = getElement<HTMLHeadingElement>(
    '.auth__heading--reset-password',
  );
  const resetPasswordDesc = getElement<HTMLElement>(
    '.auth__description--reset-password',
  );
  const resetEmailInput = getElement<HTMLInputElement>('#reset-email');
  const resetError = getElement<HTMLElement>('#reset-error');
  const resetErrorText = getElement<HTMLElement>('#reset-error-text');
  const resetBtn = getElement<HTMLButtonElement>('.auth__btn--reset');
  const resetBtnText =
    resetBtn.querySelector<HTMLSpanElement>('.auth__btn-text')!;
  const loadingSpinner = getElement<HTMLSpanElement>('.auth__spinner--reset');
  const mailSentUI = getElement<HTMLElement>('.auth__mail-sent');
  const userEmail = getElement<HTMLElement>('.auth__email--reset-target');
  const authLinkWrapper = getElement<HTMLElement>(
    '.auth__link-wrapper--reset-password',
  );
  const authFooterReset = getElement<HTMLElement>(
    '.auth__footer--reset-password',
  );
  const authDescModeReset = getElement<HTMLElement>(
    '.auth__description-wrapper-mode-reset',
  );
  const authDescModeChange = getElement<HTMLElement>(
    '.auth__description-wrapper-mode-change',
  );
  const authDescEmailSent = getElements<HTMLElement>(
    '.auth__description--email-sent',
  );

  const gmailBtn = getElement<HTMLElement>('.auth__btn--gmail');
  const gmailBtnText = getElement<HTMLAnchorElement>('.auth__btn-gmail-text');
  const loadingSpinnerResend = getElement<HTMLSpanElement>(
    '.auth__spinner--resend',
  );
  const authDescResend = getElements<HTMLElement>('.auth__description--resend');
  const resendEmailLinks = getElements<HTMLAnchorElement>(
    '.auth__link--resend',
  );
  const altEmailLinks = getElements<HTMLAnchorElement>(
    '.auth__link--alt-email',
  );
  const authLinkWrapperMailSent = getElement<HTMLElement>(
    '.auth__link-wrapper--mail-sent',
  );
  const resetTimeout = getElement<HTMLElement>('.auth__error--reset-timeout');

  if (mode === 'reset') {
    resetPasswordHeading.textContent = 'Reset your password';
    resetPasswordDesc.textContent =
      'Enter your email and we’ll send you a link to reset your password.';
    authLinkWrapper.classList.remove('hidden');
    authFooterReset.classList.remove('hidden');
    authLinkWrapperMailSent.classList.remove('hidden');
    authDescModeReset.classList.remove('hidden');
    authDescModeChange.classList.add('hidden');
  } else {
    resetPasswordHeading.textContent = 'Change your password';
    resetPasswordDesc.textContent =
      'Enter your email to receive a link to update your password.';
    authLinkWrapper.classList.add('hidden');
    authFooterReset.classList.add('hidden');
    authLinkWrapperMailSent.classList.add('hidden');
    authDescModeReset.classList.add('hidden');
    authDescModeChange.classList.remove('hidden');
  }

  if (isResetLinkExpired && hasToken) {
    resetTimeout.classList.remove('hidden');
    sessionStorage.removeItem('isTokenGenerated');
  }

  function isEmailValid() {
    return validateEmail(resetEmailInput.value);
  }

  function updateButtonState() {
    if (resetEmailInput.value) {
      resetBtn.classList.add('auth__btn--active');
    } else {
      resetBtn.classList.remove('auth__btn--active');
    }
  }

  function setLoadingState(loading: boolean) {
    if (loading) {
      loadingSpinner.classList.remove('hidden');
      resetBtnText.classList.add('hidden');
      resetPasswordSection.setAttribute('inert', '');
    } else {
      loadingSpinner.classList.add('hidden');
      resetBtnText.classList.remove('hidden');
      resetPasswordSection.removeAttribute('inert');
    }
  }

  function setLoadingStateResend(loading: boolean) {
    if (loading) {
      loadingSpinnerResend.classList.remove('hidden');
      gmailBtn.classList.add('inactive');
      gmailBtnText.classList.add('hidden');
      mailSentUI.setAttribute('inert', '');
    } else {
      loadingSpinnerResend.classList.add('hidden');
      gmailBtn.classList.remove('inactive');
      gmailBtnText.classList.remove('hidden');
      mailSentUI.removeAttribute('inert');
    }
  }

  resetEmailInput.addEventListener('input', () => {
    resetError.classList.add('hidden');
    resetErrorText.textContent = '';
    updateButtonState();
  });

  resetBtn.addEventListener(
    'click',
    async (e) => {
      e.preventDefault();
      if (!resetBtn.classList.contains('auth__btn--active')) return;

      resetBtn.classList.remove('auth__btn--active');
      setLoadingState(true);

      if (!isEmailValid()) {
        resetError.classList.remove('hidden');
        resetErrorText.textContent = 'Invalid email address';
        setLoadingState(false);
        return;
      }

      await resetPasswordAPI(resetEmailInput.value);
      setLoadingState(false);

      history.replaceState({}, '', `/reset?mode=${mode}`);

      resetTimeout.classList.add('hidden');
      mailSentUI.classList.remove('hidden');
      userEmail.textContent = resetEmailInput.value;
      resetFormContainer.setAttribute('inert', '');
    },
    { signal: resetPasswordAbortListener.signal },
  );

  resendEmailLinks.forEach((resendLink) => {
    resendLink.addEventListener(
      'click',
      async (e) => {
        e.preventDefault();
        setLoadingStateResend(true);
        await resetPasswordAPI(resetEmailInput.value);
        authDescEmailSent.forEach((el) => el.classList.add('hidden'));
        authDescResend.forEach((el) => el.classList.remove('hidden'));
        setLoadingStateResend(false);
      },
      {
        signal: resetPasswordAbortListener!.signal,
      },
    );
  });

  altEmailLinks.forEach((link) => {
    link.addEventListener(
      'click',
      () => {
        revertResetPasswordUI();
      },
      { signal: resetPasswordAbortListener!.signal },
    );
  });
}
