import * as cheerio from 'cheerio';
import { parseCurrency, parseJson, parseNum, parseURL } from './lib/parse';
import { removeNullAndUndefined } from './lib/utils';
import { Json, Product, Scraper } from './types';

export default class JsonLdScraper implements Scraper {
  $: cheerio.CheerioAPI;
  url: URL;

  constructor(url: string, html: string) {
    this.$ = cheerio.load(html);
    this.url = new URL(url);
  }

  getProduct(): Product {
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
    const imageURL = parseURL(image, this.url.hostname);

    const product = {
      name,
      description,
      images: imageURL ? [{ url: imageURL }] : null,
      price: getJsonLdPrice(jsonLd),
      currency: getJsonLdCurrency(jsonLd),
      metadata: {
        brand: brand?.name,
        url: parseURL(url, this.url.hostname),
        ...metadata,
      },
    };

    return removeNullAndUndefined(product) as Product;
  }
}

export const getJsonLdProduct = (jsonLd: Json): Json | undefined => {
  const types = ['PRODUCT', 'CAR', 'HOTEL', 'BOOK'];
  const json = jsonLd['@graph'] || jsonLd;

  const isProductType = (item: Json) =>
    types.some((type) => item['@type']?.toUpperCase().includes(type));

  if (Array.isArray(json)) {
    return json.find(isProductType);
  }

  return isProductType(json) ? json : undefined;
};

export const getJsonLdCurrency = (data: Json): string | undefined => {
  if (!data.offers) return undefined;

  const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
  const currency = parseCurrency(
    offer.priceCurrency || offer.priceSpecification?.priceCurrency
  );

  return currency || undefined;
};

export const getJsonLdPrice = (data: Json): number | undefined => {
  if (!data.offers) return undefined;

  const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
  const price = parseNum(
    offer.price || offer.highPrice || offer.priceSpecification?.price
  );

  return price || undefined;
};
