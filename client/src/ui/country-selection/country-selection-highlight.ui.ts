import type { getAuthDropdownElements } from '../../dom/dropdown.dom.js';

export function highlightCountrySelected(
  dropdownElements: ReturnType<typeof getAuthDropdownElements>,
): void {
  const countryCode = dropdownElements.dropdownInput?.value;
  const selectIcon = '/assets/images/select.png';

  const countryItems = dropdownElements.dropdownList?.querySelectorAll('li');
  countryItems?.forEach((item) => {
    item.querySelector('.auth__dropdown-check')?.remove();

    if (item.dataset.countryCode === countryCode) {
      item?.insertAdjacentHTML(
        'beforeend',
        `
          <img src="${selectIcon}" class="auth__dropdown-check"/>
          `,
      );
    }
  });
}
