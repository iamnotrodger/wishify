import { Product, UpdateProduct } from '@repo/api';
import { QueryClient, isServer } from '@tanstack/react-query';

type InfiniteProductsQueryData = {
  pages: Product[][];
  pageParams: string[];
};
type ProductsQueryData = Product | InfiniteProductsQueryData;

const isInfiniteProductsQueryData = (
  data: ProductsQueryData
): data is InfiniteProductsQueryData => {
  return (
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
      const previousProducts = queryClient.getQueriesData(queryFilter);

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

      return { previousProducts };
    },

    onError: (err, variables, context: any) => {
      if (!context && !context.previousProducts) return;
      context.previousProducts.forEach((productQueryData: any[]) => {
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

      const previousProducts = queryClient.getQueriesData(queryFilter);

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

      return { previousProducts };
    },
  });

  queryClient.setMutationDefaults(['deleteProduct'], {
    onMutate: async (id: string) => {
      const queryFilter = { queryKey: ['products'], exact: false };

      await queryClient.cancelQueries(queryFilter);
      const previousProducts = queryClient.getQueriesData(queryFilter);

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

      return { previousProducts };
    },

    onError: (err, variables, context: any) => {
      if (!context && !context.previousProducts) return;
      context.previousProducts.forEach((productQueryData: any[]) => {
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
