import * as cheerio from 'cheerio';
import { findBySelectors } from '../selector';

describe('Selector Module', () => {
  describe('findBySelectors', () => {
    it('should find element by selectors', () => {
      const html = '<div class="test">Hello</div>';
      const $ = cheerio.load(html);
      const selectors = [{ selector: '.test' }];
      expect(findBySelectors($, selectors)).toBe('Hello');
    });

    it('should return undefined if no element is found', () => {
      const html = '<div class="test">Hello</div>';
      const $ = cheerio.load(html);
      const selectors = [{ selector: '.not-found' }];
      expect(findBySelectors($, selectors)).toBeUndefined();
    });

    it('should return the data-src from array of attribute', () => {
      const html =
        '<img src="src.jpg" data-src="data-src.jpg" srcset="srcset.jpg"/>';
      const $ = cheerio.load(html);
      const selectors = [
        { selector: 'img', attribute: ['data-src', 'srcset'] },
      ];
      expect(findBySelectors($, selectors)).toEqual('data-src.jpg');
    });

    it('should return the src from array of attribute', () => {
      const html = '<img src="src.jpg" srcset="srcset.jpg"/>';
      const $ = cheerio.load(html);
      const selectors = [{ selector: 'img', attribute: ['data-src', 'src'] }];
      expect(findBySelectors($, selectors)).toEqual('src.jpg');
    });
  });
});
