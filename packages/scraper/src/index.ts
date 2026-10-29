import { extractJsonLd } from './jsonld';
import { mergeProducts } from './lib/utils';
import { extractMicrodata } from './microdata';
import { extractOpenGraph } from './opengraph';
import { findSite } from './sites';
import { type Product } from './types';

export type { Product } from './types';

const MAX_IMAGES = 8;

/**
 * Extracts a product from a page. Site rules win over generic structured
 * data, which wins over OpenGraph meta tags.
 */
export const scrapeProduct = (url: string, html: string): Product => {
  const pageUrl = new URL(url);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const site = findSite(pageUrl);

  const siteProduct = site?.extract(doc, pageUrl) ?? {};
  const product = mergeProducts([
    siteProduct,
    extractJsonLd(doc, pageUrl),
    extractMicrodata(doc, pageUrl),
    extractOpenGraph(doc, pageUrl),
  ]);

  // A site gallery is complete; generic sources would only repeat its photos
  // at other sizes.
  if (siteProduct.images) product.images = siteProduct.images;
  product.images = product.images?.slice(0, MAX_IMAGES) ?? null;
  product.url = product.url ?? url;
  return product;
};
