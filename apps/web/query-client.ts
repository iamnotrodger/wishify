import { Product, UpdateCategory, UpdateProduct } from '@repo/api';
import { Category } from '@repo/db';
import { QueryClient, isServer } from '@tanstack/react-query';

type InfiniteProductsQueryData = {
  pages: Product[][];
  pageParams: string[];
};
type ProductsQueryData = Product | InfiniteProductsQueryData;
type CategoryQueryData = Category[];

const isInfiniteProductsQueryData = (
  data?: ProductsQueryData
): data is InfiniteProductsQueryData => {
  return (
    data != null &&
    (data as InfiniteProductsQueryData).pages !== undefined &&
    Array.isArray((data as InfiniteProductsQueryData).pages)
  );
};

function makeQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

  queryClient.setMutationDefaults(['updateProduct'], {
    onMutate: async ({
      id,
      product,
    }: {
      id: string;
      product: UpdateProduct;
    }) => {
      const queryFilter = { queryKey: ['products'], exact: false };

      await queryClient.cancelQueries(queryFilter);
      const previousData = queryClient.getQueriesData(queryFilter);

      queryClient.setQueriesData(queryFilter, (old?: ProductsQueryData) => {
        if (!old) return old;

        if (isInfiniteProductsQueryData(old)) {
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((p) => (p.id === id ? { ...p, ...product } : p))
            ),
          };
        }

        if (old.id === id) {
          return { ...old, ...product };
        }
      });

      return { previousData };
    },

    onError: (err, variables, context: any) => {
      if (!context && !context.previousData) return;
      context.previousData.forEach((productQueryData: any[]) => {
        queryClient.setQueriesData(
          { queryKey: productQueryData[0] },
          productQueryData[1]
        );
      });

      console.log(err);
    },
  });

  queryClient.setMutationDefaults(['addProduct'], {
    onSuccess: (product: Product) => {
      const queryFilter = { queryKey: ['products'], exact: false };

      const previousData = queryClient.getQueriesData(queryFilter);

      queryClient.setQueryData(['products', product.id], product);
      queryClient.setQueryData(
        ['products'],
        (old: InfiniteProductsQueryData) => {
          if (!isInfiniteProductsQueryData(old)) return old;

          const firstPage = old.pages[0]
            ? [product, ...old.pages[0]]
            : [product];

          return {
            ...old,
            pages: [firstPage, ...old.pages.slice(1)],
          };
        }
      );

      if (product.category) {
        queryClient.setQueryData(
          ['products', 'category', product.category.id],
          (old: InfiniteProductsQueryData) => {
            if (!isInfiniteProductsQueryData(old)) return old;

            const firstPage = old.pages[0]
              ? [product, ...old.pages[0]]
              : [product];

            return {
              ...old,
              pages: [firstPage, ...old.pages.slice(1)],
            };
          }
        );
      }

      return { previousData };
    },
  });

  queryClient.setMutationDefaults(['deleteProduct'], {
    onMutate: async (id: string) => {
      const queryFilter = { queryKey: ['products'], exact: false };

      await queryClient.cancelQueries(queryFilter);
      const previousData = queryClient.getQueriesData(queryFilter);

      queryClient.removeQueries({ queryKey: ['products', id] });

      queryClient.setQueriesData(queryFilter, (old?: ProductsQueryData) => {
        if (!old) return old;

        if (isInfiniteProductsQueryData(old)) {
          return {
            ...old,
            pages: old.pages.map((page) => page.filter((p) => p.id !== id)),
          };
        }
      });

      return { previousData };
    },

    onError: (err, variables, context: any) => {
      if (!context && !context.previousData) return;
      context.previousData.forEach((productQueryData: any[]) => {
        queryClient.setQueriesData(
          { queryKey: productQueryData[0] },
          productQueryData[1]
        );
      });

      console.log(err);
    },

    onSettled: (data, error, id) => {
      queryClient.invalidateQueries({ queryKey: ['products', id] });
    },
  });

  queryClient.setMutationDefaults(['addCategory'], {
    onSuccess: (category: Category) => {
      queryClient.setQueryData(['categories'], (old: CategoryQueryData) => [
        ...old,
        category,
      ]);
    },
  });

  queryClient.setMutationDefaults(['updateCategory'], {
    onMutate: async ({
      id,
      category,
    }: {
      id: string;
      category: UpdateCategory;
    }) => {
      const queryFilter = { queryKey: ['categories'] };

      await queryClient.cancelQueries(queryFilter);
      const previousData = queryClient.getQueriesData(queryFilter);

      queryClient.setQueriesData(queryFilter, (old?: CategoryQueryData) => {
        if (!old) return old;
        return old.map((c) => (c.id === id ? { ...c, ...category } : c));
      });

      return { previousData };
    },

    onError: (err, variables, context: any) => {
      if (!context && !context.previousData) return;
      queryClient.setQueryData(['categories'], context.previousData);
      console.log(err);
    },
  });

  queryClient.setMutationDefaults(['deleteCategory'], {
    onMutate: async (id: string) => {
      const queryFilter = { queryKey: ['categories'] };

      await queryClient.cancelQueries(queryFilter);
      const previousData = queryClient.getQueriesData(queryFilter);

      queryClient.setQueriesData(queryFilter, (old?: CategoryQueryData) => {
        if (!old) return old;
        return old.filter((c) => c.id !== id);
      });

      return { previousData };
    },

    onError: (err, variables, context: any) => {
      if (!context && !context.previousData) return;
      queryClient.setQueryData(['categories'], context.previousData);
      console.log(err);
    },
  });

  return queryClient;
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
