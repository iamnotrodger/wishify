import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchJson } from '../fetch-json';

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

describe('fetchJson', () => {
  describe('when the response is ok', () => {
    it('should return the parsed body', async () => {
      respond(200, { id: 'p1' });

      await expect(fetchJson('/api/products/p1')).resolves.toEqual({
        id: 'p1',
      });
    });
  });

  describe('when the response fails', () => {
    it('should throw the error from the body', async () => {
      respond(404, { message: 'product not found', error: 'no product' });

      await expect(fetchJson('/api/products/p1')).rejects.toThrow('no product');
    });

    it('should fall back to the message from the body', async () => {
      respond(401, { message: 'unauthorized request' });

      await expect(fetchJson('/api/products')).rejects.toThrow(
        'unauthorized request'
      );
    });
  });
});
