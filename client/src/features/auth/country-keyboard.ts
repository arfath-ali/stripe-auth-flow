import type { getAuthDropdownElements } from '../../dom/dropdown.dom';

export function initCountryKeyboard(
  dropdownElements: ReturnType<typeof getAuthDropdownElements>,
  signal: AbortSignal,
) {
  let highlightedIndex = -1;

  dropdownElements.dropdownSearch.addEventListener(
    'keydown',
    (e) => {
      const dropdownItems =
        dropdownElements.dropdownList.querySelectorAll<HTMLElement>(
          '.auth__dropdown-item:not(.hidden)',
        );

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndex = (highlightedIndex + 1) % dropdownItems.length;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndex =
          (highlightedIndex - 1 + dropdownItems.length) % dropdownItems.length;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        dropdownItems[highlightedIndex]?.click();
        highlightedIndex = -1;
      }

      dropdownItems.forEach((item) => {
        item.classList.remove('auth__dropdown-item--highlighted');
      });

      dropdownItems[highlightedIndex]?.classList.add(
        'auth__dropdown-item--highlighted',
      );

      dropdownItems[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    },
    {
      signal,
    },
  );
}
