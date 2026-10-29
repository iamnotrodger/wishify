import { parseCurrency, parseNum, parseURL } from './lib/parse';
import { removeNullAndUndefined, toImages } from './lib/utils';
import { findAllBySelectors, findBySelectors } from './selector';
import { type Product } from './types';

export const extractOpenGraph = (doc: Document, pageUrl: URL): Product => {
  const name = findBySelectors(doc, [
    { selector: 'meta[property="og:title"]', attribute: 'content' },
    { selector: 'meta[name="twitter:title"]', attribute: 'content' },
    { selector: 'title' },
  ]);

  const brand = findBySelectors(doc, [
    { selector: 'meta[property="product:brand"]', attribute: 'content' },
    { selector: 'meta[property="og:brand"]', attribute: 'content' },
  ]);

  const description = findBySelectors(doc, [
    { selector: 'meta[property="og:description"]', attribute: 'content' },
    { selector: 'meta[name="twitter:description"]', attribute: 'content' },
    { selector: 'meta[property="description"]', attribute: 'content' },
    { selector: 'meta[name="description"]', attribute: 'content' },
  ]);

  const images = findAllBySelectors(doc, [
    {
      selector: 'meta[property="og:image:secure_url"]',
      attribute: 'content',
    },
    { selector: 'meta[property="og:image:url"]', attribute: 'content' },
    { selector: 'meta[property="og:image"]', attribute: 'content' },
    { selector: 'meta[name="twitter:image"]', attribute: 'content' },
  ]);

  const price = findBySelectors(doc, [
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

  const currency = findBySelectors(doc, [
    {
      selector: 'meta[property="product:price:currency"]',
      attribute: 'content',
    },
  ]);

  const url = findBySelectors(doc, [
    { selector: 'meta[property="og:url"]', attribute: 'content' },
    { selector: 'link[rel="canonical"]', attribute: 'href' },
  ]);

  const favicon = findBySelectors(doc, [
    { selector: 'link[rel*="icon"]', attribute: 'href' },
    { selector: 'meta[name*="msapplication"]', attribute: 'content' },
  ]);

  return removeNullAndUndefined({
    name,
    brand,
    description,
    images: toImages(images.map((url) => parseURL(url, pageUrl))),
    url: parseURL(url, pageUrl),
    price: parseNum(price),
    priceCurrency: parseCurrency(currency),
    metadata: {
      favicon: parseURL(favicon, pageUrl),
    },
  });
};
