import { isServer, QueryClient } from '@tanstack/react-query';
import { updateProductAction, UpdateProductProps } from '@/app/actions';
import { Product } from '@repo/api';

function makeQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

  queryClient.setMutationDefaults(['updateProduct'], {
    onMutate: async (updateProduct) => {
      const queryFilter = { queryKey: ['products'], exact: false };

      await queryClient.cancelQueries(queryFilter);
      const previousProducts = queryClient.getQueriesData(queryFilter);

      queryClient.setQueriesData(
        queryFilter,
        (old?: { pages?: Product[][] }) => {
          if (!old || !old.pages) return old;
          return {
            ...old,
            pages: old.pages?.map((page) =>
              page.map((product) =>
                product.id === updateProduct.id
                  ? { ...product, ...updateProduct.product }
                  : product
              )
            ),
          };
        }
      );

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
