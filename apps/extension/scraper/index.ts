import { extractJsonLd } from './jsonld';
import { mergeProducts } from './lib/utils';
import { extractMicrodata } from './microdata';
import { extractOpenGraph } from './opengraph';
import { findSite } from './sites';
import { type Product } from './types';

export type { Product } from './types';

/**
 * Extracts a product from a page. Site rules win over generic structured
 * data, which wins over OpenGraph meta tags.
 */
export const scrapeProduct = (url: string, html: string): Product => {
  const pageUrl = new URL(url);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const site = findSite(pageUrl);

  const product = mergeProducts([
    site?.extract(doc, pageUrl) ?? {},
    extractJsonLd(doc, pageUrl),
    extractMicrodata(doc, pageUrl),
    extractOpenGraph(doc, pageUrl),
  ]);

  product.url = product.url ?? url;
  return product;
};
