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
    throw new Error('Method not implemented.');
  }
}
