import AmazonScraper from './amazon';
import ProductScraper from './scraper';
import { Product, Scraper } from './types';
import { mergeProducts } from './lib/utils';

export const getProduct = (
  url: string,
  html: string
): [Product | null, Error | null] => {
  try {
    const scraper = useScraper(url, html);

    const jsonLd = scraper.getJsonLd();
    const microdata = scraper.getMicrodata();
    const metadata = scraper.getMetadata();
    const htmlData = scraper.getHTMLData();

    const product = mergeProducts([jsonLd, microdata, metadata, htmlData]);
    product.url = url;

    return [product, null];
  } catch (error) {
    if (error instanceof Error) {
      return [null, error];
    }
    return [null, new Error('Failed to parse product')];
  }
};

export const useScraper = (url: string, html: string): Scraper => {
  if (url.includes('amazon')) {
    return new AmazonScraper(url, html);
  }
  return new ProductScraper(url, html);
};
