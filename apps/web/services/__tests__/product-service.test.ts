import { prismaMock } from '@/__tests__/mock-db';
import { Prisma } from '@repo/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { product, productRow, session } from '../../__tests__/fixtures';
import {
  createProduct,
  deleteProduct,
  getProductById,
  GetProductQuerySchema,
  getProducts,
  updateProduct,
} from '../product-service';

vi.mock('@repo/db', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/db')>()),
  prisma: (await import('@/__tests__/mock-db')).prismaMock,
}));

const query = GetProductQuerySchema.parse({});
const newProduct = { name: 'Runner', price: 25.5, priceCurrency: 'CAD' };

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  prismaMock.product.findMany.mockResolvedValue([productRow]);
  prismaMock.product.findFirst.mockResolvedValue(productRow);
  prismaMock.product.create.mockResolvedValue(productRow);
  prismaMock.product.update.mockResolvedValue(productRow);
});

const findManyArgs = () => prismaMock.product.findMany.mock.calls[0]![0];

describe('GetProductQuerySchema', () => {
  describe('when no query is given', () => {
    it('should sort newest first, 50 at a time', () => {
      expect(query).toEqual({
        sortBy: 'createdAt',
        sortDir: 'desc',
        limit: 50,
      });
    });
  });

  describe('when the limit is above 100', () => {
    it('should cap it at 100', () => {
      expect(GetProductQuerySchema.parse({ limit: '500' }).limit).toBe(100);
    });
  });

  describe('when the limit is below 1 or the sort is unknown', () => {
    it('should reject it', () => {
      expect(GetProductQuerySchema.safeParse({ limit: '0' }).success).toBe(
        false
      );
      expect(GetProductQuerySchema.safeParse({ sortBy: 'name' }).success).toBe(
        false
      );
    });
  });
});

describe('product-service', () => {
  describe('when products are read', () => {
    it('should convert prices to numbers and dates to ISO strings', async () => {
      await expect(getProductById('p1', session)).resolves.toEqual([
        product,
        null,
      ]);
    });
  });

  describe('when products are listed', () => {
    it("should only read the user's products in a stable order", async () => {
      await getProducts(query, session);

      expect(findManyArgs()).toMatchObject({
        where: { userId: 'u1' },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 50,
        skip: 0,
        cursor: undefined,
      });
    });

    it('should filter by category', async () => {
      await getProducts({ ...query, category: 'c1' }, session);

      expect(findManyArgs().where).toMatchObject({
        categories: { some: { id: 'c1' } },
      });
    });

    it('should search name and brand ignoring case', async () => {
      await getProducts({ ...query, search: 'acme' }, session);

      expect(findManyArgs().where.OR).toEqual([
        { name: { contains: 'acme', mode: 'insensitive' } },
        { brand: { contains: 'acme', mode: 'insensitive' } },
      ]);
    });

    it('should start after the cursor', async () => {
      await getProducts({ ...query, cursor: 'p1' }, session);

      expect(findManyArgs()).toMatchObject({ cursor: { id: 'p1' }, skip: 1 });
    });
  });

  describe('when a product is not found', () => {
    it('should return neither product nor error', async () => {
      prismaMock.product.findFirst.mockResolvedValue(null);

      await expect(getProductById('p2', session)).resolves.toEqual([
        null,
        null,
      ]);
    });
  });

  describe('when a product is created with categories', () => {
    it('should connect the categories the user owns', async () => {
      prismaMock.category.count.mockResolvedValue(2);

      await createProduct(
        { ...newProduct, categoryIds: ['c1', 'c2', 'c1'] },
        session
      );

      expect(prismaMock.category.count).toHaveBeenCalledWith({
        where: { id: { in: ['c1', 'c2'] }, userId: 'u1' },
      });
      expect(prismaMock.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'u1',
            categories: { connect: [{ id: 'c1' }, { id: 'c2' }, { id: 'c1' }] },
          }),
        })
      );
    });
  });

  describe("when a product is given another user's category", () => {
    it('should refuse to create it', async () => {
      prismaMock.category.count.mockResolvedValue(0);

      const [created, error] = await createProduct(
        { ...newProduct, categoryIds: ['theirs'] },
        session
      );

      expect(created).toBeNull();
      expect(error?.message).toBe('Category not found');
      expect(prismaMock.product.create).not.toHaveBeenCalled();
    });

    it('should refuse to update it', async () => {
      prismaMock.category.count.mockResolvedValue(0);

      const [, error] = await updateProduct(
        'p1',
        { categoryIds: ['theirs'] },
        session
      );

      expect(error?.message).toBe('Category not found');
      expect(prismaMock.product.update).not.toHaveBeenCalled();
    });
  });

  describe('when a product is created without categories', () => {
    it('should not check or connect any', async () => {
      await createProduct(newProduct, session);

      expect(prismaMock.category.count).not.toHaveBeenCalled();
      expect(
        prismaMock.product.create.mock.calls[0]![0].data.categories
      ).toBeUndefined();
    });
  });

  describe("when a product's categories are updated", () => {
    it('should replace them', async () => {
      prismaMock.category.count.mockResolvedValue(1);

      await updateProduct('p1', { categoryIds: ['c2'] }, session);

      expect(prismaMock.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p1', userId: 'u1' },
          data: expect.objectContaining({
            categories: { set: [{ id: 'c2' }] },
          }),
        })
      );
    });

    it('should clear them when given none', async () => {
      await updateProduct('p1', { categoryIds: [] }, session);

      expect(
        prismaMock.product.update.mock.calls[0]![0].data.categories
      ).toEqual({ set: [] });
    });
  });

  describe('when metadata is cleared', () => {
    it('should store a database null', async () => {
      await updateProduct('p1', { metadata: null }, session);

      expect(prismaMock.product.update.mock.calls[0]![0].data.metadata).toBe(
        Prisma.DbNull
      );
    });
  });

  describe('when the database fails', () => {
    it('should return the error', async () => {
      const failure = new Error('connection lost');
      prismaMock.product.create.mockRejectedValue(failure);

      await expect(createProduct(newProduct, session)).resolves.toEqual([
        null,
        failure,
      ]);
    });
  });

  describe('when a product is deleted', () => {
    it("should only delete the user's product", async () => {
      prismaMock.product.delete.mockResolvedValue(productRow);

      await expect(deleteProduct('p1', session)).resolves.toBeNull();
      expect(prismaMock.product.delete).toHaveBeenCalledWith({
        where: { id: 'p1', userId: 'u1' },
      });
    });
  });
});
