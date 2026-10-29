import { jsonrepair } from 'jsonrepair';
import { itemAvailabilities, ItemAvailability, Json } from '../types';
import { currencies } from './currency';

export const parseNum = (value?: number | string | null, decimalSep = '.') => {
  if (value == null) return NaN;
  if (typeof value === 'number') return value;

  const regex = new RegExp('[^0-9-' + decimalSep + ']', 'g');
  const unformatted = value.replace(regex, '').replace(decimalSep, '.');
  return parseFloat(unformatted);
};

// Accepts full IRIs (https://schema.org/InStock), prefixed (schema:InStock) or bare names.
export const parseAvailability = (
  value: unknown
): ItemAvailability | undefined => {
  if (typeof value !== 'string') return undefined;
  const name = value.trim().split(/[/:]/).pop();
  return itemAvailabilities.find((a) => a === name);
};

export const parseString = (value: unknown) => {
  if (typeof value === 'number') return String(value);
  if (!value || typeof value !== 'string') return null;
  return value;
};

export const parseURL = (value: unknown, pageUrl: URL) => {
  if (typeof value !== 'string' || !value.trim()) return null;

  let url = value.trim();
  // Scheme-less absolute URL, e.g. "www.example.com/img.jpg" on www.example.com.
  if (url.startsWith(`${pageUrl.hostname}/`)) url = `https://${url}`;

  try {
    const resolved = new URL(url, pageUrl);
    if (resolved.protocol !== 'https:' && resolved.protocol !== 'http:') {
      return null;
    }
    return resolved.toString();
  } catch {
    return null;
  }
};

export const parseCurrency = (currency: unknown) => {
  if (typeof currency !== 'string') return null;
  const code = currency.trim().toUpperCase();
  return currencies[code] ? code : null;
};

export const parseJson = (rawContent: string): Json | Json[] | null => {
  try {
    const json = jsonrepair(rawContent.replace(/\s+/g, ' '));
    return JSON.parse(json);
  } catch {
    return null;
  }
};
