import { prismaMock } from '@/__tests__/mock-db';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { duplicateError, session } from '../../__tests__/fixtures';
import {
  CategoryExistsError,
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../category-service';

vi.mock('@repo/db', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@repo/db')>()),
  prisma: (await import('@/__tests__/mock-db')).prismaMock,
}));

const category = { id: 'c1', name: 'Clothes', icon: 'shirt' };

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('category-service', () => {
  describe('when categories are listed', () => {
    it("should only read the user's categories", async () => {
      prismaMock.category.findMany.mockResolvedValue([category]);

      await expect(getCategories(session)).resolves.toEqual([[category], null]);
      expect(prismaMock.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1' } })
      );
    });
  });

  describe('when a category is created', () => {
    it('should store it for the user', async () => {
      prismaMock.category.create.mockResolvedValue(category);

      await expect(
        createCategory({ name: 'Clothes', icon: 'shirt' }, session)
      ).resolves.toEqual([category, null]);
      expect(prismaMock.category.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { name: 'Clothes', icon: 'shirt', userId: 'u1' },
        })
      );
    });
  });

  describe('when the name is already taken', () => {
    it('should return a category exists error on create', async () => {
      prismaMock.category.create.mockRejectedValue(duplicateError());

      const [, error] = await createCategory({ name: 'Clothes' }, session);

      expect(error).toBeInstanceOf(CategoryExistsError);
      expect(error?.message).toBe('A category with this name already exists');
    });

    it('should return a category exists error on update', async () => {
      prismaMock.category.update.mockRejectedValue(duplicateError());

      const [, error] = await updateCategory('c1', { name: 'Books' }, session);

      expect(error).toBeInstanceOf(CategoryExistsError);
    });
  });

  describe('when the database fails for another reason', () => {
    it('should return the original error', async () => {
      const failure = new Error('connection lost');
      prismaMock.category.create.mockRejectedValue(failure);

      await expect(
        createCategory({ name: 'Clothes' }, session)
      ).resolves.toEqual([null, failure]);
    });
  });

  describe('when a category is updated or deleted', () => {
    it("should only touch the user's category", async () => {
      prismaMock.category.update.mockResolvedValue(category);
      prismaMock.category.delete.mockResolvedValue(category);

      await updateCategory('c1', { name: 'Clothes' }, session);
      await expect(deleteCategory('c1', session)).resolves.toBeNull();

      const where = { id: 'c1', userId: 'u1' };
      expect(prismaMock.category.update).toHaveBeenCalledWith(
        expect.objectContaining({ where })
      );
      expect(prismaMock.category.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where })
      );
    });
  });
});
