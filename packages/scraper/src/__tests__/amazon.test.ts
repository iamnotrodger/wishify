import fs from 'fs';
import path from 'path';
import { SiteScraper } from '..';
import { amazonSelectors } from '../amazon';

describe('AmazonScraper', () => {
  const url =
    'https://www.amazon.ca/Tarcury-Corsair-Fighter-Bomber-Building/dp/B0CNT488KH?pd_rd_w=QmenC&content-id=amzn1.sym.8eef7635-0ea1-468f-9bbf-a6c1163fd848&pf_rd_p=8eef7635-0ea1-468f-9bbf-a6c1163fd848&pf_rd_r=AN6A3DYMW5RSK3RCWZQN&pd_rd_wg=D3E9W&pd_rd_r=2d0f9aca-c2b3-4928-9b97-9e13695002f4&pd_rd_i=B0CNT488KH&ref_=pd_hp_d_btf_CACPN24_B0CNT488KH&th=1';
  let html: string;
  let scraper: SiteScraper;

  beforeAll(() => {
    const htmlFilePath = path.resolve(__dirname, 'data/amazon.html');
    html = fs.readFileSync(htmlFilePath, 'utf-8');
    scraper = new SiteScraper(url, html, amazonSelectors);
  });

  describe('getProduct', () => {
    it('should extract HTML data correctly', () => {
      const result = scraper.getProduct();
      expect(result).toEqual({
        name: 'Tarcury WW2 F4U Corsair Fighter Bomber Building Bricks - 550 PCS Army Toy Set with 1 Toy Soldiers - Engaging WWII Toys for Kids and Adults',
        brand: 'Tarcury',
        price: 29.99,
        currency: 'CAD',
        images: [
          {
            url: 'https://m.media-amazon.com/images/I/61rbW2eIt3L._AC_SX679_.jpg',
          },
        ],
        metadata: {
          category: 'gl_toy',
        },
      });
    });
  });
});
