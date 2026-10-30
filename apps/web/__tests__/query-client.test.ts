import { type UpdateProductProps } from '@/app/actions';
import { MutationObserver, type QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getQueryClient } from '../query-client';
import { product } from './fixtures';

const other = { ...product, id: 'p2', name: 'Other' };
const categories = [
  { id: 'c1', name: 'Clothes', icon: 'shirt' },
  { id: 'c2', name: 'Books', icon: 'book' },
];

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = getQueryClient();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  queryClient.setQueryData(['products', 'list'], {
    pages: [[product, other]],
    pageParams: [''],
  });
  queryClient.setQueryData(['products', 'p1'], product);
  queryClient.setQueryData(['categories'], categories);
});

const update = (
  changes: UpdateProductProps['product'],
  mutationFn: () => Promise<unknown> = () => new Promise(() => {})
) =>
  new MutationObserver<unknown, Error, UpdateProductProps>(queryClient, {
    mutationKey: ['updateProduct'],
    mutationFn,
  }).mutate({ id: 'p1', product: changes });

const listed = (id: string) =>
  queryClient
    .getQueryData<{ pages: (typeof product)[][] }>(['products', 'list'])
    ?.pages[0]?.find((p) => p.id === id);

describe('updateProduct mutation', () => {
  describe('when a product is updated', () => {
    it('should change it right away in lists and detail', async () => {
      update({ name: 'Trail runner' });

      await vi.waitFor(() => expect(listed('p1')?.name).toBe('Trail runner'));
      expect(
        queryClient.getQueryData<typeof product>(['products', 'p1'])?.name
      ).toBe('Trail runner');
      expect(listed('p2')).toEqual(other);
    });
  });

  describe("when a product's categories are updated", () => {
    it('should show the categories the ids point to', async () => {
      update({ categoryIds: ['c2'] });

      await vi.waitFor(() =>
        expect(listed('p1')?.categories).toEqual([categories[1]])
      );
    });
  });

  describe('when the update fails', () => {
    it('should restore the previous data', async () => {
      await update({ name: 'Trail runner' }, () =>
        Promise.reject(new Error('down'))
      ).catch(() => {});

      expect(listed('p1')).toEqual(product);
      expect(queryClient.getQueryData(['products', 'p1'])).toEqual(product);
    });
  });

  describe('when the update settles', () => {
    it('should refetch products', async () => {
      const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

      await update({ name: 'Trail runner' }, async () => product);

      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['products'] });
    });
  });
});

describe('other mutations', () => {
  describe.each([
    ['addProduct', ['products']],
    ['deleteProduct', ['products']],
    ['addCategory', ['categories']],
  ])('when %s succeeds', (mutationKey, queryKey) => {
    it(`should refetch ${queryKey[0]}`, async () => {
      const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

      await new MutationObserver(queryClient, {
        mutationKey: [mutationKey],
        mutationFn: async () => null,
      }).mutate();

      expect(invalidate).toHaveBeenCalledWith({ queryKey });
    });
  });
});
