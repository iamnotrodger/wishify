import { Button } from '@repo/ui/components/button';
import { Heart } from 'lucide-react';
import Link from 'next/link';

// TODO: replace with the Chrome Web Store listing once published.
export const CHROME_WEB_STORE_URL = '#';

export const SiteHeader = () => (
  <header className='border-b'>
    <div className='mx-auto flex min-h-16 max-w-[1200px] flex-wrap items-center justify-between gap-3 px-6'>
      <Link
        href='/'
        className='inline-flex items-center gap-2 font-semibold tracking-tight'
      >
        <span className='bg-primary text-primary-foreground flex size-[26px] items-center justify-center rounded-[7px]'>
          <Heart className='size-3.5' strokeWidth={2.4} />
        </span>
        Wishify
      </Link>
      <nav aria-label='Main' className='flex items-center gap-1'>
        <Button asChild variant='ghost'>
          <Link href='/login'>Sign in</Link>
        </Button>
        <Button asChild>
          <a href={CHROME_WEB_STORE_URL}>Add to Chrome</a>
        </Button>
      </nav>
    </div>
  </header>
);
