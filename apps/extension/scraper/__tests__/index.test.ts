import { describe, expect, it } from 'vitest';
import { scrapeProduct } from '..';
import { normalizeText, removeNullAndUndefined } from '../lib/utils';
import amazonHtml from './data/amazon.html?raw';
import ssenseHtml from './data/ssense.html?raw';
import { amazonUrl, ssenseDescription, ssenseUrl } from './helpers';

const scrape = (url: string, html: string) => {
  const product = removeNullAndUndefined(scrapeProduct(url, html));
  product.description = normalizeText(product.description);
  return product;
};

describe('scrapeProduct', () => {
  it('falls back to the page URL for an empty page', () => {
    expect(scrape('https://example.com/p', '<html></html>')).toEqual({
      url: 'https://example.com/p',
      metadata: {},
    });
  });

  it('prefers JSON-LD over OpenGraph', () => {
    const html = `
      <head>
        <meta property="og:title" content="OG name" />
        <meta property="product:price:amount" content="99.99" />
        <meta property="product:price:currency" content="USD" />
        <script type="application/ld+json">
          {"@type": "Product", "name": "JSON-LD name",
           "offers": {"price": "89.99", "priceCurrency": "CAD"}}
        </script>
      </head>
    `;
    expect(scrape('https://example.com/p', html)).toMatchObject({
      name: 'JSON-LD name',
      price: 89.99,
      priceCurrency: 'CAD',
    });
  });

  it('combines JSON-LD and OpenGraph for SSENSE', () => {
    expect(scrape(ssenseUrl, ssenseHtml)).toEqual({
      name: 'Black Jersey Crewneck T-shirt',
      brand: 'Fear of God ESSENTIALS',
      description: ssenseDescription,
      images: [
        {
          url: 'https://img.ssensemedia.com/images/251161M213015_1/essentials-black-jersey-crewneck-t-shirt.jpg',
        },
        {
          url: 'https://res.cloudinary.com/ssenseweb/image/upload/b_white,c_lpad,g_south,h_706,w_470/c_scale,h_480/v550/251161M213015_1.jpg',
        },
      ],
      url: ssenseUrl,
      price: 85,
      priceCurrency: 'CAD',
      sku: '251161M213015',
      availability: 'InStock',
      metadata: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        productID: 16693101,
        offers: {
          '@type': 'Offer',
          price: 85,
          priceCurrency: 'CAD',
          availability: 'https://schema.org/InStock',
          url: '/en-ca/men/product/essentials/black-jersey-crewneck-t-shirt/16693101',
        },
        favicon:
          'https://res.cloudinary.com/ssenseweb/image/upload/v1472005257/web/favicon.ico',
      },
    });
  });

  it('prefers Amazon site rules over its generic meta tags', () => {
    expect(scrape(amazonUrl, amazonHtml)).toEqual({
      name: 'Tarcury WW2 F4U Corsair Fighter Bomber Building Bricks - 550 PCS Army Toy Set with 1 Toy Soldiers - Engaging WWII Toys for Kids and Adults',
      brand: 'Tarcury',
      url: 'https://www.amazon.ca/Tarcury-Corsair-Fighter-Bomber-Building/dp/B0CNT488KH',
      description:
        'Tarcury WW2 F4U Corsair Fighter Bomber Building Bricks - 550 PCS Army Toy Set with 1 Toy Soldiers - Engaging WWII Toys for Kids and Adults in Building Sets.',
      price: 29.99,
      priceCurrency: 'CAD',
      sku: 'B0CNT488KH',
      availability: 'InStock',
      images: [
        {
          url: 'https://m.media-amazon.com/images/I/61rbW2eIt3L._AC_SX679_.jpg',
          width: 679,
          height: 679,
        },
      ],
      metadata: { category: 'gl_toy' },
    });
  });
});
