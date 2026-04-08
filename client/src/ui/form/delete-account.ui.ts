import { deleteAccountAPI } from '../../api/delete-account.api.js';
import { getElement } from '../../utils/dom.utils.js';
import { resetDeleteModal } from '../../features/auth/delete-account.js';

let deleteAccAbortListener: AbortController | null = null;

export function handleDeleteAccount() {
  deleteAccAbortListener?.abort();
  deleteAccAbortListener = new AbortController();

  const overlay = getElement<HTMLElement>('#page-overlay');
  const dashboardModalSection = getElement<HTMLFormElement>(
    '.dashboard__modal-step',
  );
  const passwordInput = getElement<HTMLInputElement>(
    `.dashboard__input--modal`,
  );
  const passwordErrorField = getElement<HTMLElement>(
    '#dashboard-modal-error-password',
  );
  const deleteAccountBtn = getElement<HTMLButtonElement>(
    '.dashboard__btn--modal-delete',
  );
  const deleteAccountBtnText = deleteAccountBtn.querySelector<HTMLSpanElement>(
    '.dashboard__btn-text',
  )!;

  const loadingSpinner = getElement<HTMLElement>('.dashboard__spinner--delete');

  function updateButtonState() {
    if (passwordInput.value) {
      deleteAccountBtn.classList.add('dashboard__btn--modal-delete-active');
    } else {
      deleteAccountBtn.classList.remove('dashboard__btn--modal-delete-active');
    }
  }

  passwordInput.addEventListener('input', () => {
    passwordErrorField.classList.add('hidden');
    updateButtonState();
  });

  function setLoadingState(loading: boolean) {
    if (loading) {
      loadingSpinner.classList.remove('hidden');
      deleteAccountBtnText.classList.add('hidden');
      dashboardModalSection.setAttribute('inert', '');
    } else {
      loadingSpinner.classList.add('hidden');
      deleteAccountBtnText.classList.remove('hidden');
      dashboardModalSection.removeAttribute('inert');
    }
  }

  deleteAccountBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (
      !deleteAccountBtn.classList.contains(
        'dashboard__btn--modal-delete-active',
      )
    )
      return;

    deleteAccountBtn.classList.remove('dashboard__btn--modal-delete-active');
    setLoadingState(true);
    overlay.classList.add('active');

    const response = await deleteAccountAPI(passwordInput.value);

    if (!response.ok) {
      passwordErrorField.classList.remove('hidden');
      setLoadingState(false);
      overlay.classList.remove('active');
    } else {
      delete (window as any).appUser;
      sessionStorage.clear();
      resetDeleteModal();
      overlay.classList.remove('active');
      setTimeout(() => {
        setLoadingState(false);
        window.location.replace('/signin?message=deleted');
      }, 600);
    }
  });
}
