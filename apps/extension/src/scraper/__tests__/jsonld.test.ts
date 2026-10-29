import { describe, expect, it } from 'vitest';
import {
  extractJsonLd,
  getJsonLdCurrency,
  getJsonLdPrice,
  getJsonLdProduct,
} from '../jsonld';
import { normalizeText } from '../lib/utils';
import ssenseHtml from './data/ssense.html?raw';
import { parseHtml, ssenseDescription, ssenseUrl } from './helpers';

const pageUrl = new URL('https://example.com/p/shoes/123');
const ldScript = (json: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(json)}</script>`;
const extract = (...blocks: unknown[]) =>
  extractJsonLd(parseHtml(blocks.map(ldScript).join('')), pageUrl);

describe('extractJsonLd', () => {
  it('maps a schema.org Product with its Offer', () => {
    expect(
      extract({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: 'Test Product',
        description: 'Product description',
        image: 'https://example.com/image.jpg',
        brand: { name: 'Test Brand' },
        offers: { price: '89.99', priceCurrency: 'EUR' },
      })
    ).toEqual({
      name: 'Test Product',
      brand: 'Test Brand',
      description: 'Product description',
      images: [{ url: 'https://example.com/image.jpg' }],
      price: 89.99,
      priceCurrency: 'EUR',
      metadata: {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        offers: { price: '89.99', priceCurrency: 'EUR' },
      },
    });
  });

  it('accepts @type given as a list', () => {
    expect(extract({ '@type': ['Product', 'Thing'], name: 'A' }).name).toBe(
      'A'
    );
  });

  it('ignores types that merely contain a product type name', () => {
    expect(extract({ '@type': 'CreditCard', name: 'Card' }).name).toBe(
      undefined
    );
  });

  it('skips unparseable blocks instead of failing the page', () => {
    const html =
      '<script type="application/ld+json">{{{</script>' +
      ldScript({ '@type': 'Product', name: 'A' });
    expect(extractJsonLd(parseHtml(html), pageUrl).name).toBe('A');
  });

  it('keeps the first product and ignores related products', () => {
    const product = extract(
      { '@type': 'Product', name: 'Main' },
      { '@type': 'Product', name: 'Related', sku: 'R1' }
    );
    expect(product.name).toBe('Main');
    expect(product.sku).toBeUndefined();
  });

  it('merges blocks that describe the same @id', () => {
    const product = extract(
      { '@type': 'Product', '@id': '#p', name: 'Main' },
      { '@type': 'Product', '@id': '#p', sku: 'S1' }
    );
    expect(product).toMatchObject({ name: 'Main', sku: 'S1' });
  });

  it('reads brand given as a plain string', () => {
    expect(extract({ '@type': 'Product', brand: 'Nike' }).brand).toBe('Nike');
  });

  it('reads every image from lists and ImageObjects', () => {
    expect(
      extract({
        '@type': 'Product',
        image: [
          'https://x.com/a.jpg',
          { '@type': 'ImageObject', url: '/b.jpg' },
        ],
      }).images
    ).toEqual([
      { url: 'https://x.com/a.jpg' },
      { url: 'https://example.com/b.jpg' },
    ]);
  });

  it('stringifies numeric identifiers', () => {
    expect(extract({ '@type': 'Product', gtin13: 123 }).gtin).toBe('123');
  });

  it('finds the product inside an @graph', () => {
    expect(
      extract({
        '@graph': [{ '@type': 'WebPage' }, { '@type': 'Product', name: 'G' }],
      }).name
    ).toBe('G');
  });

  it('extracts the SSENSE product and skips its article block', () => {
    const product = extractJsonLd(parseHtml(ssenseHtml), new URL(ssenseUrl));
    product.description = normalizeText(product.description);

    expect(product).toEqual({
      name: 'Black Jersey Crewneck T-shirt',
      brand: 'Fear of God ESSENTIALS',
      description: ssenseDescription,
      images: [
        {
          url: 'https://img.ssensemedia.com/images/251161M213015_1/essentials-black-jersey-crewneck-t-shirt.jpg',
        },
      ],
      url: ssenseUrl,
      sku: '251161M213015',
      price: 85,
      priceCurrency: 'CAD',
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
      },
    });
  });
});

describe('getJsonLdProduct', () => {
  it('returns undefined when no product is present', () => {
    expect(
      getJsonLdProduct({ '@graph': [{ '@type': 'Person', name: 'John' }] })
    ).toBeUndefined();
  });

  it('searches top-level arrays of items', () => {
    expect(getJsonLdProduct([{ '@type': 'Product', name: 'P' }])).toEqual({
      '@type': 'Product',
      name: 'P',
    });
  });
});

describe('getJsonLdPrice', () => {
  it('reads price from the first offer', () => {
    expect(getJsonLdPrice({ offers: [{ price: 100 }, { price: 200 }] })).toBe(
      100
    );
  });

  it('keeps a price of zero', () => {
    expect(getJsonLdPrice({ offers: { price: 0 } })).toBe(0);
  });

  it('uses the lowest price of an AggregateOffer', () => {
    expect(
      getJsonLdPrice({ offers: { lowPrice: '10', highPrice: '20' } })
    ).toBe(10);
  });

  it('returns undefined without a price', () => {
    expect(getJsonLdPrice({ offers: {} })).toBeUndefined();
    expect(getJsonLdPrice({})).toBeUndefined();
  });
});

describe('getJsonLdCurrency', () => {
  it('reads priceCurrency from the offer', () => {
    expect(getJsonLdCurrency({ offers: { priceCurrency: 'USD' } })).toBe('USD');
  });

  it('returns undefined without a currency', () => {
    expect(getJsonLdCurrency({ offers: {} })).toBeUndefined();
  });
});
