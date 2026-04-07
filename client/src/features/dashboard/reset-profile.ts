export function resetProfileState(
  profileEditBtn: HTMLButtonElement,
  profileChangePasswordBtn: HTMLAnchorElement,
  profileDeleteBtn: HTMLButtonElement,
  emailInput: HTMLInputElement,
  fullNameInput: HTMLInputElement,
  profileFormActionBtns: HTMLElement,
) {
  profileFormActionBtns.classList.add('hidden');

  emailInput.value = window.appUser!?.email;
  fullNameInput.value = window.appUser!?.full_name;

  fullNameInput.classList.add('dashboard__input--readonly');
  fullNameInput.setAttribute('tabIndex', '-1');

  profileDeleteBtn.classList.remove('hidden');
  profileChangePasswordBtn.classList.remove('hidden');
  profileEditBtn.classList.remove('hidden');
}
