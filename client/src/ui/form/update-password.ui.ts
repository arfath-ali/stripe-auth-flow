import { updatePasswordAPI } from '../../api/update-password.api.js';
import { navigate } from '../../router/navigate.js';
import { getElement } from '../../utils/dom.utils.js';
import { validatePassword } from '../../utils/validatePassword.js';

let updatePasswordAbortListener: AbortController | null = null;
export async function handleUpdatePassword() {
  updatePasswordAbortListener?.abort();
  updatePasswordAbortListener = new AbortController();

  const token = new URLSearchParams(window.location.search).get('token');
  if (!token) return;

  const updatePasswordSection = getElement<HTMLFormElement>(
    '.auth--update-password',
  );
  const newPasswordInput = getElement<HTMLInputElement>('#new-password');
  const newPasswordErrorField = getElement<HTMLElement>('#new-password-error');
  const newPasswordStrengthLabel = getElement<HTMLElement>(
    '.auth__label--new-password-strength',
  );

  const confirmPasswordInput =
    getElement<HTMLInputElement>('#confirm-password');
  const confirmPasswordErrorField = getElement<HTMLElement>(
    '#confirm-password-error',
  );
  const updatePasswordBtn = getElement<HTMLButtonElement>(
    '.auth__btn--update-password',
  );

  const updateBtnText =
    updatePasswordBtn.querySelector<HTMLSpanElement>('.auth__btn-text')!;
  const loadingSpinner = getElement<HTMLSpanElement>('.auth__spinner--update');

  let passwordDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  function isFormValid() {
    return (
      validatePassword(newPasswordInput.value) &&
      confirmPasswordInput.value === newPasswordInput.value
    );
  }

  function updateButtonState() {
    if (isFormValid()) {
      updatePasswordBtn.classList.add('auth__btn--active');
    } else {
      updatePasswordBtn.classList.remove('auth__btn--active');
    }
  }

  newPasswordInput.addEventListener('input', () => {
    if (passwordDebounceTimer) clearTimeout(passwordDebounceTimer);
    updateButtonState();

    if (!newPasswordInput.value) {
      newPasswordStrengthLabel.textContent = '';
      newPasswordStrengthLabel.classList.add('hidden');
      newPasswordStrengthLabel.classList.remove('error', 'success');
      newPasswordErrorField.classList.add('hidden');
      return;
    }

    passwordDebounceTimer = setTimeout(() => {
      newPasswordStrengthLabel.classList.remove('hidden');

      if (!validatePassword(newPasswordInput.value)) {
        newPasswordStrengthLabel.classList.remove('success');
        newPasswordStrengthLabel.textContent = 'weak';
        newPasswordStrengthLabel.classList.add('error');
        newPasswordErrorField.classList.remove('hidden');
      } else {
        newPasswordStrengthLabel.classList.remove('error');
        newPasswordStrengthLabel.textContent = 'strong';
        newPasswordStrengthLabel.classList.add('success');
        newPasswordErrorField.classList.add('hidden');
      }

      updateButtonState();
    }, 400);
  });

  newPasswordInput.addEventListener('blur', () => {
    if (passwordDebounceTimer) clearTimeout(passwordDebounceTimer);
  });

  confirmPasswordInput.addEventListener('input', () => {
    confirmPasswordErrorField.classList.add('hidden');
  });

  confirmPasswordInput.addEventListener('blur', () => {
    if (
      confirmPasswordInput.value &&
      confirmPasswordInput.value !== newPasswordInput.value
    ) {
      confirmPasswordErrorField.classList.remove('hidden');
      return;
    } else updateButtonState();
  });

  function setLoadingState(loading: boolean) {
    if (loading) {
      loadingSpinner.classList.remove('hidden');
      updateBtnText.classList.add('hidden');
      updatePasswordSection.setAttribute('inert', '');
    } else {
      loadingSpinner.classList.add('hidden');
      updateBtnText.classList.remove('hidden');
      updatePasswordSection.removeAttribute('inert');
    }
  }

  updatePasswordBtn.addEventListener(
    'click',
    async (e) => {
      e.preventDefault();
      if (!updatePasswordBtn.classList.contains('auth__btn--active')) return;

      updatePasswordBtn.classList.remove('auth__btn--active');
      setLoadingState(true);

      const response = await updatePasswordAPI(token, newPasswordInput.value);
      setLoadingState(false);

      if (!response.ok) {
        history.replaceState({}, '', '/reset?expired=true');
        navigate();
      } else {
        const data = await response.json();
        sessionStorage.setItem('email', data.email);
        history.replaceState({}, '', '/reset?status=success');
        delete (window as any).appUser;
        navigate();
      }
    },
    { signal: updatePasswordAbortListener.signal },
  );
}
