import * as cheerio from 'cheerio';
import { Json, Product, Scraper } from './types';
import {
  getJsonLdProduct,
  getHostname,
  getJsonLdCurrency,
  getJsonLdPrice,
  findBySelectors,
} from './lib/utils';
import { parseCurrency, parseJson, parseNum, parseURL } from './lib/parse';

export default class ProductScraper implements Scraper {
  $: cheerio.CheerioAPI;
  hostname: string;

  constructor(url: string, html: string) {
    this.$ = cheerio.load(html);
    this.hostname = getHostname(url);
  }

  getHTMLData() {
    return {};
  }

  getMetadata(): Product {
    const name = findBySelectors(this.$, [
      { selector: 'meta[property="og:title"]', attribute: 'content' },
      { selector: 'meta[name="twitter:title"]', attribute: 'content' },
      { selector: 'title' },
    ]);

    const description = findBySelectors(this.$, [
      { selector: 'meta[property="og:description"]', attribute: 'content' },
      { selector: 'meta[name="twitter:description"]', attribute: 'content' },
      { selector: 'meta[property="description"]', attribute: 'content' },
    ]);

    const image = findBySelectors(this.$, [
      {
        selector: 'meta[property="og:image:secure_url"]',
        attribute: 'content',
      },
      { selector: 'meta[property="og:image:url"]', attribute: 'content' },
      { selector: 'meta[property="og:image"]', attribute: 'content' },
      { selector: 'meta[name="twitter:image"]', attribute: 'content' },
    ]);

    const price = findBySelectors(this.$, [
      {
        selector: 'meta[property="product:price:amount"]',
        attribute: 'content',
      },
      {
        selector: 'meta[property="product:sale_price:amount"]',
        attribute: 'content',
      },
      {
        selector: 'meta[property="og:product:price:amount"]',
        attribute: 'content',
      },
    ]);

    const currency = this.$('meta[property="product:price:currency"]').attr(
      'content'
    );

    const url = findBySelectors(this.$, [
      { selector: 'meta[property="og:url"]', attribute: 'content' },
      { selector: 'link[rel="canonical"]', attribute: 'href' },
    ]);

    const brand = findBySelectors(this.$, [
      { selector: 'meta[property="og:brand"]', attribute: 'content' },
      { selector: 'meta[property="product:brand"]', attribute: 'content' },
    ]);

    const favicon = findBySelectors(this.$, [
      { selector: 'link[rel*="icon"]', attribute: 'href' },
      { selector: 'meta[name*="msapplication"]', attribute: 'content' },
    ]);

    const imageURL = parseURL(image, this.hostname);

    const product = {
      name,
      description,
      images: imageURL ? [{ url: imageURL }] : null,
      price: parseNum(price),
      currency: parseCurrency(currency),
      metadata: {
        url,
        favicon,
        brand,
      },
    };

    return JSON.parse(JSON.stringify(product));
  }

  getJsonLd(): Product {
    let jsonLd: Json = {};

    this.$('[type="application/ld+json"]').each((_, element) => {
      const rawContent = this.$(element).html();
      if (!rawContent) return;

      const rawJsonLd = parseJson(rawContent);
      if (!rawJsonLd) return;

      const currentJsonLd = getJsonLdProduct(rawJsonLd);
      if (!currentJsonLd) return;

      if (!jsonLd['@id'] || jsonLd['@id'] == currentJsonLd['@id']) {
        jsonLd = { ...jsonLd, ...currentJsonLd };
      }
    });

    const { name, description, brand, image, url, ...metadata } = jsonLd;
    const imageURL = parseURL(image, this.hostname);

    const product = {
      name,
      description,
      images: imageURL ? [{ url: imageURL }] : undefined,
      price: getJsonLdPrice(jsonLd),
      currency: getJsonLdCurrency(jsonLd),
      metadata: {
        brand: brand?.name,
        url: parseURL(url, this.hostname) || undefined,
        ...metadata,
      },
    };

    return JSON.parse(JSON.stringify(product));
  }

  getMicrodata(): Product {
    return {};
  }

  getMetaPixel(): Product {
    return {};
  }
}
