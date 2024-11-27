import fs from 'fs';
import path from 'path';
import AmazonScraper from '../amazon';
import { getProduct, SiteScraper } from '../index';
import { normalizeText } from '../lib/utils';

describe('Scraper Module', () => {
  describe('SiteScraper', () => {
    it('should return an instance of AmazonScraper for Amazon URLs', () => {
      const url = 'https://www.amazon.com/example-product';
      const html = '<html></html>';

      const scraper = SiteScraper.create(url, html);

      expect(scraper).toBeInstanceOf(AmazonScraper);
    });

    it('should return an instance of ProductScraper for non-Amazon URLs', () => {
      const url = 'https://www.example.com/example-product';
      const html = '<html></html>';

      const scraper = SiteScraper.create(url, html);

      expect(scraper).toBeInstanceOf(SiteScraper);
    });
  });

  describe('getProduct', () => {
    it('should return a product and no error for valid input', () => {
      const url = 'https://www.amazon.com/example-product';
      const html = '<html></html>';

      const [product, error] = getProduct(url, html);

      expect(product).not.toBeNull();
      expect(error).toBeNull();
    });

    it('should return a valid Product', () => {
      const url = 'https://example.com/product';
      const html = `
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
                  "priceCurrency": "CAD"
                }
              }
            </script>
          </head>
          <body></body>
        </html>
      `;

      const [product, error] = getProduct(url, html);

      expect(product).toEqual({
        url: 'https://example.com/product',
        name: 'Test Product JSON-LD',
        brand: 'Test Brand',
        description: 'Product JSON-LD description',
        images: [{ url: 'https://example.com/image.jpg' }],
        price: 89.99,
        currency: 'CAD',
        metadata: {
          '@context': 'https://schema.org/',
          '@type': 'Product',
          offers: {
            price: '89.99',
            priceCurrency: 'CAD',
          },
          url: 'https://example.com/product',
          favicon: 'favicon.ico',
        },
      });
      expect(error).toBeNull();
    });
  });
});

describe('Scrapper Module with SSENSE', () => {
  const url =
    'https://www.ssense.com/en-ca/men/product/essentials/black-jersey-crewneck-t-shirt/16693101';
  let html: string;

  beforeAll(() => {
    const htmlFilePath = path.resolve(__dirname, 'data/ssense.html');
    html = fs.readFileSync(htmlFilePath, 'utf-8');
  });

  describe('getProduct', () => {
    it('should return a product and no error for valid input', () => {
      const [product, error] = getProduct(url, html);

      product!.description = normalizeText(product?.description);
      const expectedDescription = normalizeText(
        'Relaxed-fit cotton jersey T-shirt.\r\n\r\n· Rib-knit crewneck\r\n· Logo bonded at chest and back\r\n· Dropped shoulders\r\n· Rubber logo patch at back collar\r\n\r\nSupplier color: Black'
      );

      expect(product).toEqual({
        name: 'Black Jersey Crewneck T-shirt',
        brand: 'Fear of God ESSENTIALS',
        description: expectedDescription,
        images: [
          {
            url: 'https://img.ssensemedia.com/images/251161M213015_1/essentials-black-jersey-crewneck-t-shirt.jpg',
          },
          {
            url: 'https://res.cloudinary.com/ssenseweb/image/upload/b_white,c_lpad,g_south,h_706,w_470/c_scale,h_480/v550/251161M213015_1.jpg',
          },
        ],
        url: url,
        price: 85,
        currency: 'CAD',
        metadata: {
          '@context': 'https://schema.org',
          '@type': 'Product',
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
          favicon:
            'https://res.cloudinary.com/ssenseweb/image/upload/v1472005257/web/favicon.ico',
        },
      });
      expect(error).toBeNull();
    });
  });
});

describe('Scrapper Module with Amazon', () => {
  const url =
    'https://www.amazon.ca/Tarcury-Corsair-Fighter-Bomber-Building/dp/B0CNT488KH?pd_rd_w=QmenC&content-id=amzn1.sym.8eef7635-0ea1-468f-9bbf-a6c1163fd848&pf_rd_p=8eef7635-0ea1-468f-9bbf-a6c1163fd848&pf_rd_r=AN6A3DYMW5RSK3RCWZQN&pd_rd_wg=D3E9W&pd_rd_r=2d0f9aca-c2b3-4928-9b97-9e13695002f4&pd_rd_i=B0CNT488KH&ref_=pd_hp_d_btf_CACPN24_B0CNT488KH&th=1';
  let html: string;

  beforeAll(() => {
    const htmlFilePath = path.resolve(__dirname, 'data/amazon.html');
    html = fs.readFileSync(htmlFilePath, 'utf-8');
  });

  describe('getProduct', () => {
    it('should return a product and no error for valid input', () => {
      const [product, error] = getProduct(url, html);
      product!.description = normalizeText(product?.description);

      expect(product).toEqual({
        name: 'Tarcury WW2 F4U Corsair Fighter Bomber Building Bricks - 550 PCS Army Toy Set with 1 Toy Soldiers - Engaging WWII Toys for Kids and Adults, Building Sets - Amazon Canada',
        brand: 'Tarcury',
        url: url,
        description:
          'Tarcury WW2 F4U Corsair Fighter Bomber Building Bricks - 550 PCS Army Toy Set with 1 Toy Soldiers - Engaging WWII Toys for Kids and Adults in Building Sets.',
        price: 29.99,
        currency: 'CAD',
        images: [
          {
            url: 'https://m.media-amazon.com/images/I/61rbW2eIt3L._AC_SX679_.jpg',
          },
        ],
        metadata: {
          category: 'gl_toy',
          url: 'https://www.amazon.ca/Tarcury-Corsair-Fighter-Bomber-Building/dp/B0CNT488KH',
        },
      });
      expect(error).toBeNull();
    });
  });
});
