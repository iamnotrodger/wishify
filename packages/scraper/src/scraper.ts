import * as cheerio from 'cheerio';
import { Scraper, Image } from './types';

export default class ProductScraper implements Scraper {
  $: cheerio.CheerioAPI;

  constructor(html: string) {
    this.$ = cheerio.load(html);
  }

  getName(): string | null {
    throw new Error('Method not implemented.');
  }

  getPrice(): string | null {
    throw new Error('Method not implemented.');
  }

  getCurrency(): string | null {
    throw new Error('Method not implemented.');
  }

  getImages(): Image[] | null {
    throw new Error('Method not implemented.');
  }

  getMetadata(): Record<string, string> | null {
    const titleSelectors = [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
    ].join(',');
    const title =
      this.$(titleSelectors).attr('content') || this.$('title').text();

    const descriptionSelectors = [
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
    ].join(',');
    const description = this.$(descriptionSelectors).attr('content');

    const url =
      this.$('meta[property="og:url"]').attr('content') ||
      this.$('link[rel="canonical"]').attr('href');

    const imageSelectors = [
      'meta[property="og:image:secure_url"]',
      'meta[property="og:image:url"]',
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
    ].join(',');
    const image = this.$(imageSelectors).attr('content');

    const priceSelectors = [
      'meta[property="og:image:secure_url"]',
      'meta[property="og:image:url"]',
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
    ].join(',');
    const price = this.$(priceSelectors).attr('content');

    const currency = this.$('meta[property="product:price:currency"]').attr(
      'content'
    );

    const favicon =
      this.$('link[rel*="icon" i]').attr('href') ||
      this.$('meta[name*="msapplication"]').attr('content');

    return Object.fromEntries(
      Object.entries({
        title,
        description,
        url,
        image,
        price,
        currency,
        favicon,
      }).filter(([_, value]) => value != null)
    ) as Record<string, string>;
  }
}
