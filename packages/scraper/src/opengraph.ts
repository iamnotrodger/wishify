import * as cheerio from 'cheerio';
import { parseCurrency, parseJson, parseNum, parseURL } from './lib/parse';
import { Json, Scraper } from './types';
import { findBySelectors } from './lib/utils';

export default class OpenGraphScraper implements Scraper {
  $: cheerio.CheerioAPI;
  url: URL;

  constructor(url: string, html: string) {
    this.$ = cheerio.load(html);
    this.url = new URL(url);
  }

  getProduct() {
    const name = findBySelectors(this.$, [
      { selector: 'meta[property="og:title"]', attribute: 'content' },
      { selector: 'meta[name="twitter:title"]', attribute: 'content' },
      { selector: 'title' },
    ]);

    const description = findBySelectors(this.$, [
      { selector: 'meta[property="og:description"]', attribute: 'content' },
      { selector: 'meta[name="twitter:description"]', attribute: 'content' },
      { selector: 'meta[property="description"]', attribute: 'content' },
      { selector: 'meta[name="description"]', attribute: 'content' },
    ]);

    const image = findBySelectors(this.$, [
      {
        selector: 'meta[property="og:image:secure_url"]',
        attribute: 'content',
      },
      { selector: 'meta[property="og:image:url"]', attribute: 'content' },
      { selector: 'meta[property="og:image"]', attribute: 'content' },
      { selector: 'meta[name="twitter:image"]', attribute: 'content' },
    ]);

    const price = findBySelectors(this.$, [
      {
        selector: 'meta[property="product:price:amount"]',
        attribute: 'content',
      },
      {
        selector: 'meta[property="product:sale_price:amount"]',
        attribute: 'content',
      },
      {
        selector: 'meta[property="og:product:price:amount"]',
        attribute: 'content',
      },
    ]);

    const currency = this.$('meta[property="product:price:currency"]').attr(
      'content'
    );

    const url = findBySelectors(this.$, [
      { selector: 'meta[property="og:url"]', attribute: 'content' },
      { selector: 'link[rel="canonical"]', attribute: 'href' },
    ]);

    const brand = findBySelectors(this.$, [
      { selector: 'meta[property="og:brand"]', attribute: 'content' },
      { selector: 'meta[property="product:brand"]', attribute: 'content' },
    ]);

    const favicon = findBySelectors(this.$, [
      { selector: 'link[rel*="icon"]', attribute: 'href' },
      { selector: 'meta[name*="msapplication"]', attribute: 'content' },
    ]);

    const imageURL = parseURL(image, this.url.hostname);

    const product = {
      name,
      description,
      images: imageURL ? [{ url: imageURL }] : undefined,
      price: parseNum(price) || undefined,
      currency: parseCurrency(currency) || undefined,
      metadata: {
        url,
        favicon,
        brand,
      },
    };

    return JSON.parse(JSON.stringify(product));
  }
}
