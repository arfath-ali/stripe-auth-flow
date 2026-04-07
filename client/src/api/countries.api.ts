import { API__ENDPOINTS } from '../constants/api.constants.js';
import { type country } from '../types/country.interface.js';

export async function fetchRawCountries(): Promise<country[]> {
  const response = await fetch(API__ENDPOINTS.COUNTRIES);

  if (!response.ok)
    throw new Error(`Could not load data from ${API__ENDPOINTS.COUNTRIES}`);

  const data = await response.json();

  return data;
}
