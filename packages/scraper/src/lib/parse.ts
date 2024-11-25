import { jsonrepair } from 'jsonrepair';
import { currencies } from './currency';
import { Json } from '../types';

export const parseNum = (value?: number | string | null, decimalSep = '.') => {
  try {
    if (value == null) return NaN;
    if (typeof value === 'number') return value;

    const regex = new RegExp('[^0-9-' + decimalSep + ']', 'g');
    let unformatted = value
      .toString()
      .replace(regex, '')
      .replace(decimalSep, '.');
    return parseFloat(unformatted);
  } catch (error) {
    return NaN;
  }
};

export const parseString = (str: any) => {
  if (!str || typeof str !== 'string') return null;
  return str;
};

export const parseURL = (url: any, hostname: string) => {
  if (
    typeof url !== 'string' ||
    url.startsWith('data') ||
    url === '[object object]'
  ) {
    return null;
  }

  if (url.startsWith(hostname)) {
    url = `https://${url}`;
  } else if (!url.startsWith('http')) {
    url = url.replace(/^(#|\/\/|\/)+/, '');
    url = `https://${hostname}/${url}`;
  }

  try {
    return new URL(url).toString();
  } catch (e) {
    return null;
  }
};

export const parseCurrency = (currency: any) => {
  if (
    !currency ||
    typeof currency !== 'string' ||
    currency.length < 1 ||
    currency.length > 5 ||
    !currencies[currency.toUpperCase()]
  ) {
    return null;
  }

  return currency.toUpperCase();
};

export const parseJson = (rawContent: string): Json | Json[] | null => {
  try {
    const json = jsonrepair(rawContent.replace(/\s+/g, ' '));
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
};
