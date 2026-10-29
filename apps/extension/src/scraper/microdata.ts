import {
  parseAvailability,
  parseCurrency,
  parseNum,
  parseURL,
} from './lib/parse';
import { normalizeText, removeNullAndUndefined, toImages } from './lib/utils';
import { Product } from './types';

// Properties of nested items (e.g. a Brand's name) belong to that item, not the scope.
const findOwnProperty = (scope: Element, prop: string) =>
  Array.from(scope.querySelectorAll(`[itemprop~="${prop}"]`)).find(
    (element) => element.parentElement?.closest('[itemscope]') === scope
  );

const readProperty = (
  element: Element | undefined,
  attributes = ['content']
) => {
  if (!element) return undefined;
  const value =
    attributes.map((attr) => element.getAttribute(attr)).find(Boolean) ??
    normalizeText(element.textContent);
  return value?.trim() || undefined;
};

export const extractMicrodata = (doc: Document, pageUrl: URL): Product => {
  const product = doc.querySelector('[itemscope][itemtype*="Product" i]');
  if (!product) return {};

  const prop = (name: string) => readProperty(findOwnProperty(product, name));

  const brandElement = findOwnProperty(product, 'brand');
  const brand = brandElement?.hasAttribute('itemscope')
    ? readProperty(findOwnProperty(brandElement, 'name'))
    : readProperty(brandElement);

  const offer = findOwnProperty(product, 'offers');
  const offerProp = (name: string, attributes?: string[]) =>
    offer && readProperty(findOwnProperty(offer, name), attributes);

  const image = readProperty(findOwnProperty(product, 'image'), [
    'data-src',
    'href',
    'src',
    'content',
  ]);

  return removeNullAndUndefined({
    name: prop('name'),
    brand,
    description: prop('description'),
    images: toImages([parseURL(image, pageUrl)]),
    sku: prop('sku'),
    gtin:
      prop('gtin') ??
      prop('gtin13') ??
      prop('gtin12') ??
      prop('gtin14') ??
      prop('gtin8'),
    mpn: prop('mpn'),
    price: parseNum(offerProp('price')),
    priceCurrency: parseCurrency(offerProp('priceCurrency')),
    availability: parseAvailability(
      offerProp('availability', ['href', 'content'])
    ),
  });
};
