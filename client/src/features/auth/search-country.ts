import { getAuthDropdownElements } from '../../dom/dropdown.dom.js';
import { initCountryKeyboard } from './country-keyboard.js';

let searchListenerController: AbortController | null = null;

export function initCountrySearch(
  dropdownElements: ReturnType<typeof getAuthDropdownElements>,
) {
  searchListenerController?.abort();
  searchListenerController = new AbortController();

  dropdownElements.dropdownSearch.focus();

  initCountryKeyboard(dropdownElements, searchListenerController.signal);

  dropdownElements.dropdownSearch?.addEventListener(
    'input',
    (e) => {
      const filter = (
        e.target instanceof HTMLInputElement ? e.target.value : ''
      ).toLowerCase();

      const countryItems = dropdownElements.dropdownMenu.querySelectorAll('li');

      let availableCount = 0;

      countryItems?.forEach((item) => {
        const itemText = item.textContent.toLowerCase();
        const isAvailable = itemText.includes(filter);

        item.classList.toggle('hidden', !isAvailable);

        if (isAvailable) availableCount++;
      });

      dropdownElements.dropdownList.classList.toggle(
        'auth__dropdown-list--empty',
        availableCount === 0,
      );
    },
    { signal: searchListenerController.signal },
  );

  dropdownElements.dropdownSearch.addEventListener(
    'focusout',
    (e) => {
      const clickElement = e.relatedTarget as Node | null;

      if (clickElement && dropdownElements.dropdownMenu.contains(clickElement))
        return;

      dropdownElements.dropdownMenu.classList.add('hidden');
    },
    { signal: searchListenerController.signal },
  );
}
