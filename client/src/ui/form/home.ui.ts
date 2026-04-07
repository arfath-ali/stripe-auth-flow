import type { userData } from '../../types/user-data.types.js';
import { getElement } from '../../utils/dom.utils.js';

export function handleHome(user: userData) {
  const userFullName = getElement<HTMLSpanElement>('.dashboard__user-name');

  userFullName.textContent = user.full_name;
}
