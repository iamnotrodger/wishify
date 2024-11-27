import AmazonScraper from './amazon';
import JsonLdScraper from './jsonld';
import { mergeProducts } from './lib/utils';
import MicrodataScraper from './microdata';
import OpenGraphScraper from './opengraph';
import { Product, Scraper } from './types';

export const getProduct = (
  url: string,
  html: string
): [Product | null, Error | null] => {
  try {
    const jsonLdProduct = new JsonLdScraper(url, html).getProduct();
    const microdataProduct = new MicrodataScraper(url, html).getProduct();
    const openGraphProduct = new OpenGraphScraper(url, html).getProduct();
    const siteProduct = SiteScraper.create(url, html).getProduct();

    console.log('jsonLdProduct', jsonLdProduct);
    console.log('microdataProduct', microdataProduct);
    console.log('openGraphProduct', openGraphProduct);
    console.log('siteProduct', siteProduct);

    const product = mergeProducts([
      jsonLdProduct,
      microdataProduct,
      openGraphProduct,
      siteProduct,
    ]);
    product.url = url;

    return [product, null];
  } catch (error) {
    if (error instanceof Error) {
      return [null, error];
    }
    return [null, new Error('Failed to parse product')];
  }
};

export class SiteScraper implements Scraper {
  static create(url: string, html: string): Scraper {
    if (url.includes('amazon')) {
      return new AmazonScraper(url, html);
    }
    return new SiteScraper();
  }

  getProduct(): Product {
    return {};
  }
}
