import { auth, isAuthenticated } from '@/auth';
import { ProductCard } from '@/components/product-card';
import { ProductForm } from '@/components/product-form';
import { getCategoryById } from '@/services/category-service';
import { getProducts } from '@/services/product-service';
import { Button } from '@repo/ui/components/button';
import { SidebarTrigger } from '@repo/ui/components/sidebar';
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

  // TODO: handle error
  const [category, error] = await getCategoryById(id, session);

  if (error) throw error;

  const [products] = await getProducts(
    { sortBy: 'createdAt', sortDir: 'desc', limit: 50, category: id },
    session
  );

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
        <div className='grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4'>
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
