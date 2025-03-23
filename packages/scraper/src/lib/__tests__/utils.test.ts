import { Product } from '../../types';
import { mergeProducts, normalizeText, removeNullAndUndefined } from '../utils';

describe('Utils Module', () => {
  describe('mergeProducts', () => {
    it('should combine product details', () => {
      const products: Product[] = [
        {
          name: undefined,
          price: 10,
          currency: 'USD',
          description: 'Description 1',
          images: [{ url: 'img1' }, { url: 'img2' }],
          metadata: { key1: 'value1' },
        },
        {
          name: 'Product 1',
          price: 20,
          currency: null,
          description: undefined,
          images: [{ url: 'img1', width: 1, height: 1 }, { url: 'img3' }],
          metadata: { key1: 'value1-test', key2: 'value2' },
        },
      ];
      const combinedProduct = mergeProducts(products);
      expect(combinedProduct).toEqual({
        name: 'Product 1',
        price: 10,
        currency: 'USD',
        description: 'Description 1',
        images: [
          { url: 'img1', width: 1, height: 1 },
          { url: 'img2' },
          { url: 'img3' },
        ],
        metadata: { key1: 'value1', key2: 'value2' },
      });
    });
  });

  describe('normalizeText', () => {
    it('should normalize text by trimming and replacing multiple spaces', () => {
      expect(normalizeText('  Hello   World  ')).toBe('Hello World');
      expect(normalizeText(null)).toBeNull();
      expect(normalizeText(undefined)).toBeUndefined();
    });
  });

  describe('removeNullAndUndefined', () => {
    it('should remove undefined and null values from an object', () => {
      const obj = {
        name: 'Product 1',
        price: undefined,
        description: null,
        images: [{ url: 'img1' }, { url: 'img2' }],
        metadata: { key1: 'value1', key2: null },
      };
      const sanitizedObj = removeNullAndUndefined(obj);
      expect(sanitizedObj).toEqual({
        name: 'Product 1',
        images: [{ url: 'img1' }, { url: 'img2' }],
        metadata: { key1: 'value1' },
      });
    });

    it('should handle nested objects', () => {
      const obj = {
        name: 'Product 1',
        details: {
          price: undefined,
          description: null,
          metadata: { key1: 'value1', key2: null },
        },
      };
      const sanitizedObj = removeNullAndUndefined(obj);
      expect(sanitizedObj).toEqual({
        name: 'Product 1',
        details: {
          metadata: { key1: 'value1' },
        },
      });
    });

    it('should handle arrays of objects', () => {
      const obj = {
        name: 'Product 1',
        images: [
          { url: 'img1', width: undefined },
          { url: 'img2', height: null },
        ],
      };
      const sanitizedObj = removeNullAndUndefined(obj);
      expect(sanitizedObj).toEqual({
        name: 'Product 1',
        images: [{ url: 'img1' }, { url: 'img2' }],
      });
    });

    it('should return an empty object if all values are undefined or null', () => {
      const obj = {
        name: undefined,
        price: null,
        description: null,
      };
      const sanitizedObj = removeNullAndUndefined(obj);
      expect(sanitizedObj).toEqual({});
    });
  });
});
