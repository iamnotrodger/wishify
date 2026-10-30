import { getSession, isAuthenticated } from '@/auth';
import { CategoryFilter } from '@/components/category-filter';
import ProductList from '@/components/product-list';
import { getCategoryById } from '@/services/category-service';
import { getProducts } from '@/services/product-service';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cache } from 'react';

type Props = { params: Promise<{ id: string }> };

// Shared by the title and the page so the category is read once per request.
const getCategory = cache(async (id: string) => {
  const session = await getSession();
  if (!isAuthenticated(session)) return null;
  const [category] = await getCategoryById(id, session);
  return category;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory((await params).id);
  return { title: category?.name ?? 'Category' };
}

export default async function Category({ params }: Props) {
  const { id } = await params;

  const session = await getSession();
  if (!isAuthenticated(session)) {
    return redirect(`/login?redirectTo=/app/categories/${id}`);
  }

  const category = await getCategory(id);

  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['products', 'category', id],
    initialPageParam: undefined,
    queryFn: async () => {
      const [products, error] = await getProducts(
        { sortBy: 'createdAt', sortDir: 'desc', category: id, limit: 50 },
        session
      );
      if (error) throw error;
      return products;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <h1 className='text-[28px] font-semibold tracking-tight'>
        {category?.name}
      </h1>
      <CategoryFilter />
      <ProductList category={id} />
    </HydrationBoundary>
  );
}
