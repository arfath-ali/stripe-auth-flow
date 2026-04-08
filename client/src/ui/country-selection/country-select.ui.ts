import type { getAuthDropdownElements } from '../../dom/dropdown.dom.js';
import { highlightCountrySelected } from './country-selection-highlight.ui.js';

let dropdownListenerController: AbortController | null = null;

export function initCountrySelect(
  dropdownElements: ReturnType<typeof getAuthDropdownElements>,
): void {
  dropdownListenerController?.abort();
  dropdownListenerController = new AbortController();

  dropdownElements.dropdownList?.addEventListener(
    'click',
    (e) => {
      const dropdownItem = (e.target as HTMLElement).closest(
        '.auth__dropdown-item',
      ) as HTMLElement | null;

      if (!dropdownItem) return;

      const countryCode = dropdownItem.dataset.countryCode?.trim();

      if (!countryCode) return;

      dropdownElements.dropdownFlag.src = `https://flagcdn.com/${countryCode}.svg`;

      dropdownElements.dropdownCountry.textContent = dropdownItem.textContent;

      if (dropdownElements.dropdownInput)
        dropdownElements.dropdownInput.value = countryCode;

      highlightCountrySelected(dropdownElements);
    },
    { signal: dropdownListenerController.signal },
  );
}
