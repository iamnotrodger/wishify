import * as cheerio from 'cheerio';
import { parseCurrency, parseNum, parseURL } from './lib/parse';
import { findBySelectors, removeNullAndUndefined } from './lib/utils';
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

    const brand = findBySelectors(this.$, [
      {
        selector:
          '#productOverview_feature_div table tbody tr.po-brand td:nth-child(2) span',
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
      brand,
      images: imageURL ? [{ url: imageURL }] : null,
      price: parseNum(price),
      currency: parseCurrency(currency),
      metadata: {
        category,
      },
    };

    return removeNullAndUndefined(product);
  }
}
