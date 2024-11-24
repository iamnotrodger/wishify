import * as cheerio from 'cheerio';
import { parseCurrency, parseNum, parseURL } from './lib/parse';
import { findBySelectors } from './lib/utils';
import { Product, Scraper } from './types';

export default class AmazonScraper implements Scraper {
  $: cheerio.CheerioAPI;
  url: URL;

  constructor(url: string, html: string) {
    this.$ = cheerio.load(html);
    this.url = new URL(url);
  }

  getProduct(): Product {
    const name = findBySelectors(this.$, [
      {
        selector: '#productTitle',
        attribute: 'value',
      },
      {
        selector: '[name="productTitle"]',
        attribute: 'value',
      },
    ]);

    const price = findBySelectors(this.$, [
      {
        selector: '#priceValue',
        attribute: 'value',
      },
      {
        selector: '[name="priceValue"]',
        attribute: 'value',
      },
    ]);

    const currency = findBySelectors(this.$, [
      {
        selector: '#currencyOfPreference',
        attribute: 'value',
      },
      {
        selector: '[name="currencyOfPreference"]',
        attribute: 'value',
      },
    ]);

    const image = findBySelectors(this.$, [
      { selector: 'img#landingImage', attribute: 'src' },
      { selector: '#imgTagWrapperId img', attribute: 'src' },
      { selector: '[name="productImageUrl"]', attribute: 'value' },
    ]);

    const category = findBySelectors(this.$, [
      {
        selector: '#productCategory',
        attribute: 'value',
      },
    ]);

    const imageURL = parseURL(image, this.url.hostname);

    const product = {
      name,
      images: imageURL ? [{ url: imageURL }] : undefined,
      price: parseNum(price) || undefined,
      currency: parseCurrency(currency) || undefined,
      metadata: {
        category,
      },
    };

    return JSON.parse(JSON.stringify(product));
  }
}
