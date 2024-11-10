import Scrapper, { ScraperContract, Image } from './scrapper';

export default class FacebookMarketScrapper implements ScraperContract {
  private scrapper: Scrapper;

  constructor(html: string) {
    this.scrapper = new Scrapper(html);
  }

  getName(): string | null {
    return this.scrapper.getName();
  }

  getPrice(): string | null {
    return this.scrapper.getPrice();
  }

  getCurrency(): string | null {
    return this.scrapper.getCurrency();
  }

  getImages(): Image[] | null {
    return this.scrapper.getImages();
  }

  getMetadata(): Record<string, string> | null {
    return this.scrapper.getMetadata();
  }
}
