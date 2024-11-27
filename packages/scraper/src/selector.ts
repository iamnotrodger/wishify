import * as cheerio from 'cheerio';

export type Selector = { selector: string; attribute?: string | string[] };

export const findBySelectors = (
  $: cheerio.CheerioAPI,
  selectors?: Selector[]
) => {
  if (!selectors) return undefined;

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
