import {
  parseAvailability,
  parseCurrency,
  parseJson,
  parseNum,
  parseString,
  parseURL,
} from './lib/parse';
import { removeNullAndUndefined, toImages } from './lib/utils';
import { Json, Product } from './types';

const productTypes = [
  'Product',
  'ProductGroup',
  'ProductModel',
  'IndividualProduct',
  'SomeProducts',
  'Car',
  'Vehicle',
  'Book',
  'Hotel',
].map((type) => type.toLowerCase());

const toArray = <T>(value: T | T[] | undefined | null): T[] => {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
};

const isProductType = (item: Json) =>
  toArray<unknown>(item?.['@type']).some(
    (type) =>
      typeof type === 'string' && productTypes.includes(type.toLowerCase())
  );

export const getJsonLdProduct = (jsonLd: Json | Json[]): Json | undefined => {
  const items = Array.isArray(jsonLd)
    ? jsonLd.flatMap((item) => toArray(item?.['@graph'] ?? item))
    : toArray(jsonLd['@graph'] ?? jsonLd);
  return items.find(isProductType);
};

const getOffer = (data: Json): Json | undefined => toArray(data.offers)[0];

export const getJsonLdCurrency = (data: Json): string | undefined => {
  const offer = getOffer(data);
  return (
    parseCurrency(
      offer?.priceCurrency ?? offer?.priceSpecification?.priceCurrency
    ) ?? undefined
  );
};

export const getJsonLdAvailability = (data: Json) =>
  parseAvailability(getOffer(data)?.availability);

export const getJsonLdPrice = (data: Json): number | undefined => {
  const offer = getOffer(data);
  const price = parseNum(
    offer?.price ??
      offer?.lowPrice ??
      offer?.highPrice ??
      offer?.priceSpecification?.price
  );
  return Number.isFinite(price) ? price : undefined;
};

const getBrand = (brand: unknown) => {
  const first = toArray(brand)[0];
  if (typeof first === 'string') return first;
  return parseString((first as Json | undefined)?.name);
};

// image may be a URL, an ImageObject, or a list of either.
const getImageURLs = (image: unknown, pageUrl: URL) =>
  toArray(image).map((item) =>
    parseURL(typeof item === 'string' ? item : (item as Json)?.url, pageUrl)
  );

const findProduct = (doc: Document): Json => {
  let product: Json | undefined;

  for (const script of doc.querySelectorAll(
    'script[type="application/ld+json"]'
  )) {
    const json = script.textContent && parseJson(script.textContent);
    if (!json) continue;

    const current = getJsonLdProduct(json);
    if (!current) continue;

    // The first product is the page's; later ones are usually related items,
    // unless they describe the same @id.
    if (!product) {
      product = current;
    } else if (product['@id'] && product['@id'] === current['@id']) {
      product = { ...product, ...current };
    }
  }

  return product ?? {};
};

export const extractJsonLd = (doc: Document, pageUrl: URL): Product => {
  const jsonLd = findProduct(doc);
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

  return removeNullAndUndefined({
    url: parseURL(url, pageUrl),
    name: parseString(name),
    brand: getBrand(brand),
    description: parseString(description),
    sku: parseString(sku),
    gtin: parseString(gtin ?? gtin13 ?? gtin12 ?? gtin14 ?? gtin8),
    mpn: parseString(mpn),
    images: toImages(getImageURLs(image, pageUrl)),
    price: getJsonLdPrice(jsonLd),
    priceCurrency: getJsonLdCurrency(jsonLd),
    availability: getJsonLdAvailability(jsonLd),
    metadata,
  });
};
