import Scrapper, { ScraperContract, Image } from './scrapper';

export default class AmazonScrapper implements ScraperContract {
  private scrapper: Scrapper;

  constructor(html: string) {
    this.scrapper = new Scrapper(html);
  }

  getName(): string | null {
    return this.scrapper.$('span#productTitle').text().trim();
  }

  getPrice(): string | null {
    return this.scrapper
      .$('span#priceValue')
      .first()
      .text()
      .replace(/[^\d.]+/g, '');
  }

  getCurrency(): string | null {
    return this.scrapper.getCurrency();
  }

  getImages(): Image[] | null {
    const url = this.scrapper.$('img#landingImage').attr('src');
    return url ? [{ url }] : null;
  }

  getMetadata(): Record<string, string> | null {
    return this.scrapper.getMetadata();
  }
}
