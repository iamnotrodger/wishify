import { Button } from '@repo/ui/components/button';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <section className='mx-auto my-6 flex h-[80vh] max-w-md flex-col items-center justify-center gap-2'>
        <h1 className='text-primary text-5xl font-bold'>Wishify</h1>
        <div className='my-2.5 text-center'>
          <h2 className='text-xl font-semibold'>
            Turn your wishlist into a plan
          </h2>
          <h3 className='text-primary'>name tbd</h3>
        </div>
        <Link href='/app'>
          <Button>Go to app</Button>
        </Link>
      </section>
    </main>
  );
}
