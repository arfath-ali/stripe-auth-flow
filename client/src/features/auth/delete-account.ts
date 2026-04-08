import { getElement, getElements } from '../../utils/dom.utils.js';
import { resetModalState } from './reset-modal.js';
import { type DeleteAccountModal } from '../../types/account-deletion.types.js';
import type { userData } from '../../types/user-data.types.js';

let deleteAccountController: AbortController | null = null;

const leaveStripeBtn = getElement<HTMLButtonElement>('.dashboard__btn--delete');

const dashboardModalOverlay = getElement<HTMLElement>(
  '.dashboard__modal-overlay',
);
const dashboardModal = getElement<HTMLElement>('.dashboard__modal');
const dashboardModalStep = getElement<HTMLElement>('.dashboard__modal-step');

const dashboardInputModal = getElement<HTMLInputElement>(
  '.dashboard__input--modal',
);

const dashboardDivider = getElement<HTMLElement>(
  '.dashboard__divider--modal-delete',
);
const googleAuthBtn = getElement<HTMLElement>(
  '.dashboard__btn--modal-verify-google',
);

const confirmDeleteBtn = getElement<HTMLButtonElement>(
  '.dashboard__btn--confirm-leave',
);

const cancelBtns = getElements<HTMLButtonElement>(
  '.dashboard__btn--modal-cancel',
);

let currentModalView: DeleteAccountModal | null = null;

export function initDeleteAccount(user: userData): void {
  deleteAccountController?.abort();
  deleteAccountController = new AbortController();

  if (user.google_id) {
    dashboardDivider.classList.remove('hidden');
    googleAuthBtn.classList.remove('hidden');
  } else {
    dashboardDivider.classList.add('hidden');
    googleAuthBtn.classList.add('hidden');
  }

  leaveStripeBtn.addEventListener(
    'click',
    () => {
      if (history.state?.view !== 'modal-flow') {
        history.pushState({ view: 'modal-flow' }, '', '');
      }
      setModalView('modal');
    },
    { signal: deleteAccountController?.signal },
  );

  confirmDeleteBtn.addEventListener(
    'click',
    () => {
      setModalView('modal-step');
    },
    { signal: deleteAccountController.signal },
  );

  cancelBtns.forEach((btn) => {
    btn.addEventListener(
      'click',
      () => {
        history.back();
      },
      { signal: deleteAccountController!.signal },
    );
  });

  window.addEventListener(
    'popstate',
    () => {
      if (history.state?.view === 'modal-flow') {
        setModalView('modal');
      } else {
        if (window.appUser) {
          window.location.replace('/signin');
          return;
        } else {
          resetDeleteModal();
          currentModalView = null;
        }
      }
    },
    { signal: deleteAccountController.signal },
  );
}

export function resetDeleteModal() {
  resetModalState(
    dashboardModalOverlay,
    dashboardModal,
    dashboardModalStep,
    dashboardInputModal,
  );
}

function setModalView(view: DeleteAccountModal) {
  currentModalView = view;

  dashboardModalOverlay.classList.remove('hidden');

  if (view === 'modal') {
    dashboardModal.classList.remove('hidden');
    dashboardModalStep.classList.add('hidden');
  } else if (view === 'modal-step') {
    dashboardModal.classList.add('hidden');
    dashboardModalStep.classList.remove('hidden');
  }
}
