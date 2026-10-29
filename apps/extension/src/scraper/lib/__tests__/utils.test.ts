import { describe, expect, it } from 'vitest';
import { Product } from '../../types';
import { mergeProducts, normalizeText, removeNullAndUndefined } from '../utils';

describe('mergeProducts', () => {
  it('keeps the first value per field and unions images and metadata', () => {
    const products: Product[] = [
      {
        name: undefined,
        price: 10,
        priceCurrency: 'USD',
        description: 'Description 1',
        images: [{ url: 'img1' }, { url: 'img2' }],
        metadata: { key1: 'value1' },
      },
      {
        name: 'Product 1',
        price: 20,
        priceCurrency: null,
        description: undefined,
        images: [{ url: 'img1', width: 1, height: 1 }, { url: 'img3' }],
        metadata: { key1: 'value1-test', key2: 'value2' },
      },
    ];

    expect(removeNullAndUndefined(mergeProducts(products))).toEqual({
      name: 'Product 1',
      price: 10,
      priceCurrency: 'USD',
      description: 'Description 1',
      images: [
        { url: 'img1', width: 1, height: 1 },
        { url: 'img2' },
        { url: 'img3' },
      ],
      metadata: { key1: 'value1', key2: 'value2' },
    });
  });

  it('keeps a price of zero from a higher-priority source', () => {
    expect(mergeProducts([{ price: 0 }, { price: 20 }]).price).toBe(0);
  });
});

describe('normalizeText', () => {
  it('collapses whitespace and trims', () => {
    expect(normalizeText('  Hello \n\t  World  ')).toBe('Hello World');
    expect(normalizeText(null)).toBeNull();
    expect(normalizeText(undefined)).toBeUndefined();
  });
});

describe('removeNullAndUndefined', () => {
  it('drops null, undefined and NaN from nested objects and arrays', () => {
    expect(
      removeNullAndUndefined({
        name: 'Product 1',
        price: NaN,
        description: null,
        images: [{ url: 'img1', width: undefined }, { url: 'img2' }],
        details: { metadata: { key1: 'value1', key2: null } },
      })
    ).toEqual({
      name: 'Product 1',
      images: [{ url: 'img1' }, { url: 'img2' }],
      details: { metadata: { key1: 'value1' } },
    });
  });

  it('returns an empty object when every value is missing', () => {
    expect(removeNullAndUndefined({ name: undefined, price: null })).toEqual(
      {}
    );
  });
});
