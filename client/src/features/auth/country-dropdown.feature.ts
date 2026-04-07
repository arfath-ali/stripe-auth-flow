import { type DropdownRoute } from '../../types/dropdown-route.types.js';
import { getElement } from '../../utils/dom.utils.js';
import { getAuthDropdownElements } from '../../dom/dropdown.dom.js';
import { getCountries } from '../../services/countires.services.js';
import { renderCountryList } from '../../ui/country-selection/country-list.ui.js';
import { initCountrySearch } from './search-country.js';

let dropdownListenerController: AbortController | null = null;
let windowListenerController: AbortController | null = null;

export async function initCountryDropdown(route: DropdownRoute) {
  dropdownListenerController?.abort();
  dropdownListenerController = new AbortController();

  const dropdownBtn = getElement<HTMLElement>(
    `[data-dropdown=${route}] .auth__btn--dropdown`,
  );
  const countriesData = await getCountries();

  dropdownBtn?.addEventListener(
    'click',
    (e) => {
      e.stopPropagation();
      const dropdownElements = getAuthDropdownElements(route);

      if (dropdownElements.dropdownMenu.classList.contains('hidden')) {
        dropdownElements.dropdownMenu?.classList.remove('hidden');
        initDropdownMenuCloser(
          dropdownElements.dropdownMenu,
          dropdownElements.dropdownSearch,
          dropdownElements.dropdownList,
        );

        renderCountryList(countriesData, dropdownElements);
        initCountrySearch(getAuthDropdownElements(route));
      } else {
        if (dropdownElements.dropdownSearch) {
          dropdownElements.dropdownSearch.value = '';
        }
        dropdownElements.dropdownList.scrollTop = 0;
        dropdownElements.dropdownMenu?.classList.add('hidden');
        windowListenerController?.abort();
      }
    },
    { signal: dropdownListenerController.signal },
  );
}

function initDropdownMenuCloser(
  dropdownMenu: HTMLElement,
  dropdownSearch: HTMLInputElement,
  dropdownList: HTMLElement,
) {
  windowListenerController?.abort();
  windowListenerController = new AbortController();

  window.addEventListener(
    'click',
    (e) => {
      if (
        !(e.target as HTMLElement)?.classList.contains('auth__input--search')
      ) {
        if (dropdownSearch) {
          dropdownSearch.value = '';
        }
        dropdownList.scrollTop = 0;
        dropdownMenu?.classList.add('hidden');
      }
    },
    { signal: windowListenerController.signal },
  );
}
