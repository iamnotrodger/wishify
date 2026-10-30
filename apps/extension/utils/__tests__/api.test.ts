import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  createProduct,
  deleteProduct,
  getCategories,
  openWishify,
} from '../api';

const respond = (status: number, body: unknown) =>
  vi
    .mocked(fetch)
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('api', () => {
  describe('when a request is made', () => {
    it('should call the web app with its session cookie', async () => {
      respond(200, []);

      await getCategories();

      expect(fetch).toHaveBeenCalledWith(
        new URL('https://wishify.test/api/categories'),
        expect.objectContaining({ credentials: 'include' })
      );
    });

    it('should send bodies as JSON', async () => {
      respond(201, { id: '1' });

      await createProduct({ name: 'Shoe', price: 10, priceCurrency: 'CAD' });

      expect(fetch).toHaveBeenCalledWith(
        new URL('https://wishify.test/api/products'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Shoe',
            price: 10,
            priceCurrency: 'CAD',
          }),
        })
      );
    });
  });

  describe('when the request succeeds', () => {
    it('should return the parsed body', async () => {
      respond(200, [{ id: '1', name: 'Shoes' }]);

      await expect(getCategories()).resolves.toEqual([
        { id: '1', name: 'Shoes' },
      ]);
    });
  });

  describe('when the request fails', () => {
    it('should throw the error from the body', async () => {
      respond(409, { error: 'Category already exists' });

      await expect(getCategories()).rejects.toThrow('Category already exists');
    });

    it('should fall back to the message from the body', async () => {
      respond(401, { message: 'Unauthorized' });

      await expect(deleteProduct('1')).rejects.toThrow('Unauthorized');
    });
  });

  describe('when Wishify is opened', () => {
    it('should open the page in a new tab', async () => {
      const create = vi.spyOn(fakeBrowser.tabs, 'create');

      await openWishify('/app?product_id=1');

      expect(create).toHaveBeenCalledWith({
        url: 'https://wishify.test/app?product_id=1',
      });
    });
  });
});
