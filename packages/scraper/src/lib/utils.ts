import { Image, Product } from '../types';
import * as cheerio from 'cheerio';

export const mergeProducts = (products: Product[]): Product => {
  const product: Product = {
    name: null,
    brand: null,
    price: null,
    currency: null,
    description: null,
    images: null,
    metadata: {},
  };

  for (const p of products) {
    product.name = product.name ?? p.name;
    product.brand = product.brand ?? p.brand;
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

export const removeNullAndUndefined = (obj: any): Object => {
  const isValidValue = (value: any) =>
    value !== null && value !== undefined && !Number.isNaN(value);

  if (Array.isArray(obj)) {
    return obj.map((item) => removeNullAndUndefined(item)).filter(isValidValue);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .map(([k, v]) => [k, removeNullAndUndefined(v)])
        .filter(([_, v]) => isValidValue(v))
    );
  }
  return obj;
};
