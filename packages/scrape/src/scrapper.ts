import * as cheerio from 'cheerio';

export interface Image {
  url: string;
  width?: string;
  height?: string;
}

export interface ScraperContract {
  getName(): string | null;
  getPrice(): string | null;
  getImages(): Image[] | null;
  getCurrency(): string | null;
  getMetadata(): Record<string, string> | null;
}

export default class Scrapper implements ScraperContract {
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
