import { googleAuthAPI } from '../../api/google-auth.api.js';
import { resetDeleteModal } from '../../features/auth/delete-account.js';
import { getElements } from '../../utils/dom.utils.js';

let googleAbortListener: AbortController | null = null;

export async function handleGoogleAuth() {
  googleAbortListener?.abort();
  googleAbortListener = new AbortController();

  const googleBtns = getElements<HTMLButtonElement>('.btn-google');

  googleBtns.forEach((googleBtn) => {
    googleBtn.addEventListener(
      'click',
      () => {
        if (
          googleBtn.classList.contains('dashboard__btn--modal-verify-google')
        ) {
          googleAuthAPI('delete');
          resetDeleteModal();
        } else googleAuthAPI('signin');
      },
      {
        signal: googleAbortListener!.signal,
      },
    );
  });
}
