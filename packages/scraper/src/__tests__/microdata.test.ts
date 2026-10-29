import { describe, expect, it } from 'vitest';
import { extractMicrodata } from '../microdata';
import { parseHtml } from './helpers';

const pageUrl = new URL('http://example.com/p/1');
const extract = (html: string) => extractMicrodata(parseHtml(html), pageUrl);

describe('extractMicrodata', () => {
  it('maps a schema.org Product with its Offer', () => {
    expect(
      extract(`
        <div itemscope itemtype="http://schema.org/Product">
          <span itemprop="name">Example Product</span>
          <img itemprop="image" src="/image.jpg" />
          <div itemprop="description">Example Description</div>
          <meta itemprop="sku" content="SKU1" />
          <div itemprop="offers" itemscope itemtype="http://schema.org/Offer">
            <span itemprop="price" content="19.99">$19.99</span>
            <span itemprop="priceCurrency" content="USD">USD</span>
            <link itemprop="availability" href="https://schema.org/InStock" />
          </div>
        </div>
      `)
    ).toEqual({
      name: 'Example Product',
      description: 'Example Description',
      images: [{ url: 'http://example.com/image.jpg' }],
      sku: 'SKU1',
      price: 19.99,
      priceCurrency: 'USD',
      availability: 'InStock',
    });
  });

  it("does not mix a nested Brand's name into the product name", () => {
    expect(
      extract(`
        <div itemscope itemtype="https://schema.org/Product">
          <div itemprop="brand" itemscope itemtype="https://schema.org/Brand">
            <span itemprop="name">Nike</span>
          </div>
          <span itemprop="name">Shoe</span>
        </div>
      `)
    ).toEqual({ name: 'Shoe', brand: 'Nike' });
  });

  it('reads a plain-text brand', () => {
    expect(
      extract(`
        <div itemscope itemtype="https://schema.org/Product">
          <span itemprop="brand">Nike</span>
        </div>
      `).brand
    ).toBe('Nike');
  });

  it('keeps every image of the product', () => {
    expect(
      extract(`
        <div itemscope itemtype="https://schema.org/Product">
          <img itemprop="image" src="/1.jpg" />
          <img itemprop="image" data-src="/2.jpg" src="placeholder.gif" />
        </div>
      `).images
    ).toEqual([
      { url: 'http://example.com/1.jpg' },
      { url: 'http://example.com/2.jpg' },
    ]);
  });

  it('returns nothing for pages without a Product', () => {
    expect(extract('<div></div>')).toEqual({});
  });
});
