import { signinAPI } from '../../api/signin.api.js';
import { navigate } from '../../router/navigate.js';
import { setPendingVerificationEmail } from '../../state/app.state.js';
import { getElement } from '../../utils/dom.utils.js';
import { validateEmail } from '../../utils/validateEmail.js';
import { handleOTPVerification } from './verify-otp.ui.js';

let signinAbortListener: AbortController | null = null;

export async function handleSignin() {
  signinAbortListener?.abort();
  signinAbortListener = new AbortController();

  const message = new URLSearchParams(window.location.search).get('message');

  const statusMessage = getElement<HTMLElement>('.auth__status-message');
  const statusText = getElement<HTMLElement>('.auth__status-text');
  const signinSection = getElement<HTMLFormElement>('.auth--signin');
  const emailInput = getElement<HTMLInputElement>('#signin-email');
  const passwordInput = getElement<HTMLInputElement>('#signin-password');
  const signinErrorField = getElement<HTMLElement>('#signin-error');
  const signinErrorText = signinErrorField.querySelector<HTMLElement>('p');
  const signinBtn = getElement<HTMLButtonElement>('.auth__btn--signin');
  const signinBtnText =
    signinBtn.querySelector<HTMLSpanElement>('.auth__btn-text')!;
  const loadingSpinner = getElement<HTMLSpanElement>('.auth__spinner--signin');

  if (!signinErrorText) return;

  if (message) {
    let text = '';
    if (message === 'signout') {
      text = 'You have been successfully signed out.';
    } else if (message === 'deleted') {
      text = 'Your account has been permanently deleted.';
    }

    if (text) {
      statusText.textContent = text;
      statusMessage.classList.remove('hidden');

      history.replaceState({}, '', window.location.pathname);

      requestAnimationFrame(() => {
        statusMessage.classList.add('visible');
      });
      setTimeout(() => {
        statusMessage.classList.remove('visible');

        setTimeout(() => {
          statusMessage.classList.add('hidden');
          navigate();
        }, 500);
      }, 5000);
    }
  }

  function isEmailValid(): boolean {
    return validateEmail(emailInput.value);
  }

  function updateButtonState() {
    if (emailInput.value && passwordInput.value) {
      signinBtn.classList.add('auth__btn--active');
    } else {
      signinBtn.classList.remove('auth__btn--active');
    }
  }

  emailInput.addEventListener('input', () => {
    signinErrorField.classList.add('hidden');
    signinErrorText.textContent = '';
    updateButtonState();
  });

  passwordInput.addEventListener('input', () => {
    signinErrorField.classList.add('hidden');
    signinErrorText.textContent = '';
    updateButtonState();
  });

  function setLoadingState(loading: boolean) {
    if (loading) {
      loadingSpinner.classList.remove('hidden');
      signinBtnText.classList.add('hidden');
      signinSection.setAttribute('inert', '');
    } else {
      loadingSpinner.classList.add('hidden');
      signinBtnText.classList.remove('hidden');
      signinSection.removeAttribute('inert');
    }
  }

  signinBtn.addEventListener(
    'click',
    async (e) => {
      e.preventDefault();

      if (!signinBtn.classList.contains('auth__btn--active')) return;

      signinBtn.classList.remove('auth__btn--active');
      setLoadingState(true);

      if (!isEmailValid()) {
        signinErrorField.classList.remove('hidden');
        signinErrorText.textContent = 'Invalid email address';
        setLoadingState(false);
        return;
      }

      const response = await signinAPI(emailInput.value, passwordInput.value);

      if (!response.ok) {
        const data = await response.json();
        if (data.action === 'VERIFY_REQUIRED') {
          setPendingVerificationEmail(emailInput.value);
          history.pushState({}, '', '/verify');
          handleOTPVerification(emailInput.value);
          navigate();
        } else {
          signinErrorField.classList.remove('hidden');
          signinErrorText.textContent = data?.error;
        }
      } else {
        history.replaceState({}, '', '/home');
        navigate();
      }

      setLoadingState(false);
    },
    { signal: signinAbortListener.signal },
  );
}
