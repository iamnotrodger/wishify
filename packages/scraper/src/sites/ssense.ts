import { parseURL } from '../lib/parse';
import { removeNullAndUndefined, toImages } from '../lib/utils';
import { findAllBySelectors } from '../selector';
import { type Site } from '../types';

export const ssense: Site = {
  match: (pageUrl) => /(^|\.)ssense\.com$/.test(pageUrl.hostname),
  // Structured data has only the first photo. Gallery images lazy load, so
  // src is a placeholder until scrolled into view; data-srcset always has the URL.
  extract: (doc, pageUrl) =>
    removeNullAndUndefined({
      images: toImages(
        findAllBySelectors(doc, [
          { selector: '.pdp-images__desktop img', attribute: 'data-srcset' },
        ]).map((url) => parseURL(url, pageUrl))
      ),
    }),
};
