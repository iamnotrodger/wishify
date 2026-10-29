import { getSession, isAuthenticated } from '@/auth';
import { CategoryFilter } from '@/components/category-filter';
import ProductList from '@/components/product-list';
import { getProducts } from '@/services/product-service';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';

export default async function App() {
  const session = await getSession();
  if (!isAuthenticated(session)) {
    return redirect('/login?redirectTo=/app');
  }

  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['products'],
    initialPageParam: undefined,
    queryFn: async () => {
      const [products, error] = await getProducts(
        { sortBy: 'createdAt', sortDir: 'desc', limit: 50 },
        session
      );
      if (error) throw error;
      return products;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <h1 className='text-[28px] font-semibold tracking-tight'>Wishlist</h1>
      <CategoryFilter />
      <ProductList />
    </HydrationBoundary>
  );
}
