import { type country } from '../types/country.interface.js';
import { STORAGE_KEYS } from '../constants/storage.constants.js';
import { fetchRawCountries } from '../api/countries.api.js';

export async function getCountries(): Promise<country[]> {
  const cachedData = sessionStorage.getItem(STORAGE_KEYS.COUNTRIES_SESSION);

  try {
    if (cachedData) {
      const cachedCountriesData: country[] = JSON.parse(cachedData);
      return cachedCountriesData;
    }
  } catch {
    console.warn('Session cache corrupted, fetching fresh data.');
    sessionStorage.removeItem(STORAGE_KEYS.COUNTRIES_SESSION);
  }

  try {
    const countries = await fetchRawCountries();
    sessionStorage.setItem(
      STORAGE_KEYS.COUNTRIES_SESSION,
      JSON.stringify(countries),
    );
    return countries;
  } catch (error) {
    console.error('Service Error:', error);
    throw error;
  }
}
