import { authMock, signIn, signOut } from '@/__tests__/mock-auth';
import {
  CategoryExistsError,
  createCategory,
} from '@/services/category-service';
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from '@/services/product-service';
import { redirect } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { product } from '../../__tests__/fixtures';
import {
  createCategoriesAction,
  createProductAction,
  deleteProductAction,
  signOutAction,
  updateProductAction,
} from '../actions';

vi.mock('@/auth', async () => (await import('@/__tests__/mock-auth')).authMock);
vi.mock('next/headers', () => ({ headers: async () => new Headers() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/services/category-service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/category-service')>()),
  createCategory: vi.fn(),
}));
vi.mock('@/services/product-service', () => ({
  createProduct: vi.fn(),
  deleteProduct: vi.fn(),
  updateProduct: vi.fn(),
}));

const category = { id: 'c1', name: 'Clothes', icon: null };

beforeEach(() => {
  vi.resetAllMocks();
  signIn();
});

describe('server actions', () => {
  describe('when signed out', () => {
    it('should refuse every change', async () => {
      signOut();

      await expect(
        updateProductAction({ id: 'p1', product: { name: 'x' } })
      ).resolves.toEqual([null, 'Unauthorized']);
      await expect(
        createProductAction({ name: 'x', price: 1, priceCurrency: 'CAD' })
      ).resolves.toEqual([null, 'Unauthorized']);
      await expect(deleteProductAction('p1')).resolves.toBe('Unauthorized');
      await expect(createCategoriesAction({ name: 'x' })).resolves.toEqual([
        null,
        'Unauthorized',
      ]);
      expect(updateProduct).not.toHaveBeenCalled();
    });
  });
});

describe('updateProductAction', () => {
  describe('when the update is valid', () => {
    it('should return the updated product', async () => {
      vi.mocked(updateProduct).mockResolvedValue([product, null]);

      await expect(
        updateProductAction({ id: 'p1', product: { purchaseDate: null } })
      ).resolves.toEqual([product, null]);
      expect(updateProduct).toHaveBeenCalledWith(
        'p1',
        { purchaseDate: null },
        expect.anything()
      );
    });
  });

  describe('when price is set without a currency', () => {
    it('should explain why and not update', async () => {
      const [, error] = await updateProductAction({
        id: 'p1',
        product: { price: 10 },
      });

      expect(error).toMatch(/price and currency must be set together/i);
      expect(updateProduct).not.toHaveBeenCalled();
    });
  });

  describe('when the id is empty', () => {
    it('should not update', async () => {
      const [, error] = await updateProductAction({ id: '', product: {} });

      expect(error).toBeTruthy();
      expect(updateProduct).not.toHaveBeenCalled();
    });
  });

  describe('when the update fails', () => {
    it('should return a generic message', async () => {
      vi.mocked(updateProduct).mockResolvedValue([null, new Error('db down')]);

      await expect(
        updateProductAction({ id: 'p1', product: { name: 'Runner' } })
      ).resolves.toEqual([null, 'Failed to update product']);
    });
  });
});

describe('createProductAction', () => {
  describe('when saving fails', () => {
    it('should return a generic message', async () => {
      vi.mocked(createProduct).mockResolvedValue([null, new Error('db down')]);

      await expect(
        createProductAction({ name: 'Runner', price: 1, priceCurrency: 'CAD' })
      ).resolves.toEqual([null, 'Failed to save product']);
    });
  });

  describe('when the name is empty', () => {
    it('should explain why and not save', async () => {
      const [, error] = await createProductAction({
        name: '',
        price: 1,
        priceCurrency: 'CAD',
      });

      expect(error).toMatch(/name cannot be empty/i);
      expect(createProduct).not.toHaveBeenCalled();
    });
  });
});

describe('deleteProductAction', () => {
  describe('when the product is deleted', () => {
    it('should return no error', async () => {
      vi.mocked(deleteProduct).mockResolvedValue(null);

      await expect(deleteProductAction('p1')).resolves.toBeNull();
    });
  });

  describe('when deleting fails', () => {
    it('should return a generic message', async () => {
      vi.mocked(deleteProduct).mockResolvedValue(new Error('db down'));

      await expect(deleteProductAction('p1')).resolves.toBe(
        'Failed to delete product'
      );
    });
  });
});

describe('createCategoriesAction', () => {
  describe('when the category is created', () => {
    it('should return it', async () => {
      vi.mocked(createCategory).mockResolvedValue([category, null]);

      await expect(
        createCategoriesAction({ name: 'Clothes' })
      ).resolves.toEqual([category, null]);
    });
  });

  describe('when the name is already taken', () => {
    it('should say so', async () => {
      vi.mocked(createCategory).mockResolvedValue([
        null,
        new CategoryExistsError(),
      ]);

      await expect(
        createCategoriesAction({ name: 'Clothes' })
      ).resolves.toEqual([null, 'A category with this name already exists']);
    });
  });

  describe('when creating fails for another reason', () => {
    it('should return a generic message', async () => {
      vi.mocked(createCategory).mockResolvedValue([null, new Error('db down')]);

      await expect(
        createCategoriesAction({ name: 'Clothes' })
      ).resolves.toEqual([null, 'Failed to add category']);
    });
  });
});

describe('signOutAction', () => {
  describe('when called', () => {
    it('should sign out and go home', async () => {
      await signOutAction();

      expect(authMock.auth.api.signOut).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/');
    });
  });
});
