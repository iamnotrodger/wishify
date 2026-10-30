import { CHROME_WEB_STORE_URL, SiteHeader } from '@/components/site-header';
import { Button } from '@repo/ui/components/button';
import { Heart, Plus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='bg-background min-h-svh'>
      <SiteHeader />

      <main>
        <section className='mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-6 pt-22 pb-16 text-center'>
          <h1 className='max-w-[820px] text-[clamp(40px,6vw,72px)] leading-[1.02] font-semibold tracking-[-0.045em]'>
            Save it now.
            <br />
            Buy it when it fits.
          </h1>
          <p className='text-muted-foreground max-w-[560px] text-lg'>
            Save anything you want from any store in one click.
          </p>
          <div className='mt-1 flex flex-wrap justify-center gap-2.5'>
            <Button asChild className='h-12 rounded-xl px-[22px] text-base'>
              <a href={CHROME_WEB_STORE_URL}>
                <Plus className='size-[18px]' />
                Add to Chrome. It&apos;s free
              </a>
            </Button>
            <Button
              asChild
              variant='outline'
              className='h-12 rounded-xl px-[22px] text-base'
            >
              <Link href='/app'>Open the web app</Link>
            </Button>
          </div>

          <ProductPagePreview />
        </section>
      </main>
    </div>
  );
}

/** Decorative store page with the extension popup open over it. */
const ProductPagePreview = () => (
  <div
    aria-hidden='true'
    className='relative mt-10 w-full max-w-[1040px] text-left'
  >
    <div className='bg-background overflow-hidden rounded-2xl border shadow-[0_24px_64px_rgba(0,0,0,0.08)]'>
      <div className='bg-muted flex h-11 items-center gap-3 border-b px-4'>
        <span className='flex gap-1.5'>
          <span className='bg-border size-2.5 rounded-full' />
          <span className='bg-border size-2.5 rounded-full' />
          <span className='bg-border size-2.5 rounded-full' />
        </span>
        <span className='bg-background text-muted-foreground flex h-[26px] max-w-[420px] flex-1 items-center rounded-[7px] border px-2.5 text-xs'>
          bellroy.com/products/tokyo-tote
        </span>
        <span className='bg-primary text-primary-foreground ml-auto flex size-[26px] items-center justify-center rounded-[7px]'>
          <Heart className='size-[13px]' strokeWidth={2.4} />
        </span>
      </div>
      <div className='flex min-h-[420px] flex-wrap gap-8 p-8'>
        <div className='flex aspect-square max-h-[400px] flex-[1_1_320px] items-center justify-center rounded-xl bg-[#F3F0EA]'>
          <ShoppingBag
            className='text-muted-foreground/60 size-[120px]'
            strokeWidth={0.7}
          />
        </div>
        <div className='flex flex-[1_1_260px] flex-col gap-3 pt-2'>
          <span className='bg-muted h-2.5 w-2/5 rounded-full' />
          <span className='text-[26px] font-semibold tracking-tight'>
            Tokyo Tote 15L
          </span>
          <span className='text-xl tabular-nums'>$189.00</span>
          <span className='bg-muted mt-2 h-2.5 w-[90%] rounded-full' />
          <span className='bg-muted h-2.5 w-3/4 rounded-full' />
          <span className='bg-border mt-3 h-11 w-[200px] rounded-lg' />
        </div>
      </div>
    </div>

    <div className='bg-background absolute top-14 right-[clamp(8px,3vw,28px)] flex w-[300px] max-w-[calc(100%-16px)] flex-col gap-3 rounded-[14px] border p-4 text-[13px] shadow-[0_20px_48px_rgba(0,0,0,0.14)]'>
      <div className='flex items-center gap-2.5'>
        <span className='size-12 flex-none rounded-[10px] bg-[#F3F0EA]' />
        <span className='flex flex-col'>
          <span className='text-muted-foreground text-xs'>Bellroy</span>
          <span className='font-medium'>Tokyo Tote 15L</span>
          <span className='font-semibold tabular-nums'>$189.00</span>
        </span>
      </div>
      <span className='bg-primary text-primary-foreground flex h-[38px] items-center justify-center rounded-[9px] font-medium'>
        Save to Wishify
      </span>
    </div>
  </div>
);
