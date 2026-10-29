import { parseJson, parseURL } from '../lib/parse';
import { removeNullAndUndefined, toImages } from '../lib/utils';
import {
  extractBySelectors,
  findBySelectors,
  type Selector,
} from '../selector';
import {
  type Image,
  type ItemAvailability,
  type Json,
  type Site,
} from '../types';

const selectors: Record<string, Selector[]> = {
  name: [
    { selector: '#productTitle' },
    { selector: '[name="productTitle"]', attribute: 'value' },
  ],
  brand: [
    {
      selector:
        '#productOverview_feature_div table tbody tr.po-brand td:nth-child(2) span',
    },
  ],
  price: [
    { selector: '#corePrice_feature_div .a-price .a-offscreen' },
    { selector: '#priceValue', attribute: 'value' },
    { selector: '[name="priceValue"]', attribute: 'value' },
    { selector: '#dp .a-price span.a-offscreen' },
    { selector: '#priceblock_ourprice' },
  ],
  priceCurrency: [
    { selector: '#currencyOfPreference', attribute: 'value' },
    { selector: '[name="currencyOfPreference"]', attribute: 'value' },
  ],
  image: [
    { selector: 'img#landingImage', attribute: ['data-old-hires', 'src'] },
    { selector: '#imgTagWrapperId img', attribute: 'src' },
    { selector: '[name="productImageUrl"]', attribute: 'value' },
  ],
  category: [{ selector: '#productCategory', attribute: 'value' }],
};

// "Visit the Tarcury Store" or "Brand: Tarcury" (English storefronts only).
const getBylineBrand = (doc: Document) => {
  const byline = findBySelectors(doc, [{ selector: '#bylineInfo' }]);
  return byline
    ?.match(/^Visit the (.+) Store$|^Brand: (.+)$/)
    ?.slice(1)
    .find(Boolean);
};

// The landing image lists every rendered size as {"url": [width, height]}.
const getLargestImage = (doc: Document, pageUrl: URL): Image | undefined => {
  const raw = doc
    .querySelector('#landingImage')
    ?.getAttribute('data-a-dynamic-image');
  if (!raw) return undefined;

  try {
    const sizes = Object.entries(JSON.parse(raw) as Record<string, number[]>);
    const [url, [width, height] = []] = sizes.reduce((largest, size) =>
      (size[1][0] ?? 0) > (largest[1][0] ?? 0) ? size : largest
    );
    const imageURL = parseURL(url, pageUrl);
    return imageURL ? { url: imageURL, width, height } : undefined;
  } catch {
    return undefined;
  }
};

// An inline script holds the gallery as 'colorImages': { 'initial': [...] }.
const getGalleryImages = (doc: Document, pageUrl: URL): Image[] | null => {
  for (const script of doc.querySelectorAll('script:not([src])')) {
    const raw = script.textContent?.match(
      /'colorImages':\s*\{\s*'initial':\s*(\[.*\])\s*\}/
    )?.[1];
    const gallery = raw && parseJson(raw);
    if (!Array.isArray(gallery)) continue;

    return toImages(
      gallery.map((image: Json) =>
        parseURL(image?.hiRes ?? image?.large, pageUrl)
      )
    );
  }
  return null;
};

// Stock text is localized; unknown wording leaves availability unset.
const getAvailability = (doc: Document): ItemAvailability | undefined => {
  const text = findBySelectors(doc, [
    { selector: '#availability' },
  ])?.toLowerCase();
  if (!text) return undefined;
  if (/out of stock|unavailable/.test(text)) return 'OutOfStock';
  if (/pre-?order/.test(text)) return 'PreOrder';
  if (/in stock/.test(text)) return 'InStock';
  return undefined;
};

export const amazon: Site = {
  // amazon.com, amazon.ca, amazon.co.uk, ...
  match: (pageUrl) => /(^|\.)amazon\.[a-z.]+$/.test(pageUrl.hostname),
  extract: (doc, pageUrl) => {
    const product = extractBySelectors(doc, pageUrl, selectors);
    const largestImage = getLargestImage(doc, pageUrl);
    const images =
      getGalleryImages(doc, pageUrl) ??
      (largestImage ? [largestImage] : product.images);

    return removeNullAndUndefined({
      ...product,
      brand: product.brand ?? getBylineBrand(doc),
      sku: findBySelectors(doc, [{ selector: '#ASIN', attribute: 'value' }]),
      availability: getAvailability(doc),
      images,
    });
  },
};
