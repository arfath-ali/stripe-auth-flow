import { getElement } from '../utils/dom.utils.js';

export const getAuthDropdownElements = (route: string) => {
  return {
    dropdownInput: getElement<HTMLInputElement>(
      `[data-dropdown=${route}] .auth__input--dropdown`,
    ),
    dropdownFlag: getElement<HTMLImageElement>(
      `[data-dropdown=${route}] .auth__dropdown-flag`,
    ),
    dropdownCountry: getElement<HTMLElement>(
      `[data-dropdown=${route}] .auth__dropdown-country`,
    ),
    dropdownMenu: getElement<HTMLElement>(
      `[data-dropdown=${route}] .auth__dropdown-menu`,
    ),
    dropdownSearch: getElement<HTMLInputElement>(
      `[data-dropdown=${route}] .auth__input--search`,
    ),
    dropdownList: getElement<HTMLElement>(
      `[data-dropdown=${route}] .auth__dropdown-list`,
    ),
  };
};
