import MicrodataScraper from '../microdata';

describe('MicrodataScraper', () => {
  const url = 'http://example.com';
  const html = `
    <div itemscope itemtype="http://schema.org/Product">
      <span itemprop="name">Example Product</span>
      <img itemprop="image" src="http://example.com/image.jpg" />
      <div itemprop="description">Example Description</div>

      <div itemprop="offers" itemscope itemtype="http://schema.org/Offer">
        <span itemprop="price">19.99</span>
        <span itemprop="priceCurrency" content="USD">USD</span>
      </div>
    </div>
  `;

  let scraper: MicrodataScraper;

  beforeEach(() => {
    scraper = new MicrodataScraper(url, html);
  });

  it('should extract product name', () => {
    const product = scraper.getProduct();
    expect(product.name).toBe('Example Product');
  });

  it('should extract product description', () => {
    const product = scraper.getProduct();
    expect(product.description).toBe('Example Description');
  });

  it('should extract product price', () => {
    const product = scraper.getProduct();
    expect(product.price).toBe(19.99);
  });

  it('should extract product currency', () => {
    const product = scraper.getProduct();
    expect(product.currency).toBe('USD');
  });

  it('should extract product image URL', () => {
    const product = scraper.getProduct();
    expect(product.images).toEqual([{ url: 'http://example.com/image.jpg' }]);
  });

  it('should return undefined for missing fields', () => {
    const emptyHtml = '<div></div>';
    scraper = new MicrodataScraper(url, emptyHtml);
    const product = scraper.getProduct();
    expect(product.name).toBeUndefined();
    expect(product.price).toBeUndefined();
    expect(product.currency).toBeUndefined();
    expect(product.images).toBeUndefined();
  });
});
