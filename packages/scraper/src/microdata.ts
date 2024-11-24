import * as cheerio from 'cheerio';
import { findBySelectors } from './lib/utils';
import { Scraper } from './types';
import { parseCurrency, parseNum, parseURL } from './lib/parse';

export default class MicrodataScraper implements Scraper {
  $: cheerio.CheerioAPI;
  url: URL;

  constructor(url: string, html: string) {
    this.$ = cheerio.load(html);
    this.url = new URL(url);
  }

  getProduct() {
    const name = findBySelectors(this.$, [
      {
        selector: '[itemType*=Product] [itemProp=name]',
        attribute: 'content',
      },
      {
        selector: '[itemType*=Product] [itemProp=name]',
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

    const image = findBySelectors(this.$, [
      {
        selector: '[itemType*=Product] [itemProp=image]',
        attribute: ['data-src', 'href', 'src', 'content', 'srcset'],
      },
    ]);

    const imageURL = parseURL(image, this.url.hostname);

    const product = {
      name,
      description,
      images: imageURL ? [{ url: imageURL }] : undefined,
      price: parseNum(price) || undefined,
      currency: parseCurrency(currency) || undefined,
    };

    return JSON.parse(JSON.stringify(product));
  }
}
