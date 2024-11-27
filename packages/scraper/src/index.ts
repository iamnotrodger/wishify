import * as cheerio from 'cheerio';
import JsonLdScraper from './jsonld';
import { mergeProducts, removeNullAndUndefined } from './lib/utils';
import MicrodataScraper from './microdata';
import OpenGraphScraper from './opengraph';
import { findBySelectors, Selector } from './selector';
import { Product, Scraper } from './types';
import { parseNum, parseURL } from './lib/parse';

type Selectors = Record<string, Selector[]>;

export const getProduct = (
  url: string,
  html: string,
  selectors?: Selectors
): [Product | null, Error | null] => {
  try {
    let siteProduct = {};

    if (selectors) {
      const siteScraper = new SiteScraper(url, html, selectors);
      siteProduct = siteScraper.getProduct();
    }

    const product = mergeProducts([
      new JsonLdScraper(url, html).getProduct(),
      new MicrodataScraper(url, html).getProduct(),
      new OpenGraphScraper(url, html).getProduct(),
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
  $: cheerio.CheerioAPI;
  url: URL;
  selectors: Selectors;

  constructor(url: string, html: string, selectors: Selectors) {
    this.$ = cheerio.load(html);
    this.url = new URL(url);
    this.selectors = selectors;
  }

  getProduct(): Product {
    const {
      name: nameSelectors,
      brand: brandSelectors,
      description: descriptionSelectors,
      price: priceSelectors,
      currency: currencySelectors,
      image: imageSelectors,
      ...metadataSelectors
    } = this.selectors;

    const name = findBySelectors(this.$, nameSelectors);
    const brand = findBySelectors(this.$, brandSelectors);
    const description = findBySelectors(this.$, descriptionSelectors);
    const price = findBySelectors(this.$, priceSelectors);
    const currency = findBySelectors(this.$, currencySelectors);
    const image = findBySelectors(this.$, imageSelectors);

    const metadata: Record<string, any> = {};
    for (const [key, selectors] of Object.entries(metadataSelectors)) {
      metadata[key] = findBySelectors(this.$, selectors);
    }

    const imageURL = parseURL(image, this.url.hostname);

    const product: Product = {
      name,
      brand,
      description,
      price: parseNum(price),
      currency,
      images: imageURL ? [{ url: imageURL }] : null,
      metadata: Object.keys(metadata).length ? metadata : null,
    };

    return removeNullAndUndefined(product);
  }
}
