import { type Product, scrapeProduct } from '@/scraper';
import { browser } from 'wxt/browser';

/**
 * Scrapes the product on the active tab. Falls back to just the tab's URL
 * when the page can't be read (e.g. browser pages) so the user can fill in
 * the rest by hand.
 */
export const scrapeActiveTab = async (): Promise<Product> => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (tab?.id == null) return {};

  try {
    const [injection] = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        url: document.URL,
        html: document.documentElement.outerHTML,
      }),
    });
    if (injection?.result) {
      return scrapeProduct(injection.result.url, injection.result.html);
    }
  } catch (error) {
    console.error(error);
  }

  return { url: tab.url };
};
