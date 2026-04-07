import { getElement } from '../../utils/dom.utils.js';

export function resetModalState(
  dashboardModalOverlay: HTMLElement,
  dashboardModal: HTMLElement,
  dashboardModalStep: HTMLElement,
  dashboardInputModal: HTMLInputElement,
) {
  const deleteModalError = getElement<HTMLElement>(
    '.dashboard__error--delete-modal',
  );
  const deleteModalErrorGoogle = getElement<HTMLElement>(
    '.dashboard__error--delete-modal-google',
  );

  dashboardModalOverlay.classList.add('hidden');
  dashboardModal.classList.add('hidden');
  dashboardModalStep.classList.add('hidden');
  dashboardInputModal.value = '';
  deleteModalError.classList.add('hidden');
  deleteModalErrorGoogle.classList.add('hidden');
}
