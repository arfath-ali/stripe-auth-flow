import { type AppState } from '../types/app-state.types.js';
import {
  DEFAULT_PAGE_TITLE,
  PAGE_TITLE_MAP,
} from '../constants/page-titles.constants.js';

export default function syncPageTitle(state: AppState): void {
  document.title = PAGE_TITLE_MAP[state] || DEFAULT_PAGE_TITLE;
}
