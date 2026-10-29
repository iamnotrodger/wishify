import * as cheerio from 'cheerio';
import {
  parseAvailability,
  parseCurrency,
  parseJson,
  parseNum,
  parseString,
  parseURL,
} from './lib/parse';
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

    const {
      name,
      description,
      brand,
      image,
      url,
      sku,
      mpn,
      gtin,
      gtin8,
      gtin12,
      gtin13,
      gtin14,
      ...metadata
    } = jsonLd;
    const imageURL = parseURL(image, this.url.hostname);

    const product: Product = {
      url: parseURL(url, this.url.hostname),
      name,
      brand: brand?.name,
      description,
      sku: parseString(sku),
      gtin: parseString(gtin ?? gtin13 ?? gtin12 ?? gtin14 ?? gtin8),
      mpn: parseString(mpn),
      images: imageURL ? [{ url: imageURL }] : null,
      price: getJsonLdPrice(jsonLd),
      priceCurrency: getJsonLdCurrency(jsonLd),
      availability: getJsonLdAvailability(jsonLd),
      metadata,
    };

    return removeNullAndUndefined(product);
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

export const getJsonLdAvailability = (data: Json) => {
  if (!data.offers) return undefined;

  const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
  return parseAvailability(offer.availability);
};

export const getJsonLdPrice = (data: Json): number | undefined => {
  if (!data.offers) return undefined;

  const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
  const price = parseNum(
    offer.price || offer.highPrice || offer.priceSpecification?.price
  );

  return price || undefined;
};
