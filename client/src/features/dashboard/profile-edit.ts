import { getElement, getElements } from '../../utils/dom.utils.js';
import { resetProfileState } from './reset-profile.js';

let ProfileEditListenerController: AbortController | null = null;

const profileEditBtn = getElement<HTMLButtonElement>('.dashboard__btn--edit');
const profileChangePasswordBtn = getElement<HTMLAnchorElement>(
  '.dashboard__btn--change-password',
);

const fullNameInput = getElement<HTMLInputElement>('#profile-full-name');
const emailInput = getElement<HTMLInputElement>('#profile-email');

const profileFormActionBtns = getElement<HTMLElement>(
  '.dashboard__form-actions',
);

const profileCancelBtn = getElement<HTMLButtonElement>(
  '.dashboard__btn--cancel',
);

const profileDeleteBtn = getElement<HTMLButtonElement>(
  '.dashboard__btn--delete',
);

export function initProfileEdit() {
  ProfileEditListenerController?.abort();
  ProfileEditListenerController = new AbortController();

  profileEditBtn.addEventListener(
    'click',
    () => {
      profileEditBtn.classList.add('hidden');
      profileChangePasswordBtn.classList.add('hidden');
      profileDeleteBtn.classList.add('hidden');

      fullNameInput.classList.remove('dashboard__input--readonly');
      fullNameInput.removeAttribute('tabIndex');
      fullNameInput?.focus();

      profileFormActionBtns.classList.remove('hidden');
    },
    { signal: ProfileEditListenerController.signal },
  );

  fullNameInput.addEventListener(
    'focus',
    () => {
      fullNameInput.setSelectionRange(
        fullNameInput.value.length,
        fullNameInput.value.length,
      );
    },
    { signal: ProfileEditListenerController!.signal },
  );

  profileCancelBtn.addEventListener('click', resetProfile, {
    signal: ProfileEditListenerController.signal,
  });
}

export function resetProfile() {
  resetProfileState(
    profileEditBtn,
    profileChangePasswordBtn,
    profileDeleteBtn,
    emailInput,
    fullNameInput,
    profileFormActionBtns,
  );
}
