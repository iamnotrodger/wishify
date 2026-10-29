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

  it('keeps at most 8 images', () => {
    const images = Array.from(
      { length: 10 },
      (_, i) =>
        `<meta property="og:image" content="https://example.com/${i}.jpg" />`
    ).join('');
    expect(scrape('https://example.com/p', images).images).toHaveLength(8);
  });

  it('combines SSENSE site rules, JSON-LD and OpenGraph', () => {
    expect(scrape(ssenseUrl, ssenseHtml)).toEqual({
      name: 'Black Jersey Crewneck T-shirt',
      brand: 'Fear of God ESSENTIALS',
      description: ssenseDescription,
      // The gallery replaces the structured data's copies of the first photo.
      images: [1, 2, 3, 4, 5].map((n) => ({
        url: `https://img.ssensemedia.com/images/b_white,c_lpad,g_center,h_1412,w_940/c_scale,h_960/f_auto,dpr_2.0/251161M213015_${n}/fear-of-god-essentials-black-jersey-crewneck-t-shirt.jpg`,
      })),
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
        '61rbW2eIt3L',
        '71N-ssQhylL',
        '71Z8VWZ84pL',
        '710aWNLso+L',
        '71p-0vOHlOL',
        '71Tnn-fq9+L',
        '81X2SA8Yu0L',
      ].map((id) => ({
        url: `https://m.media-amazon.com/images/I/${id}._AC_SL1500_.jpg`,
      })),
      metadata: { category: 'gl_toy' },
    });
  });
});
