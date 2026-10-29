import { describe, expect, it } from 'vitest';
import {
  parseAvailability,
  parseCurrency,
  parseJson,
  parseNum,
  parseString,
  parseURL,
} from '../parse';

describe('parseNum', () => {
  it('returns NaN for missing or non-numeric values', () => {
    expect(parseNum(null)).toBeNaN();
    expect(parseNum(undefined)).toBeNaN();
    expect(parseNum('invalid')).toBeNaN();
  });

  it('keeps numbers and strips formatting from strings', () => {
    expect(parseNum(123)).toBe(123);
    expect(parseNum('123.45')).toBe(123.45);
    expect(parseNum('$1299.99')).toBe(1299.99);
  });

  it('honours a custom decimal separator', () => {
    expect(parseNum('123,45', ',')).toBe(123.45);
  });
});

describe('parseString', () => {
  it('rejects empty and non-string values', () => {
    expect(parseString(null)).toBeNull();
    expect(parseString('')).toBeNull();
    expect(parseString({})).toBeNull();
  });

  it('keeps strings and stringifies numeric identifiers', () => {
    expect(parseString('test')).toBe('test');
    expect(parseString(123)).toBe('123');
  });
});

describe('parseURL', () => {
  const pageUrl = new URL('https://example.com/shop/item/1');

  it('rejects non-strings and non-http schemes', () => {
    expect(parseURL({}, pageUrl)).toBeNull();
    expect(parseURL('', pageUrl)).toBeNull();
    expect(parseURL('data:image/png;base64,AAAA', pageUrl)).toBeNull();
    expect(parseURL('javascript:alert(1)', pageUrl)).toBeNull();
  });

  it('keeps absolute URLs', () => {
    expect(parseURL('https://cdn.com/a.jpg', pageUrl)).toBe(
      'https://cdn.com/a.jpg'
    );
  });

  it('resolves relative URLs against the page URL', () => {
    expect(parseURL('/a.jpg', pageUrl)).toBe('https://example.com/a.jpg');
    expect(parseURL('a.jpg', pageUrl)).toBe(
      'https://example.com/shop/item/a.jpg'
    );
    expect(parseURL('data/a.jpg', pageUrl)).toBe(
      'https://example.com/shop/item/data/a.jpg'
    );
  });

  it('keeps the host of protocol-relative URLs', () => {
    expect(parseURL('//cdn.other.com/a.jpg', pageUrl)).toBe(
      'https://cdn.other.com/a.jpg'
    );
  });

  it('treats a leading page hostname as a scheme-less absolute URL', () => {
    expect(parseURL('example.com/path', pageUrl)).toBe(
      'https://example.com/path'
    );
  });
});

describe('parseCurrency', () => {
  it('rejects values that are not ISO 4217 codes', () => {
    expect(parseCurrency(null)).toBeNull();
    expect(parseCurrency(123)).toBeNull();
    expect(parseCurrency('$')).toBeNull();
    expect(parseCurrency('invalid')).toBeNull();
  });

  it('upper-cases valid codes', () => {
    expect(parseCurrency('USD')).toBe('USD');
    expect(parseCurrency(' eur ')).toBe('EUR');
  });
});

describe('parseAvailability', () => {
  it('accepts schema.org IRIs, prefixed and bare names', () => {
    expect(parseAvailability('https://schema.org/InStock')).toBe('InStock');
    expect(parseAvailability('http://schema.org/OutOfStock')).toBe(
      'OutOfStock'
    );
    expect(parseAvailability('schema:PreOrder')).toBe('PreOrder');
    expect(parseAvailability('SoldOut')).toBe('SoldOut');
  });

  it('rejects values outside ItemAvailability', () => {
    expect(parseAvailability('in stock')).toBeUndefined();
    expect(parseAvailability(null)).toBeUndefined();
  });
});

describe('parseJson', () => {
  it('parses valid JSON', () => {
    expect(parseJson('{"@type": "Product", "name": "Test"}')).toEqual({
      '@type': 'Product',
      name: 'Test',
    });
  });

  it('repairs malformed JSON-LD that sites commonly ship', () => {
    expect(parseJson('{"name": "Test", "sku": "1",}')).toEqual({
      name: 'Test',
      sku: '1',
    });
  });

  it('returns null for content that cannot be repaired', () => {
    expect(parseJson('{"name": "Test"} trailing {')).toBeNull();
  });
});
