import fs from 'fs';
import path from 'path';
import JsonLdScraper, {
  getJsonLdCurrency,
  getJsonLdPrice,
  getJsonLdProduct,
} from '../jsonld';
import { normalizeText } from '../lib/utils';

describe('ProductScraper', () => {
  const testUrl = 'https://example.com/product';
  const testHtml = `
    <html>
      <head>
        <title>Test Product</title>
        <meta property="og:title" content="Test Product OG" />
        <meta property="og:description" content="Product description" />
        <meta property="og:url" content="https://example.com/product" />
        <meta property="og:image" content="https://example.com/image.jpg" />
        <meta property="product:price:amount" content="99.99" />
        <meta property="product:price:currency" content="USD" />
        <link rel="icon" href="favicon.ico" />
        <script type="application/ld+json">
          {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": "Test Product JSON-LD",
            "description": "Product JSON-LD description",
            "image": "https://example.com/image.jpg",
            "brand": {
              "name": "Test Brand"
            },
            "offers": {
              "price": "89.99",
              "priceCurrency": "EUR"
            }
          }
        </script>
      </head>
      <body></body>
    </html>
  `;

  let scraper: JsonLdScraper;

  beforeEach(() => {
    scraper = new JsonLdScraper(testUrl, testHtml);
  });

  describe('getJsonLd', () => {
    it('should extract JSON-LD data correctly', () => {
      const result = scraper.getProduct();
      expect(result).toEqual({
        name: 'Test Product JSON-LD',
        description: 'Product JSON-LD description',
        images: [{ url: 'https://example.com/image.jpg' }],
        price: 89.99,
        currency: 'EUR',
        metadata: {
          brand: 'Test Brand',
          '@context': 'https://schema.org/',
          '@type': 'Product',
          offers: {
            price: '89.99',
            priceCurrency: 'EUR',
          },
        },
      });
    });
  });
});

describe('JSON-LD utility functions', () => {
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

describe('JsonLdScraper with SSENSE', () => {
  let html: string;
  let scraper: JsonLdScraper;

  beforeAll(() => {
    const htmlFilePath = path.resolve(__dirname, 'data/ssense.html');
    html = fs.readFileSync(htmlFilePath, 'utf-8');
    scraper = new JsonLdScraper(
      'https://www.ssense.com/en-ca/men/product/essentials/black-jersey-crewneck-t-shirt/16693101',
      html
    );
  });

  describe('getProduct', () => {
    it('should extract JSON-LD data correctly', () => {
      const jsonLd = scraper.getProduct();

      jsonLd.description = normalizeText(jsonLd.description);
      const expectedDescription = normalizeText(
        'Relaxed-fit cotton jersey T-shirt.\r\n\r\n· Rib-knit crewneck\r\n· Logo bonded at chest and back\r\n· Dropped shoulders\r\n· Rubber logo patch at back collar\r\n\r\nSupplier color: Black'
      );

      expect(jsonLd).toEqual({
        name: 'Black Jersey Crewneck T-shirt',
        description: expectedDescription,
        images: [
          {
            url: 'https://img.ssensemedia.com/images/251161M213015_1/essentials-black-jersey-crewneck-t-shirt.jpg',
          },
        ],
        price: 85,
        currency: 'CAD',
        metadata: {
          '@context': 'https://schema.org',
          '@type': 'Product',
          brand: 'Fear of God ESSENTIALS',
          productID: 16693101,
          sku: '251161M213015',
          offers: {
            '@type': 'Offer',
            price: 85,
            priceCurrency: 'CAD',

            availability: 'https://schema.org/InStock',
            url: '/en-ca/men/product/essentials/black-jersey-crewneck-t-shirt/16693101',
          },
          url: 'https://www.ssense.com/en-ca/men/product/essentials/black-jersey-crewneck-t-shirt/16693101',
        },
      });
    });
  });
});
