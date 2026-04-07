import { userData } from './user-data.types.js';

export {};

declare global {
  interface Window {
    appUser: userData | null;
  }
}
