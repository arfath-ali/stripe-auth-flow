import { profileAPI } from '../../api/profile.api.js';
import { resetProfile } from '../../features/dashboard/profile-edit.js';
import { navigate } from '../../router/navigate.js';
import type { UpdateProfilePayload } from '../../types/profile.types.js';
import type { userData } from '../../types/user-data.types.ts';
import { getElement } from '../../utils/dom.utils.js';
import { validateEmail } from '../../utils/validateEmail.js';

let profileAbortListener: AbortController | null = null;

export function handleProfile(user: userData) {
  profileAbortListener?.abort();
  profileAbortListener = new AbortController();

  const profileSection = getElement<HTMLFormElement>('.dashboard--profile');
  const emailInput = getElement<HTMLInputElement>('#profile-email');
  const emailErrorField = getElement<HTMLElement>('#dashboard-error-email');
  const emailErrorText = emailErrorField.querySelector<HTMLElement>('p');

  const fullNameInput = getElement<HTMLInputElement>('#profile-full-name');
  const fullNameErrorField = getElement<HTMLElement>('#signup-error-fullname');

  const profileSaveBtn = getElement<HTMLButtonElement>('.dashboard__btn--save');
  const profileSaveBtnText = profileSaveBtn.querySelector<HTMLSpanElement>(
    '.dashboard__btn-text',
  )!;

  const loadingSpinner = getElement<HTMLElement>('.dashboard__spinner--save');

  if (!emailErrorText) return;

  fullNameInput.value = user.full_name;
  emailInput.value = user.email;

  function isEmailValid(): boolean {
    return validateEmail(emailInput.value);
  }

  function isProfileUpdated(): boolean {
    return (
      emailInput.value !== user.email || fullNameInput.value !== user.full_name
    );
  }

  function updateButtonState() {
    if (emailInput.value && fullNameInput.value && isProfileUpdated()) {
      profileSaveBtn.classList.add('dashboard__btn--active');
    } else {
      profileSaveBtn.classList.remove('dashboard__btn--active');
    }
  }

  emailInput.addEventListener('input', () => {
    emailErrorField.classList.add('hidden');
    emailErrorText.textContent = '';

    updateButtonState();
  });

  fullNameInput.addEventListener('input', () => {
    fullNameErrorField.classList.add('hidden');

    updateButtonState();
  });

  fullNameInput.addEventListener('blur', () => {
    if (fullNameInput.value.length > 128)
      fullNameErrorField.classList.remove('hidden');

    updateButtonState();
  });

  function setLoadingState(loading: boolean) {
    if (loading) {
      loadingSpinner.classList.remove('hidden');
      profileSaveBtnText.classList.add('hidden');
      profileSection.setAttribute('inert', '');
    } else {
      loadingSpinner.classList.add('hidden');
      profileSaveBtnText.classList.remove('hidden');
      profileSection.removeAttribute('inert');
    }
  }

  profileSaveBtn.addEventListener(
    'click',
    async (e) => {
      e.preventDefault();
      if (!profileSaveBtn.classList.contains('dashboard__btn--active')) return;

      const payload: UpdateProfilePayload = {};

      if (emailInput.value !== user.email) {
        payload.email = emailInput.value;
      }

      if (fullNameInput.value !== user.full_name) {
        payload.full_name = fullNameInput.value;
      }

      if (Object.keys(payload).length === 0) return;

      profileSaveBtn.classList.remove('dashboard__btn--active');
      setLoadingState(true);

      if (!isEmailValid()) {
        emailErrorField.classList.remove('hidden');
        emailErrorText.textContent = 'Invalid email address';
        setLoadingState(false);
        return;
      }

      const response = await profileAPI(payload);

      if (!response.ok) {
        const data = await response.json();
        emailErrorField.classList.remove('hidden');
        emailErrorText.textContent = data?.error;
      } else {
        navigate();
        resetProfile();
      }

      setLoadingState(false);
    },
    { signal: profileAbortListener.signal },
  );
}
