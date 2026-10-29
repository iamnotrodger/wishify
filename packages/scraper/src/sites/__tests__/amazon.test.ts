import { describe, expect, it } from 'vitest';
import { findSite } from '..';
import amazonHtml from '../../__tests__/data/amazon.html?raw';
import { amazonUrl, parseHtml } from '../../__tests__/helpers';
import { amazon } from '../amazon';

describe('amazon', () => {
  it.each([
    'https://www.amazon.com/dp/1',
    'https://www.amazon.ca/dp/1',
    'https://www.amazon.co.uk/dp/1',
    'https://smile.amazon.de/dp/1',
  ])('handles %s', (url) => {
    expect(findSite(new URL(url))).toBe(amazon);
  });

  it('ignores other sites', () => {
    expect(findSite(new URL('https://notamazon.com/dp/1'))).toBeUndefined();
    expect(findSite(new URL('https://example.com/dp/1'))).toBeUndefined();
  });

  it('extracts the product from the page markup', () => {
    expect(amazon.extract(parseHtml(amazonHtml), new URL(amazonUrl))).toEqual({
      name: 'Tarcury WW2 F4U Corsair Fighter Bomber Building Bricks - 550 PCS Army Toy Set with 1 Toy Soldiers - Engaging WWII Toys for Kids and Adults',
      brand: 'Tarcury',
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

describe('amazon fallbacks', () => {
  const pageUrl = new URL('https://www.amazon.com/dp/1');
  const extract = (html: string) => amazon.extract(parseHtml(html), pageUrl);

  it('reads the brand from the byline', () => {
    expect(extract('<a id="bylineInfo">Visit the Lego Store</a>').brand).toBe(
      'Lego'
    );
    expect(extract('<a id="bylineInfo">Brand: Lego</a>').brand).toBe('Lego');
  });

  it.each([
    ['In Stock', 'InStock'],
    ['Only 3 left in stock - order soon.', 'InStock'],
    ['Currently unavailable.', 'OutOfStock'],
    ['Temporarily out of stock.', 'OutOfStock'],
    ['Pre-order now', 'PreOrder'],
  ])('maps stock text "%s" to %s', (text, availability) => {
    expect(extract(`<div id="availability">${text}</div>`).availability).toBe(
      availability
    );
  });

  it('falls back to the largest landing image without a gallery', () => {
    const sizes = JSON.stringify({
      '/i/s.jpg': [100, 100],
      '/i/l.jpg': [500, 400],
    });
    expect(
      extract(`<img id="landingImage" data-a-dynamic-image='${sizes}' />`)
        .images
    ).toEqual([
      { url: 'https://www.amazon.com/i/l.jpg', width: 500, height: 400 },
    ]);
  });

  it('falls back to the image src without size data', () => {
    expect(extract('<img id="landingImage" src="/i/a.jpg" />').images).toEqual([
      { url: 'https://www.amazon.com/i/a.jpg' },
    ]);
  });
});
