import { Json } from '@/types';
import {
  parseCurrency,
  parseJson,
  parseNum,
  parseString,
  parseURL,
} from '../parse';
import { normalizeText } from '../utils';

describe('Parse Module', () => {
  describe('parseNum', () => {
    it('should return NaN for null or undefined value', () => {
      expect(parseNum(null)).toBeNaN();
      expect(parseNum(undefined)).toBeNaN();
    });

    it('should return the number itself if the value is a number', () => {
      expect(parseNum(123)).toBe(123);
    });

    it('should parse a string number correctly', () => {
      expect(parseNum('123')).toBe(123);
      expect(parseNum('123.45')).toBe(123.45);
    });

    it('should handle different decimal separators', () => {
      expect(parseNum('123,45', ',')).toBe(123.45);
    });

    it('should return null for invalid input', () => {
      expect(parseNum('invalid')).toBeNaN();
    });
  });

  describe('parseString', () => {
    it('should return null for non-string input', () => {
      expect(parseString(null)).toBeNull();
      expect(parseString(123)).toBeNull();
    });

    it('should return the string itself if the input is a string', () => {
      expect(parseString('test')).toBe('test');
    });
  });

  describe('parseURL', () => {
    const hostname = 'example.com';

    it('should return null for invalid URL', () => {
      expect(parseURL('data:image/png;base64', hostname)).toBeNull();
      expect(parseURL('[object object]', hostname)).toBeNull();
    });

    it('should return a full URL for relative paths', () => {
      expect(parseURL('#path', hostname)).toBe(`https://${hostname}/path`);
      expect(parseURL('/path', hostname)).toBe(`https://${hostname}/path`);
      expect(parseURL('//path', hostname)).toBe(`https://${hostname}/path`);
    });

    it('should return a full URL for URLs starting with hostname', () => {
      expect(parseURL('example.com/path', hostname)).toBe(
        `https://example.com/path`
      );
    });

    it('should return the URL itself if it is already a full URL', () => {
      const url = 'https://example.com/path';
      expect(parseURL(url, hostname)).toBe(url);
    });
  });

  describe('parseCurrency', () => {
    it('should return null for invalid currency', () => {
      expect(parseCurrency(null)).toBeNull();
      expect(parseCurrency(123)).toBeNull();
      expect(parseCurrency('$')).toBeNull();
      expect(parseCurrency('invalid')).toBeNull();
    });

    it('should return the currency itself if the input is valid', () => {
      expect(parseCurrency('USD')).toBe('USD');
      expect(parseCurrency('eur')).toBe('EUR');
    });
  });

  describe('parseJson', () => {
    const rawContent = `
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "productID": 16693101,
        "name": "Test",
        "sku": "251161M213015",
        "brand": {
          "@type": "Brand",
          "name": "Test"
        },
        "offers": {
          "@type": "Offer",
          "price": 99,
          "priceCurrency": "CAD",
          "availability": "https://schema.org/InStock",
          "url": "/en-ca/men/product/test/test/16693101"
        },
        "url": "/en-ca/men/product/test/test/16693101",
        "description": "Relaxed-fit cotton jersey T-shirt.\r\n\r\n· Rib-knit crewneck\r\n· Logo bonded at chest and back\r\n· Dropped shoulders\r\n· Rubber logo patch at back collar\r\n\r\nSupplier color: Black",
        "image": "https://test.com/images/251161M213015_1/test.jpg"
      }
    `;

    it('should parse valid JSON-LD content', () => {
      const parsed = parseJson(rawContent) as Json;
      parsed.description = normalizeText(parsed.description);

      const expectedDescription = normalizeText(
        'Relaxed-fit cotton jersey T-shirt.\r\n\r\n· Rib-knit crewneck\r\n· Logo bonded at chest and back\r\n· Dropped shoulders\r\n· Rubber logo patch at back collar\r\n\r\nSupplier color: Black'
      );

      expect(parsed).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Product',
        productID: 16693101,
        name: 'Test',
        sku: '251161M213015',
        brand: {
          '@type': 'Brand',
          name: 'Test',
        },
        offers: {
          '@type': 'Offer',
          price: 99,
          priceCurrency: 'CAD',
          availability: 'https://schema.org/InStock',
          url: '/en-ca/men/product/test/test/16693101',
        },
        url: '/en-ca/men/product/test/test/16693101',
        description: expectedDescription,
        image: 'https://test.com/images/251161M213015_1/test.jpg',
      });
    });
  });
});
