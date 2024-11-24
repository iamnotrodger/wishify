import { parseCurrency, parseNum, parseURL } from './lib/parse';
import { findBySelectors } from './lib/utils';
import ProductScraper from './scraper';
import { Image, Product, Scraper } from './types';

export default class AmazonScraper implements Scraper {
  private scrapper: ProductScraper;

  constructor(url: string, html: string) {
    this.scrapper = new ProductScraper(url, html);
  }

  getHTMLData(): Product {
    const name = findBySelectors(this.scrapper.$, [
      {
        selector: '#productTitle',
        attribute: 'value',
      },
      {
        selector: '[name="productTitle"]',
        attribute: 'value',
      },
    ]);

    const price = findBySelectors(this.scrapper.$, [
      {
        selector: '#priceValue',
        attribute: 'value',
      },
      {
        selector: '[name="priceValue"]',
        attribute: 'value',
      },
    ]);

    const currency = findBySelectors(this.scrapper.$, [
      {
        selector: '#currencyOfPreference',
        attribute: 'value',
      },
      {
        selector: '[name="currencyOfPreference"]',
        attribute: 'value',
      },
    ]);

    const image = findBySelectors(this.scrapper.$, [
      { selector: 'img#landingImage', attribute: 'src' },
      { selector: '#imgTagWrapperId img', attribute: 'src' },
      { selector: '[name="productImageUrl"]', attribute: 'value' },
    ]);

    const category = findBySelectors(this.scrapper.$, [
      {
        selector: '#productCategory',
        attribute: 'value',
      },
    ]);

    const imageURL = parseURL(image, this.scrapper.hostname);

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

  getMetadata() {
    return this.scrapper.getMetadata();
  }

  getJsonLd() {
    return this.scrapper.getJsonLd();
  }

  getMicrodata() {
    return this.scrapper.getMicrodata();
  }
}
