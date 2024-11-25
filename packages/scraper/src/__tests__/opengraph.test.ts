import fs from 'fs';
import path from 'path';
import { Product, Scraper } from '../types';
import { normalizeText } from '../lib/utils';
import OpenGraphScraper from '../opengraph';

describe('OpenGraphScraper', () => {
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

  let scraper: OpenGraphScraper;

  beforeEach(() => {
    scraper = new OpenGraphScraper(testUrl, testHtml);
  });

  describe('getProduct', () => {
    it('should extract metadata correctly', () => {
      const result = scraper.getProduct();
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
});

describe('OpenGraphScraper with SSENSE', () => {
  let html: string;
  let scraper: Scraper;

  beforeAll(() => {
    const htmlFilePath = path.resolve(__dirname, 'data/ssense.html');
    html = fs.readFileSync(htmlFilePath, 'utf-8');
    scraper = new OpenGraphScraper(
      'https://www.ssense.com/en-ca/men/product/essentials/black-jersey-crewneck-t-shirt/16693101',
      html
    );
  });

  describe('getProduct', () => {
    it('should extract metadata correctly', () => {
      const metadata: Product = scraper.getProduct();
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
});

describe('OpenGraphScraper with Amazon', () => {
  const url =
    'https://www.amazon.ca/Tarcury-Corsair-Fighter-Bomber-Building/dp/B0CNT488KH?pd_rd_w=QmenC&content-id=amzn1.sym.8eef7635-0ea1-468f-9bbf-a6c1163fd848&pf_rd_p=8eef7635-0ea1-468f-9bbf-a6c1163fd848&pf_rd_r=AN6A3DYMW5RSK3RCWZQN&pd_rd_wg=D3E9W&pd_rd_r=2d0f9aca-c2b3-4928-9b97-9e13695002f4&pd_rd_i=B0CNT488KH&ref_=pd_hp_d_btf_CACPN24_B0CNT488KH&th=1';
  let html: string;
  let scraper: Scraper;

  beforeAll(() => {
    const htmlFilePath = path.resolve(__dirname, 'data/amazon.html');
    html = fs.readFileSync(htmlFilePath, 'utf-8');
    scraper = new OpenGraphScraper(url, html);
  });

  describe('getProduct', () => {
    it('should extract metadata correctly', () => {
      const result = scraper.getProduct();
      expect(result).toEqual({
        name: 'Tarcury WW2 F4U Corsair Fighter Bomber Building Bricks - 550 PCS Army Toy Set with 1 Toy Soldiers - Engaging WWII Toys for Kids and Adults, Building Sets - Amazon Canada',
        description:
          'Tarcury WW2 F4U Corsair Fighter Bomber Building Bricks - 550 PCS Army Toy Set with 1 Toy Soldiers - Engaging WWII Toys for Kids and Adults in Building Sets.',
        metadata: {
          url: 'https://www.amazon.ca/Tarcury-Corsair-Fighter-Bomber-Building/dp/B0CNT488KH',
        },
      });
    });
  });
});
