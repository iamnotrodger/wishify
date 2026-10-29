import * as cheerio from 'cheerio';
import {
  parseAvailability,
  parseCurrency,
  parseNum,
  parseURL,
} from './lib/parse';
import { removeNullAndUndefined } from './lib/utils';
import { findBySelectors } from './selector';
import { Product, Scraper } from './types';

export default class MicrodataScraper implements Scraper {
  $: cheerio.CheerioAPI;
  url: URL;

  constructor(url: string, html: string) {
    this.$ = cheerio.load(html);
    this.url = new URL(url);
  }

  getProduct(): Product {
    const name = findBySelectors(this.$, [
      {
        selector: '[itemType*=Product] [itemProp=name]',
        attribute: 'content',
      },
      {
        selector: '[itemType*=Product] [itemProp=name]',
      },
    ]);

    const brand = findBySelectors(this.$, [
      {
        selector: '[itemType*=Product] [itemProp=brand]',
        attribute: 'content',
      },
      {
        selector: '[itemType*=Product] [itemProp=brand]',
      },
    ]);

    const description = findBySelectors(this.$, [
      {
        selector: '[itemType*=Product] [itemProp=description]',
        attribute: 'content',
      },
      {
        selector: '[itemType*=Product] [itemProp=description]',
      },
    ]);

    const price = findBySelectors(this.$, [
      {
        selector: '[itemType*=Product] [itemType*=ffer] [itemProp=price]',
        attribute: 'content',
      },
      {
        selector: '[itemType*=Product] [itemType*=ffer] [itemProp=price]',
      },
    ]);

    const currency = findBySelectors(this.$, [
      {
        selector:
          '[itemType*=Product] [itemType*=ffer] [itemProp=priceCurrency]',
        attribute: 'content',
      },
      {
        selector:
          '[itemType*=Product] [itemType*=ffer] [itemProp=priceCurrency]',
      },
    ]);

    const availability = findBySelectors(this.$, [
      {
        selector:
          '[itemType*=Product] [itemType*=ffer] [itemProp=availability]',
        attribute: ['href', 'content'],
      },
    ]);

    const productProp = (prop: string) =>
      findBySelectors(this.$, [
        {
          selector: `[itemType*=Product] [itemProp=${prop}]`,
          attribute: 'content',
        },
        { selector: `[itemType*=Product] [itemProp=${prop}]` },
      ]);

    const image = findBySelectors(this.$, [
      {
        selector: '[itemType*=Product] [itemProp=image]',
        attribute: ['data-src', 'href', 'src', 'content', 'srcset'],
      },
    ]);

    const imageURL = parseURL(image, this.url.hostname);

    const product: Product = {
      name,
      brand,
      description,
      images: imageURL ? [{ url: imageURL }] : null,
      sku: productProp('sku'),
      gtin:
        productProp('gtin') ??
        productProp('gtin13') ??
        productProp('gtin12') ??
        productProp('gtin14') ??
        productProp('gtin8'),
      mpn: productProp('mpn'),
      price: parseNum(price),
      priceCurrency: parseCurrency(currency),
      availability: parseAvailability(availability),
    };

    return removeNullAndUndefined(product);
  }
}
