'use client';

import { ProductCard } from '@/components/product-card';
import InfiniteScroll from '@repo/ui/components/infinite-scroll';
import { cn } from '@repo/ui/lib/utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Fragment } from 'react';
import { getProductsActions } from '../app/actions';

const FETCH_LIMIT = 50;

const fetchProducts =
  (category?: string) =>
  async ({ pageParam }: { pageParam?: string }) => {
    const [products, error] = await getProductsActions({
      sortBy: 'createdAt',
      sortDir: 'desc',
      category: category,
      cursor: pageParam,
      limit: FETCH_LIMIT,
    });
    if (error) throw error;
    return products;
  };

interface ProductListProps {
  category?: string;
}

export default function ProductList({ category }: ProductListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: category ? ['products', category] : ['products'],
      initialPageParam: undefined,
      queryFn: fetchProducts(category),
      getNextPageParam: (lastPage) => {
        if (!lastPage || lastPage.length < FETCH_LIMIT) return undefined;
        return lastPage[lastPage.length - 1]?.id;
      },
    });

  return (
    <div>
      <div className='grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4'>
        {data?.pages.map((page, i) => (
          <Fragment key={i}>
            {page?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Fragment>
        ))}
      </div>

      <InfiniteScroll
        hasMore={hasNextPage}
        isLoading={isFetchingNextPage}
        next={fetchNextPage}
        threshold={1}
      >
        <div className='my-2 flex justify-center'>
          <Loader2
            className={cn(
              'h-8 w-8 animate-spin opacity-0 transition',
              isFetchingNextPage && hasNextPage && 'opacity-100'
            )}
          />
        </div>
      </InfiniteScroll>
    </div>
  );
}
