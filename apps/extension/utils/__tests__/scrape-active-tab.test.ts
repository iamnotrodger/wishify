import { scrapeProduct } from '@repo/scraper';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { scrapeActiveTab } from '../scrape-active-tab';

vi.mock('@repo/scraper', () => ({ scrapeProduct: vi.fn() }));

const PAGE = { url: 'https://store.test/shoe', html: '<html></html>' };

// The fake browser starts without a focused window, which tabs.query needs.
const openTab = async (url: string) => {
  const window = await fakeBrowser.windows.create({ focused: true });
  await fakeBrowser.tabs.create({ url, active: true, windowId: window?.id });
};

const executeScript = () => vi.spyOn(browser.scripting, 'executeScript');

beforeEach(() => {
  vi.mocked(scrapeProduct).mockReset();
});

describe('scrapeActiveTab', () => {
  describe('when there is no active tab', () => {
    it('should return an empty product', async () => {
      await expect(scrapeActiveTab()).resolves.toEqual({});
    });
  });

  describe('when the page can be read', () => {
    it('should scrape its URL and HTML', async () => {
      await openTab(PAGE.url);
      executeScript().mockImplementation(async () => [
        { frameId: 0, documentId: 'doc', result: PAGE },
      ]);
      vi.mocked(scrapeProduct).mockReturnValue({ name: 'Shoe' });

      await expect(scrapeActiveTab()).resolves.toEqual({ name: 'Shoe' });
      expect(scrapeProduct).toHaveBeenCalledWith(PAGE.url, PAGE.html);
    });
  });

  describe('when the page cannot be read', () => {
    it("should fall back to the tab's URL", async () => {
      await openTab('chrome://extensions');
      executeScript().mockRejectedValue(
        new Error('Cannot access a chrome:// URL')
      );
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(scrapeActiveTab()).resolves.toEqual({
        url: 'chrome://extensions',
      });
      expect(scrapeProduct).not.toHaveBeenCalled();
    });
  });
});
