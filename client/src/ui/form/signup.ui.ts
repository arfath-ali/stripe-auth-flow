import { getUserLocation } from '../../api/location.api.js';
import { signupAPI } from '../../api/signup.api.js';
import { navigate } from '../../router/navigate.js';
import { setPendingVerificationEmail } from '../../state/app.state.js';
import { getElement } from '../../utils/dom.utils.js';
import { validateEmail } from '../../utils/validateEmail.js';
import { validatePassword } from '../../utils/validatePassword.js';
import { handleOTPVerification } from './verify-otp.ui.js';

let signupAbortListener: AbortController | null = null;

export async function handleSignUp() {
  signupAbortListener?.abort();
  signupAbortListener = new AbortController();

  const signupSection = getElement<HTMLFormElement>('.auth--signup');

  const emailInput = getElement<HTMLInputElement>('#signup-email');
  const emailErrorField = getElement<HTMLElement>('#signup-error-email');
  const emailErrorText = emailErrorField.querySelector<HTMLElement>('p');

  const fullNameInput = getElement<HTMLInputElement>('#signup-fullname');
  const fullNameErrorField = getElement<HTMLElement>('#signup-error-fullname');

  const passwordInput = getElement<HTMLInputElement>('#signup-password');
  const passwordErrorField = getElement<HTMLElement>('#signup-error-password');
  const passwordStrengthLabel = getElement<HTMLElement>(
    '.auth__label--password-strength',
  );
  let passwordDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  const countrySelected = getElement<HTMLSpanElement>(
    '.auth__dropdown-country',
  );

  const signupBtn = getElement<HTMLButtonElement>('.auth__btn--signup');
  const signupBtnText =
    signupBtn.querySelector<HTMLSpanElement>('.auth__btn-text')!;
  const loadingSpinner = getElement<HTMLSpanElement>('.auth__spinner--signup');

  if (!emailErrorText) return;

  const detectedCountry = await getUserLocation();

  const country = detectedCountry || countrySelected.textContent;

  function isFormValid() {
    return (
      validateEmail(emailInput.value) &&
      fullNameInput.value.length > 0 &&
      fullNameInput.value.length <= 128 &&
      validatePassword(passwordInput.value) &&
      country
    );
  }

  function updateButtonState() {
    if (isFormValid()) {
      signupBtn.classList.add('auth__btn--active');
    } else {
      signupBtn.classList.remove('auth__btn--active');
    }
  }

  emailInput.addEventListener('input', () => {
    emailErrorField.classList.add('hidden');
    emailErrorText.textContent = '';
    updateButtonState();
  });

  emailInput.addEventListener('blur', () => {
    if (!emailInput.value) {
      emailErrorField.classList.add('hidden');
      return;
    }

    if (!validateEmail(emailInput.value)) {
      emailErrorText.textContent = 'Please enter a valid email.';
      emailErrorField.classList.remove('hidden');
    }
  });

  fullNameInput.addEventListener('input', () => {
    fullNameErrorField.classList.add('hidden');
  });

  fullNameInput.addEventListener('blur', () => {
    if (fullNameInput.value.length > 128)
      fullNameErrorField.classList.remove('hidden');
  });

  passwordInput.addEventListener('input', () => {
    if (passwordDebounceTimer) clearTimeout(passwordDebounceTimer);
    updateButtonState();

    if (!passwordInput.value) {
      passwordStrengthLabel.textContent = '';
      passwordStrengthLabel.classList.add('hidden');
      passwordStrengthLabel.classList.remove('error', 'success');
      passwordErrorField.classList.add('hidden');
      return;
    }

    passwordDebounceTimer = setTimeout(() => {
      passwordStrengthLabel.classList.remove('hidden');

      if (!validatePassword(passwordInput.value)) {
        passwordStrengthLabel.classList.remove('success');
        passwordStrengthLabel.textContent = 'weak';
        passwordStrengthLabel.classList.add('error');
        passwordErrorField.classList.remove('hidden');
      } else {
        passwordStrengthLabel.classList.remove('error');
        passwordStrengthLabel.textContent = 'strong';
        passwordStrengthLabel.classList.add('success');
        passwordErrorField.classList.add('hidden');
      }
      updateButtonState();
    }, 400);
  });

  passwordInput.addEventListener('blur', () => {
    if (passwordDebounceTimer) clearTimeout(passwordDebounceTimer);
  });

  function setLoadingState(loading: boolean) {
    if (loading) {
      loadingSpinner.classList.remove('hidden');
      signupBtnText.classList.add('hidden');
      signupSection.setAttribute('inert', '');
    } else {
      loadingSpinner.classList.add('hidden');
      signupBtnText.classList.remove('hidden');
      signupSection.removeAttribute('inert');
    }
  }

  signupBtn.addEventListener(
    'click',
    async (e) => {
      e.preventDefault();

      if (!signupBtn.classList.contains('auth__btn--active')) return;

      signupBtn.classList.remove('auth__btn--active');
      setLoadingState(true);

      const response = await signupAPI(
        emailInput.value,
        fullNameInput.value,
        passwordInput.value,
        country,
      );

      if (!response.ok) {
        const data = await response.json();
        emailErrorText.textContent = data.error;
        emailErrorField.classList.remove('hidden');
      } else {
        setPendingVerificationEmail(emailInput.value);
        history.pushState({}, '', '/verify');
        handleOTPVerification(emailInput.value);
        navigate();
      }

      setLoadingState(false);
    },
    { signal: signupAbortListener.signal },
  );
}
