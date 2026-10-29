'use client';

import { ProductCard } from '@/components/product-card';
import { fetchJson } from '@/lib/fetch-json';
import { Product } from '@repo/api';
import InfiniteScroll from '@repo/ui/components/infinite-scroll';
import { cn } from '@repo/ui/lib/utils';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Heart, Loader2 } from 'lucide-react';

const FETCH_LIMIT = 50;

const fetchProducts =
  (category?: string) =>
  async ({ pageParam }: { pageParam?: string }) => {
    const params = new URLSearchParams({
      sortBy: 'createdAt',
      sortDir: 'desc',
      limit: String(FETCH_LIMIT),
    });
    if (category) params.set('category', category);
    if (pageParam) params.set('cursor', pageParam);

    const { products } = await fetchJson<{ products: Product[] }>(
      `/api/products?${params}`
    );
    return products;
  };

interface ProductListProps {
  category?: string;
}

export default function ProductList({ category }: ProductListProps) {
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: category ? ['products', 'category', category] : ['products'],
      initialPageParam: undefined,
      queryFn: fetchProducts(category),
      getNextPageParam: (lastPage) => {
        if (!lastPage || lastPage.length < FETCH_LIMIT) return undefined;
        return lastPage[lastPage.length - 1]?.id;
      },
    });

  const products = data?.pages.flat() ?? [];

  if (error) {
    return (
      <p className='text-destructive py-16 text-center text-sm'>
        Couldn&apos;t load your items. {error.message}
      </p>
    );
  }

  if (data && products.length === 0) {
    return (
      <div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center'>
        <span className='bg-background flex size-10 items-center justify-center rounded-full border'>
          <Heart className='size-4' aria-hidden />
        </span>
        <div className='flex flex-col gap-1'>
          <h2 className='font-medium'>
            {category
              ? 'Nothing in this category yet'
              : 'Your wishlist is empty'}
          </h2>
          <p className='text-muted-foreground text-sm'>
            Save products from any store with the Wishify extension.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='grid grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-x-5 gap-y-8'>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
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
