import { parseNum } from './lib/parse';
import { findBySelectors } from './lib/utils';
import ProductScraper from './scraper';
import { Image, Product, Scraper } from './types';

export default class AmazonScraper implements Scraper {
  private scrapper: ProductScraper;

  constructor(url: string, html: string) {
    this.scrapper = new ProductScraper(url, html);
  }

  getName() {
    return this.scrapper.$('#productTitle').text().trim();
  }

  getPrice() {
    return this.scrapper
      .$('span.a-offscreen')
      .first()
      .text()
      .replace(/[^\d.]+/g, '');
  }

  getCurrency(): string | null {
    return null;
  }

  getImages(): Image[] | undefined {
    const urlSelectors = ['img#landingImage', '#imgTagWrapperId img'].join(',');
    const url = this.scrapper.$(urlSelectors).attr('src');
    return url ? [{ url }] : undefined;
  }

  getHTMLData(): Product {
    const name = this.getName();
    const price = this.getPrice();
    const currency = this.getCurrency();
    const images = this.getImages();

    return {
      name,
      currency: currency || undefined,
      images: images,
      price: parseNum(price) || undefined,
    };
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

  getMetaPixel(): Product {
    return this.scrapper.getMetaPixel();
  }
}
