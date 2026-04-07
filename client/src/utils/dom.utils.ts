export function getElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector(selector) as T | null;

  if (!element) throw new Error(`Element not found: ${selector}`);

  return element;
}

export function getElements<T extends HTMLElement>(selector: string): T[] {
  const elements = Array.from(document.querySelectorAll<T>(selector));

  if (elements.length === 0) throw new Error(`Elements not found: ${selector}`);

  return elements;
}
