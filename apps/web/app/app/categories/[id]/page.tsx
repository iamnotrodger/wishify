import { getProductsActions } from '@/app/actions';
import { auth, isAuthenticated } from '@/auth';
import { ProductForm } from '@/components/product-form';
import ProductList from '@/components/product-list';
import { getCategoryById } from '@/services/category-service';
import { Button } from '@repo/ui/components/button';
import { SidebarTrigger } from '@repo/ui/components/sidebar';
import { QueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function Category({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!isAuthenticated(session)) {
    return redirect(`/login?redirectTo=/app/categories/${id}`);
  }

  const [category] = await getCategoryById(id, session);

  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['products', id],
    initialPageParam: undefined,
    queryFn: async () => {
      const [products, error] = await getProductsActions({
        sortBy: 'createdAt',
        sortDir: 'desc',
        category: id,
        limit: 50,
      });
      if (error) throw error;
      return products;
    },
  });

  return (
    <div className='p-4 md:px-20 md:py-10'>
      <header className='flex shrink-0 items-center gap-2'>
        <SidebarTrigger className='text-foreground h-8 w-8' />
        <h1 className='text-2xl font-medium tracking-tight'>
          {category?.name}
        </h1>
        <ProductForm categoryId={id}>
          <Button className='ml-auto'>
            <Plus />
            Add new item
          </Button>
        </ProductForm>
      </header>
      <main className='py-4'>
        <ProductList category={id} />
      </main>
    </div>
  );
}
