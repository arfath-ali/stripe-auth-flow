import { getElements } from '../../utils/dom.utils.js';

let InputListenerController: AbortController | null = null;

export function initInputCursor() {
  InputListenerController?.abort();
  InputListenerController = new AbortController();

  const authInputs = getElements<HTMLInputElement>('.auth__input');

  authInputs.forEach((authInput) => {
    authInput.addEventListener(
      'focus',
      () => {
        if (authInput.name === 'email') authInput.type = 'text';

        if (authInput.type !== 'checkbox')
          authInput.setSelectionRange(
            authInput.value.length,
            authInput.value.length,
          );
      },
      { signal: InputListenerController!.signal },
    );
  });

  authInputs.forEach((authInput) => {
    authInput.addEventListener(
      'blur',
      () => {
        if (authInput.name === 'email') authInput.type = 'email';
      },
      { signal: InputListenerController!.signal },
    );
  });
}
