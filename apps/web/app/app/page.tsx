import { ProductCard } from '@/components/product-card';
import { Button } from '@repo/ui/components/button';
import { SidebarTrigger } from '@repo/ui/components/sidebar';
import { Plus } from 'lucide-react';

export default function Home() {
  return (
    <div className='p-4 md:px-20 md:py-10'>
      <header className='flex shrink-0 items-center gap-2'>
        <SidebarTrigger className='' />
        <h1 className='text-2xl font-medium tracking-tight'>Inbox</h1>
        <Button className='ml-auto'>
          <Plus />
          Add new item
        </Button>
      </header>
      <main className='py-4'>
        <div className='grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4'>
          {Array.from({ length: 20 }).map((_, i) => (
            <ProductCard key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
