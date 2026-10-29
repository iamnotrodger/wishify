import { describe, expect, it } from 'vitest';
import { normalizeText } from '../lib/utils';
import { extractOpenGraph } from '../opengraph';
import amazonHtml from './data/amazon.html?raw';
import ssenseHtml from './data/ssense.html?raw';
import { amazonUrl, parseHtml, ssenseDescription, ssenseUrl } from './helpers';

describe('extractOpenGraph', () => {
  it('maps OpenGraph and product meta tags', () => {
    const doc = parseHtml(`
      <html>
        <head>
          <title>Test Product</title>
          <meta property="og:title" content="Test Product OG" />
          <meta property="og:description" content="Product description" />
          <meta property="og:url" content="https://example.com/product" />
          <meta property="og:image" content="https://example.com/image.jpg" />
          <meta property="product:brand" content="Example Brand"/>
          <meta property="product:price:amount" content="99.99" />
          <meta property="product:price:currency" content="USD" />
          <link rel="icon" href="favicon.ico" />
        </head>
      </html>
    `);

    expect(
      extractOpenGraph(doc, new URL('https://example.com/product'))
    ).toEqual({
      name: 'Test Product OG',
      brand: 'Example Brand',
      description: 'Product description',
      images: [{ url: 'https://example.com/image.jpg' }],
      price: 99.99,
      priceCurrency: 'USD',
      url: 'https://example.com/product',
      metadata: { favicon: 'https://example.com/favicon.ico' },
    });
  });

  it('keeps every og:image', () => {
    const doc = parseHtml(`
      <meta property="og:image" content="https://example.com/1.jpg" />
      <meta property="og:image" content="https://example.com/2.jpg" />
      <meta name="twitter:image" content="https://example.com/3.jpg" />
    `);
    expect(
      extractOpenGraph(doc, new URL('https://example.com')).images
    ).toEqual([
      { url: 'https://example.com/1.jpg' },
      { url: 'https://example.com/2.jpg' },
    ]);
  });

  it('falls back to the page title with whitespace collapsed', () => {
    const doc = parseHtml('<title>\n  Foo\n  Bar </title>');
    expect(extractOpenGraph(doc, new URL('https://x.com')).name).toBe(
      'Foo Bar'
    );
  });

  it('extracts the SSENSE meta tags', () => {
    const product = extractOpenGraph(parseHtml(ssenseHtml), new URL(ssenseUrl));
    product.description = normalizeText(product.description);

    expect(product).toEqual({
      name: 'Fear of God ESSENTIALS - Black Jersey Crewneck T-shirt',
      brand: 'Fear of God ESSENTIALS',
      description: ssenseDescription,
      images: [
        {
          url: 'https://res.cloudinary.com/ssenseweb/image/upload/b_white,c_lpad,g_south,h_706,w_470/c_scale,h_480/v550/251161M213015_1.jpg',
        },
      ],
      price: 85,
      priceCurrency: 'CAD',
      // SSENSE's own og:url repeats the locale.
      url: 'https://www.ssense.com/en-ca/en-ca/men/product/essentials/black-jersey-crewneck-t-shirt/16693101',
      metadata: {
        favicon:
          'https://res.cloudinary.com/ssenseweb/image/upload/v1472005257/web/favicon.ico',
      },
    });
  });

  it('extracts the Amazon meta tags', () => {
    expect(extractOpenGraph(parseHtml(amazonHtml), new URL(amazonUrl))).toEqual(
      {
        name: 'Tarcury WW2 F4U Corsair Fighter Bomber Building Bricks - 550 PCS Army Toy Set with 1 Toy Soldiers - Engaging WWII Toys for Kids and Adults, Building Sets - Amazon Canada',
        description:
          'Tarcury WW2 F4U Corsair Fighter Bomber Building Bricks - 550 PCS Army Toy Set with 1 Toy Soldiers - Engaging WWII Toys for Kids and Adults in Building Sets.',
        url: 'https://www.amazon.ca/Tarcury-Corsair-Fighter-Bomber-Building/dp/B0CNT488KH',
        metadata: {},
      }
    );
  });
});
