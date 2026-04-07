import { signOutAPI } from '../../api/signout.api.js';
import { getElement } from '../../utils/dom.utils.js';

let signOutAbortListener: AbortController | null = null;
export function handleSignOut() {
  signOutAbortListener?.abort();
  signOutAbortListener = new AbortController();

  const signOutBtn = getElement<HTMLButtonElement>('.site-header__signout-btn');
  const loadingSpinner = getElement<HTMLElement>(
    '.site-header__spinner--signout',
  );
  const overlay = getElement<HTMLElement>('#page-overlay');

  function setLoadingState(loading: boolean) {
    if (loading) {
      loadingSpinner.classList.remove('hidden');
      signOutBtn.classList.add('site-header__signout-btn--inactive');
    } else {
      loadingSpinner.classList.add('hidden');
      signOutBtn.classList.remove('site-header__signout-btn--inactive');
    }
  }

  signOutBtn.addEventListener(
    'click',
    async (e) => {
      e.preventDefault();

      setLoadingState(true);
      overlay.classList.add('active');

      const res = await signOutAPI();
      if (!res.ok) {
        console.error('Logout failed');

        setLoadingState(false);
        return;
      }
      delete (window as any).appUser;

      setTimeout(() => {
        window.location.replace('/signin?message=signout');
        setLoadingState(false);
      }, 600);
    },
    { signal: signOutAbortListener.signal },
  );
}
