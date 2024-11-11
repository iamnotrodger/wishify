import AmazonScraper from './amazon';
import ProductScraper from './scraper';
import { Scraper } from './types';

export default class ScraperFactory {
  static createScraper(url: string, html: string): Scraper {
    if (url.includes('amazon')) {
      return new AmazonScraper(html);
    }
    return new ProductScraper(html);
  }
}
