import { Image, Product } from '../types';

export const mergeProducts = (products: Product[]): Product => {
  const product: Product = {
    url: null,
    name: null,
    brand: null,
    description: null,
    sku: null,
    gtin: null,
    mpn: null,
    price: null,
    priceCurrency: null,
    availability: null,
    images: null,
    metadata: {},
  };

  for (const p of products) {
    product.url = product.url ?? p.url;
    product.name = product.name ?? p.name;
    product.brand = product.brand ?? p.brand;
    product.description = product.description ?? p.description;
    product.sku = product.sku ?? p.sku;
    product.gtin = product.gtin ?? p.gtin;
    product.mpn = product.mpn ?? p.mpn;
    product.price = product.price ?? p.price;
    product.priceCurrency = product.priceCurrency ?? p.priceCurrency;
    product.availability = product.availability ?? p.availability;

    if (p.metadata) product.metadata = { ...p.metadata, ...product.metadata };
    if (p.images) product.images = mergeImages(product.images || [], p.images);
  }

  return product;
};

const mergeImages = (baseImages: Image[], newImages: Image[]): Image[] => {
  const imageMap = new Map<string, Image>();

  for (const image of baseImages) imageMap.set(image.url, image);

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
  return text.replace(/\s+/g, ' ').trim();
};

export const toImages = (urls: (string | null)[]): Image[] | null => {
  const images = urls.filter((url) => url != null).map((url) => ({ url }));
  return images.length ? images : null;
};

export const removeNullAndUndefined = <T>(obj: T): T => {
  const isValidValue = (value: unknown) =>
    value !== null && value !== undefined && !Number.isNaN(value);

  if (Array.isArray(obj)) {
    return obj
      .map((item) => removeNullAndUndefined(item))
      .filter(isValidValue) as T;
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .map(([k, v]) => [k, removeNullAndUndefined(v)])
        .filter(([, v]) => isValidValue(v))
    ) as T;
  }
  return obj;
};
