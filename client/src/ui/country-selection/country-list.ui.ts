import { type country } from '../../types/country.interface.js';
import { getAuthDropdownElements } from '../../dom/dropdown.dom.js';
import { initCountrySelect } from './country-select.ui.js';
import { highlightCountrySelected } from './country-selection-highlight.ui.js';

export async function renderCountryList(
  countriesData: country[],
  dropdownElements: ReturnType<typeof getAuthDropdownElements>,
) {
  dropdownElements.dropdownList.innerHTML = '';

  countriesData.forEach((country) => {
    dropdownElements.dropdownList?.insertAdjacentHTML(
      'beforeend',
      `
        <li class="auth__dropdown-item" data-country-code="${country?.code.toLowerCase()}" tabindex="-1">
          <div class="auth__dropdown-item-content">
            <img class="auth__dropdown-flag" src="https://flagcdn.com/${country?.code.toLowerCase()}.svg"/>
            <span class="auth__dropdown-country">${country.name}</span>
          </div>
        </li>
      `,
    );
  });

  initCountrySelect(dropdownElements);
  highlightCountrySelected(dropdownElements);
}
