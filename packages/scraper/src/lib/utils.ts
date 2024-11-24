import { Image, Json, Product } from '@/types';
import * as cheerio from 'cheerio';
import { parseCurrency, parseNum } from './parse';

export const getHostname = (url: string): string => {
  return new URL(url).hostname;
};

export const mergeProducts = (products: Product[]): Product => {
  const product: Product = {
    name: null,
    price: null,
    currency: null,
    description: null,
    images: null,
    metadata: {},
  };

  for (const p of products) {
    product.name = product.name ?? p.name;
    product.description = product.description ?? p.description;
    product.price = product.price ?? p.price;
    product.currency = product.currency ?? p.currency;

    if (p.metadata) product.metadata = { ...p.metadata, ...product.metadata };
    if (p.images) product.images = mergeImages(product.images || [], p.images);
  }

  return product;
};

const mergeImages = (baseImages: Image[], newImages: Image[]): Image[] => {
  const imageMap = new Map<string, Image>();

  baseImages.reduce((map, img) => {
    map.set(img.url, img);
    return map;
  }, imageMap);

  for (const image of newImages) {
    const existingImage = imageMap.get(image.url);

    if (!existingImage) {
      imageMap.set(image.url, image);
    } else {
      const width = existingImage.width ?? image.width;
      const height = existingImage.height ?? image.height;
      const updatedImage = { ...existingImage };

      if (width != null) updatedImage.width = width;
      if (height != null) updatedImage.height = height;

      imageMap.set(image.url, updatedImage);
    }
  }

  return Array.from(imageMap.values());
};

export const normalizeText = (text?: string | null) => {
  if (!text) return text;
  return text.trim().replace(/\s+/g, ' ').trim();
};

type Selector = { selector: string; attribute?: string | string[] };

export const findBySelectors = (
  $: cheerio.CheerioAPI,
  selectors: Selector[]
) => {
  for (const { selector, attribute } of selectors) {
    const element = $(selector);
    if (!element.length) continue;

    let value: string | undefined;
    if (Array.isArray(attribute)) {
      value = attribute.map((attr) => element.attr(attr)).find(Boolean);
    } else {
      value = attribute ? element.attr(attribute) : element.text();
    }

    if (value) return value.trim();
  }
  return undefined;
};

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
