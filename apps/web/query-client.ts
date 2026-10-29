import { Category, Product, UpdateProduct } from '@repo/api';
import { QueryClient, environmentManager } from '@tanstack/react-query';

type InfiniteProductsQueryData = {
  pages: Product[][];
  pageParams: string[];
};
type ProductsQueryData = Product | InfiniteProductsQueryData;

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

  const productsFilter = { queryKey: ['products'] };
  const invalidateProducts = () =>
    queryClient.invalidateQueries(productsFilter);

  // Optimistic so the card toggles (planned/bought) respond instantly.
  queryClient.setMutationDefaults(['updateProduct'], {
    onMutate: async ({
      id,
      product,
    }: {
      id: string;
      product: UpdateProduct;
    }) => {
      await queryClient.cancelQueries(productsFilter);
      const previousData = queryClient.getQueriesData(productsFilter);

      // Products render `categories`, so resolve the ids the update sends.
      const { categoryIds, ...fields } = product;
      const allCategories =
        queryClient.getQueryData<Category[]>(['categories']) ?? [];
      const changes: Partial<Product> = categoryIds
        ? {
            ...fields,
            categories: allCategories.filter((c) => categoryIds.includes(c.id)),
          }
        : fields;

      queryClient.setQueriesData(productsFilter, (old?: ProductsQueryData) => {
        if (!old) return old;

        if (isInfiniteProductsQueryData(old)) {
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((p) => (p.id === id ? { ...p, ...changes } : p))
            ),
          };
        }

        return old.id === id ? { ...old, ...changes } : old;
      });

      return { previousData };
    },

    onError: (
      err,
      _variables,
      context?: { previousData: [unknown, unknown][] }
    ) => {
      context?.previousData.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey as readonly unknown[], data);
      });
      console.log(err);
    },

    // Refetch so server-derived fields (like a moved product's category) are correct.
    onSettled: invalidateProducts,
  });

  queryClient.setMutationDefaults(['addProduct'], {
    onSuccess: invalidateProducts,
  });

  queryClient.setMutationDefaults(['deleteProduct'], {
    onSuccess: invalidateProducts,
  });

  queryClient.setMutationDefaults(['addCategory'], {
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  return queryClient;
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (environmentManager.isServer()) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
