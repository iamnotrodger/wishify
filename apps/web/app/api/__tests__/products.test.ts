import { signIn, signOut } from '@/__tests__/mock-auth';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
} from '@/services/product-service';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { product } from '../../../__tests__/fixtures';
import { DELETE, GET as GET_ONE } from '../products/[id]/route';
import { GET, POST } from '../products/route';

vi.mock('@/auth', async () => (await import('@/__tests__/mock-auth')).authMock);
vi.mock('@/services/product-service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/product-service')>()),
  getProducts: vi.fn(),
  getProductById: vi.fn(),
  createProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

const URL = 'https://wishify.test/api/products';
const withId = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  vi.resetAllMocks();
  signIn();
});

describe('GET /api/products', () => {
  describe('when signed out', () => {
    it('should respond 401', async () => {
      signOut();

      expect((await GET(new NextRequest(URL))).status).toBe(401);
    });
  });

  describe('when the query is valid', () => {
    it('should pass it on and respond with a cursor to the last product', async () => {
      vi.mocked(getProducts).mockResolvedValue([
        [product, { ...product, id: 'p2' }],
        null,
      ]);

      const res = await GET(
        new NextRequest(`${URL}?category=c1&sortBy=price&limit=10`)
      );

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toMatchObject({ cursor: 'p2' });
      expect(getProducts).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'c1', sortBy: 'price', limit: 10 }),
        expect.anything()
      );
    });
  });

  describe('when there are no more products', () => {
    it('should respond with a null cursor', async () => {
      vi.mocked(getProducts).mockResolvedValue([[], null]);

      const res = await GET(new NextRequest(URL));

      await expect(res.json()).resolves.toEqual({ products: [], cursor: null });
    });
  });

  describe('when the query is invalid', () => {
    it('should respond 400', async () => {
      const res = await GET(new NextRequest(`${URL}?sortDir=sideways`));

      expect(res.status).toBe(400);
      expect(getProducts).not.toHaveBeenCalled();
    });
  });
});

describe('POST /api/products', () => {
  const post = (body: unknown) =>
    POST(new NextRequest(URL, { method: 'POST', body: JSON.stringify(body) }));

  describe('when the product is valid', () => {
    it('should create it and respond with it', async () => {
      vi.mocked(createProduct).mockResolvedValue([product, null]);

      const res = await post({
        name: 'Runner',
        price: '25.5',
        priceCurrency: 'CAD',
      });

      expect(res.status).toBe(200);
      expect(createProduct).toHaveBeenCalledWith(
        expect.objectContaining({ price: 25.5 }),
        expect.anything()
      );
    });
  });

  describe('when the product has no currency', () => {
    it('should respond 400', async () => {
      expect((await post({ name: 'Runner', price: 1 })).status).toBe(400);
      expect(createProduct).not.toHaveBeenCalled();
    });
  });

  describe('when saving fails', () => {
    it('should respond 500', async () => {
      vi.mocked(createProduct).mockResolvedValue([null, new Error('down')]);

      const res = await post({
        name: 'Runner',
        price: 1,
        priceCurrency: 'CAD',
      });

      expect(res.status).toBe(500);
    });
  });
});

describe('GET /api/products/[id]', () => {
  describe('when the product exists', () => {
    it('should respond with it', async () => {
      vi.mocked(getProductById).mockResolvedValue([product, null]);

      const res = await GET_ONE(new NextRequest(`${URL}/p1`), withId('p1'));

      expect(res.status).toBe(200);
      expect(getProductById).toHaveBeenCalledWith('p1', expect.anything());
    });
  });

  describe('when the product does not exist', () => {
    it('should respond 404', async () => {
      vi.mocked(getProductById).mockResolvedValue([null, null]);

      const res = await GET_ONE(new NextRequest(`${URL}/p9`), withId('p9'));

      expect(res.status).toBe(404);
    });
  });

  describe('when signed out', () => {
    it('should respond 401', async () => {
      signOut();

      const res = await GET_ONE(new NextRequest(`${URL}/p1`), withId('p1'));

      expect(res.status).toBe(401);
    });
  });
});

describe('DELETE /api/products/[id]', () => {
  describe('when the product is deleted', () => {
    it('should respond with success', async () => {
      vi.mocked(deleteProduct).mockResolvedValue(null);

      const res = await DELETE(new NextRequest(`${URL}/p1`), withId('p1'));

      await expect(res.json()).resolves.toEqual({ success: true });
    });
  });

  describe('when deleting fails', () => {
    it('should respond 500', async () => {
      vi.mocked(deleteProduct).mockResolvedValue(new Error('not found'));

      const res = await DELETE(new NextRequest(`${URL}/p1`), withId('p1'));

      expect(res.status).toBe(500);
    });
  });
});
