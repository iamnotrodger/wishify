import { Product } from '@/types';
import {
  getHostname,
  mergeProducts,
  normalizeText,
  findBySelectors,
  getJsonLdProduct,
  getJsonLdCurrency,
  getJsonLdPrice,
} from '../utils';
import * as cheerio from 'cheerio';

describe('Utils Module', () => {
  describe('getHostname', () => {
    it('should return the hostname without www', () => {
      expect(getHostname('https://www.example.com')).toBe('www.example.com');
      expect(getHostname('https://example.com')).toBe('example.com');
    });
  });

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

  describe('findBySelectors', () => {
    it('should find element by selectors', () => {
      const html = '<div class="test">Hello</div>';
      const $ = cheerio.load(html);
      const selectors = [{ selector: '.test' }];
      expect(findBySelectors($, selectors)).toBe('Hello');
    });

    it('should return undefined if no element is found', () => {
      const html = '<div class="test">Hello</div>';
      const $ = cheerio.load(html);
      const selectors = [{ selector: '.not-found' }];
      expect(findBySelectors($, selectors)).toBeUndefined();
    });
  });

  describe('getJsonLdProduct', () => {
    it('should return the product from JSON-LD', () => {
      const jsonLd = { '@graph': [{ '@type': 'Product', name: 'Product 1' }] };
      expect(getJsonLdProduct(jsonLd)).toEqual({
        '@type': 'Product',
        name: 'Product 1',
      });
    });

    it('should return undefined if no product is found', () => {
      const jsonLd = { '@graph': [{ '@type': 'Person', name: 'John Doe' }] };
      expect(getJsonLdProduct(jsonLd)).toBeUndefined();
    });
  });

  describe('getJsonLdCurrency', () => {
    it('should return the currency from JSON-LD', () => {
      const data = { offers: { priceCurrency: 'USD' } };
      expect(getJsonLdCurrency(data)).toBe('USD');
    });

    it('should return undefined if no currency is found', () => {
      const data = { offers: {} };
      expect(getJsonLdCurrency(data)).toBeUndefined();
    });
  });

  describe('getJsonLdPrice', () => {
    it('should return the price from JSON-LD', () => {
      const data = { offers: { price: 100 } };
      expect(getJsonLdPrice(data)).toBe(100);
    });

    it('should return undefined if no price is found', () => {
      const data = { offers: {} };
      expect(getJsonLdPrice(data)).toBeUndefined();
    });
  });
});
