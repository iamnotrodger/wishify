import fs from 'fs';
import path from 'path';
import ProductScraper from '../scraper';
import { Product } from '../types';
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

  let scraper: ProductScraper;

  beforeEach(() => {
    scraper = new ProductScraper(testUrl, testHtml);
  });

  describe('getMetadata', () => {
    it('should extract metadata correctly', () => {
      const result = scraper.getMetadata();
      expect(result).toEqual({
        name: 'Test Product OG',
        description: 'Product description',
        images: [{ url: 'https://example.com/image.jpg' }],
        price: 99.99,
        currency: 'USD',
        metadata: {
          url: 'https://example.com/product',
          favicon: 'favicon.ico',
        },
      });
    });
  });

  describe('getJsonLd', () => {
    it('should extract JSON-LD data correctly', () => {
      const result = scraper.getJsonLd();
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

  describe('constructor', () => {
    it('should set hostname correctly', () => {
      expect(scraper.hostname).toBe('example.com');
    });
  });
});

describe('ProductScraper with SSENSE', () => {
  let html: string;
  let scraper: ProductScraper;

  beforeAll(() => {
    const htmlFilePath = path.resolve(__dirname, 'data/ssense.html');
    html = fs.readFileSync(htmlFilePath, 'utf-8');
    scraper = new ProductScraper(
      'https://www.ssense.com/en-ca/men/product/essentials/black-jersey-crewneck-t-shirt/16693101',
      html
    );
  });

  describe('getHTMLData', () => {
    it('should return an empty object', () => {
      const data = scraper.getHTMLData();
      expect(data).toEqual({});
    });
  });

  describe('getMetadata', () => {
    it('should extract metadata correctly', () => {
      const metadata: Product = scraper.getMetadata();
      metadata.description = normalizeText(metadata.description);

      const expectedDescription = normalizeText(
        'Relaxed-fit cotton jersey T-shirt.\r\n\r\n· Rib-knit crewneck\r\n· Logo bonded at chest and back\r\n· Dropped shoulders\r\n· Rubber logo patch at back collar\r\n\r\nSupplier color: Black'
      );

      expect(metadata).toEqual({
        name: 'Fear of God ESSENTIALS - Black Jersey Crewneck T-shirt',
        description: expectedDescription,
        images: [
          {
            url: 'https://res.cloudinary.com/ssenseweb/image/upload/b_white,c_lpad,g_south,h_706,w_470/c_scale,h_480/v550/251161M213015_1.jpg',
          },
        ],
        price: 85,
        currency: 'CAD',
        metadata: {
          url: 'https://www.ssense.com/en-ca/en-ca/men/product/essentials/black-jersey-crewneck-t-shirt/16693101',
          favicon:
            'https://res.cloudinary.com/ssenseweb/image/upload/v1472005257/web/favicon.ico',
          brand: 'Fear of God ESSENTIALS',
        },
      });
    });
  });

  describe('getJsonLd', () => {
    it('should extract JSON-LD data correctly', () => {
      const jsonLd = scraper.getJsonLd();

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
