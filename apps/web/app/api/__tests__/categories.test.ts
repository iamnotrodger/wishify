import { signIn, signOut } from '@/__tests__/mock-auth';
import {
  CategoryExistsError,
  createCategory,
  getCategories,
} from '@/services/category-service';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '../categories/route';

vi.mock('@/auth', async () => (await import('@/__tests__/mock-auth')).authMock);
vi.mock('@/services/category-service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/category-service')>()),
  getCategories: vi.fn(),
  createCategory: vi.fn(),
}));

const URL = 'https://wishify.test/api/categories';
const category = { id: 'c1', name: 'Clothes', icon: 'shirt' };

const post = (body: unknown) =>
  POST(new NextRequest(URL, { method: 'POST', body: JSON.stringify(body) }));

beforeEach(() => {
  vi.resetAllMocks();
  signIn();
});

describe('GET /api/categories', () => {
  describe('when signed out', () => {
    it('should respond 401', async () => {
      signOut();

      const res = await GET(new NextRequest(URL));

      expect(res.status).toBe(401);
      expect(getCategories).not.toHaveBeenCalled();
    });
  });

  describe('when signed in', () => {
    it("should respond with the user's categories", async () => {
      vi.mocked(getCategories).mockResolvedValue([[category], null]);

      const res = await GET(new NextRequest(URL));

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual([category]);
    });
  });

  describe('when the database fails', () => {
    it('should respond 500', async () => {
      vi.mocked(getCategories).mockResolvedValue([null, new Error('down')]);

      expect((await GET(new NextRequest(URL))).status).toBe(500);
    });
  });
});

describe('POST /api/categories', () => {
  describe('when signed out', () => {
    it('should respond 401', async () => {
      signOut();

      expect((await post({ name: 'Clothes' })).status).toBe(401);
    });
  });

  describe('when the category is valid', () => {
    it('should create it and respond with it', async () => {
      vi.mocked(createCategory).mockResolvedValue([category, null]);

      const res = await post({ name: '  Clothes ', icon: 'shirt' });

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual(category);
      expect(createCategory).toHaveBeenCalledWith(
        { name: 'Clothes', icon: 'shirt' },
        expect.anything()
      );
    });
  });

  describe('when the name is blank or the icon is unknown', () => {
    it.each([{ name: '  ' }, { name: 'Clothes', icon: 'rocket' }])(
      'should respond 400 for %j',
      async (body) => {
        expect((await post(body)).status).toBe(400);
        expect(createCategory).not.toHaveBeenCalled();
      }
    );
  });

  describe('when the name is already taken', () => {
    it('should respond 409 with the reason', async () => {
      vi.mocked(createCategory).mockResolvedValue([
        null,
        new CategoryExistsError(),
      ]);

      const res = await post({ name: 'Clothes' });

      expect(res.status).toBe(409);
      await expect(res.json()).resolves.toMatchObject({
        error: 'A category with this name already exists',
      });
    });
  });

  describe('when the database fails', () => {
    it('should respond 500', async () => {
      vi.mocked(createCategory).mockResolvedValue([null, new Error('down')]);

      expect((await post({ name: 'Clothes' })).status).toBe(500);
    });
  });
});
