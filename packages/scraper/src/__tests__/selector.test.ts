import { describe, expect, it } from 'vitest';
import {
  extractBySelectors,
  findAllBySelectors,
  findBySelectors,
} from '../selector';
import { parseHtml } from './helpers';

describe('findBySelectors', () => {
  it('reads the text of the first matching selector', () => {
    const doc = parseHtml('<div class="test">Hello</div>');
    expect(findBySelectors(doc, [{ selector: '.test' }])).toBe('Hello');
  });

  it('returns undefined when nothing matches', () => {
    const doc = parseHtml('<div class="test">Hello</div>');
    expect(findBySelectors(doc, [{ selector: '.missing' }])).toBeUndefined();
  });

  it('reads only the first matching element, not all of them', () => {
    const doc = parseHtml('<h1>Shoe</h1><h1>Related item</h1>');
    expect(findBySelectors(doc, [{ selector: 'h1' }])).toBe('Shoe');
  });

  it('collapses whitespace in text content', () => {
    const doc = parseHtml('<h1>\n  Big \n  Shoe  </h1>');
    expect(findBySelectors(doc, [{ selector: 'h1' }])).toBe('Big Shoe');
  });

  it('reads the first present attribute from a list', () => {
    const doc = parseHtml('<img src="src.jpg" data-src="lazy.jpg" />');
    expect(
      findBySelectors(doc, [
        { selector: 'img', attribute: ['data-src', 'src'] },
      ])
    ).toBe('lazy.jpg');
    expect(
      findBySelectors(doc, [{ selector: 'img', attribute: ['srcset', 'src'] }])
    ).toBe('src.jpg');
  });

  it('falls through to the next selector when a match is empty', () => {
    const doc = parseHtml('<span id="a"></span><span id="b">B</span>');
    expect(findBySelectors(doc, [{ selector: '#a' }, { selector: '#b' }])).toBe(
      'B'
    );
  });
});

describe('findAllBySelectors', () => {
  it('reads every element matching the first selector that has values', () => {
    const doc = parseHtml(`
      <img class="secure" />
      <img class="og" src="a.jpg" /><img class="og" src="b.jpg" />
      <img class="twitter" src="c.jpg" />
    `);
    expect(
      findAllBySelectors(doc, [
        { selector: '.secure', attribute: 'src' },
        { selector: '.og', attribute: 'src' },
        { selector: '.twitter', attribute: 'src' },
      ])
    ).toEqual(['a.jpg', 'b.jpg']);
  });

  it('returns nothing when nothing matches', () => {
    expect(findAllBySelectors(parseHtml(''), [{ selector: 'img' }])).toEqual(
      []
    );
  });
});

describe('extractBySelectors', () => {
  it('maps Product fields and collects other keys into metadata', () => {
    const doc = parseHtml(`
      <h1 id="title">Shoe</h1>
      <span id="price">$49.50</span>
      <input id="currency" value="cad" />
      <img id="main" src="/img/shoe.jpg" />
      <input id="category" value="footwear" />
    `);

    expect(
      extractBySelectors(doc, new URL('https://shop.com/p/1'), {
        name: [{ selector: '#title' }],
        price: [{ selector: '#price' }],
        priceCurrency: [{ selector: '#currency', attribute: 'value' }],
        image: [{ selector: '#main', attribute: 'src' }],
        category: [{ selector: '#category', attribute: 'value' }],
      })
    ).toEqual({
      name: 'Shoe',
      price: 49.5,
      priceCurrency: 'CAD',
      images: [{ url: 'https://shop.com/img/shoe.jpg' }],
      metadata: { category: 'footwear' },
    });
  });
});
