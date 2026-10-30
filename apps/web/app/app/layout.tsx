import { getSession, isAuthenticated } from '@/auth';
import { AppHeader } from '@/components/app-header';
import { ProductModal } from '@/components/product-modal';
import { getCategories } from '@/services/category-service';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Props = { children: React.ReactNode };

export default async function AppLayout({ children }: Props) {
  const session = await getSession();
  if (!isAuthenticated(session)) {
    return redirect('/login?redirectTo=/app');
  }

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const [categories, error] = await getCategories(session);
      if (error) throw error;
      return categories;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='bg-muted/40 min-h-svh'>
        <AppHeader user={session.user} />
        <main className='mx-auto flex max-w-7xl flex-col gap-7 px-6 pt-10 pb-16'>
          {children}
        </main>
      </div>
      <ProductModal />
    </HydrationBoundary>
  );
}
