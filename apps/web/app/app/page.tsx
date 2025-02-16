import { auth, isAuthenticated } from '@/auth';
import { ProductForm } from '@/components/product-form';
import { Button } from '@repo/ui/components/button';
import { SidebarTrigger } from '@repo/ui/components/sidebar';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getProductsActions } from '@/app/actions';
import ProductList from '@/components/product-list';

export default async function App() {
  const session = await auth();
  if (!isAuthenticated(session)) {
    return redirect('/login?redirectTo=/app');
  }

  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['posts'],
    initialPageParam: undefined,
    queryFn: async () => {
      const [products, error] = await getProductsActions({
        sortBy: 'createdAt',
        sortDir: 'desc',
        limit: 50,
      });
      if (error) throw error;
      return products;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='p-4 md:px-20 md:py-10'>
        <header className='flex shrink-0 items-center gap-2'>
          <SidebarTrigger className='text-foreground h-8 w-8' />
          <h1 className='text-2xl font-medium tracking-tight'>Inbox</h1>
          <ProductForm>
            <Button className='ml-auto'>
              <Plus />
              Add new item
            </Button>
          </ProductForm>
        </header>
        <main className='py-4'>
          <ProductList />
        </main>
      </div>
    </HydrationBoundary>
  );
}
