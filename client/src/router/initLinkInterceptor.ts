import { navigate } from './navigate.js';

let navigationController: AbortController | null = null;

export function initLinkInterceptor() {
  navigationController?.abort();
  navigationController = new AbortController();

  document.addEventListener(
    'click',
    (e) => {
      const link = (e.target as HTMLElement)?.closest('a');
      if (!link) return;

      if (link.target === '_blank' || !link.href.startsWith(location.origin))
        return;

      e.preventDefault();
      if (!link.href || link.pathname === location.pathname) return;

      if (link.closest('.auth__btn--goto-signin'))
        history.replaceState({}, '', `${link.href}`);
      else history.pushState({}, '', `${link.href}`);

      navigate();
    },
    { signal: navigationController?.signal },
  );
}
