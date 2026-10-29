import { parseCurrency, parseNum, parseURL } from './lib/parse';
import { normalizeText, removeNullAndUndefined, toImages } from './lib/utils';
import { Json, Product } from './types';

export type Selector = { selector: string; attribute?: string | string[] };

const readElement = (element: Element, attribute?: string | string[]) => {
  if (!attribute) return normalizeText(element.textContent);
  const attributes = Array.isArray(attribute) ? attribute : [attribute];
  return attributes.map((attr) => element.getAttribute(attr)).find(Boolean);
};

/** Value of the first selector that matches an element with a non-empty value. */
export const findBySelectors = (
  root: ParentNode,
  selectors?: Selector[]
): string | undefined => {
  if (!selectors) return undefined;

  for (const { selector, attribute } of selectors) {
    const element = root.querySelector(selector);
    if (!element) continue;

    const value = readElement(element, attribute)?.trim();
    if (value) return value;
  }
  return undefined;
};

/**
 * Builds a Product from selector lists keyed by Product field. Keys that are
 * not Product fields are collected into metadata.
 */
export const extractBySelectors = (
  doc: Document,
  pageUrl: URL,
  selectors: Record<string, Selector[]>
): Product => {
  const {
    name,
    brand,
    description,
    price,
    priceCurrency,
    image,
    ...metadataSelectors
  } = selectors;

  const metadata: Json = {};
  for (const [key, keySelectors] of Object.entries(metadataSelectors)) {
    metadata[key] = findBySelectors(doc, keySelectors);
  }

  return removeNullAndUndefined({
    name: findBySelectors(doc, name),
    brand: findBySelectors(doc, brand),
    description: findBySelectors(doc, description),
    price: parseNum(findBySelectors(doc, price)),
    priceCurrency: parseCurrency(findBySelectors(doc, priceCurrency)),
    images: toImages([parseURL(findBySelectors(doc, image), pageUrl)]),
    metadata: Object.keys(metadata).length ? metadata : null,
  });
};
