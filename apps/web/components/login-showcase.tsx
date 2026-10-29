import { Check, Headphones } from 'lucide-react';

/** Decorative preview of saved items, a monthly budget and savings. */
export const LoginShowcase = () => (
  <aside
    aria-label='What Wishify does'
    className='bg-muted flex flex-[1_1_480px] items-center justify-center px-6 py-12'
  >
    <div aria-hidden='true' className='relative h-[480px] w-full max-w-[420px]'>
      <div className='bg-background absolute top-0 left-0 flex w-[260px] -rotate-3 flex-col gap-2.5 rounded-[18px] p-3 shadow-[0_12px_32px_rgba(0,0,0,0.08)]'>
        <div className='relative flex aspect-square items-center justify-center rounded-xl bg-[#EEF1F4]'>
          <Headphones
            className='text-muted-foreground/60 size-16'
            strokeWidth={1}
          />
          <span className='bg-background absolute top-2.5 left-2.5 inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold text-green-700 shadow-xs'>
            $120 off
          </span>
        </div>
        <div className='flex flex-col gap-0.5 px-0.5 pb-0.5'>
          <span className='text-muted-foreground text-xs'>Best Buy</span>
          <span className='font-medium'>WH-1000XM5 Headphones</span>
          <span className='font-semibold tabular-nums'>
            $279.99{' '}
            <span className='text-muted-foreground text-[13px] font-normal line-through'>
              $399.99
            </span>
          </span>
        </div>
      </div>

      <div className='bg-background absolute top-[210px] right-0 flex w-[250px] rotate-2 flex-col gap-2.5 rounded-2xl p-4 shadow-[0_12px_32px_rgba(0,0,0,0.08)]'>
        <div className='flex justify-between text-[13px]'>
          <span className='font-medium'>November</span>
          <span className='text-muted-foreground tabular-nums'>
            $332.99 / $400
          </span>
        </div>
        <div className='bg-muted h-1.5 overflow-hidden rounded-full'>
          <div className='bg-primary h-full w-[83%]' />
        </div>
        <span className='text-muted-foreground text-xs'>
          $67.01 rolls into December
        </span>
      </div>

      <div className='bg-foreground text-background absolute bottom-6 left-8 inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] shadow-[0_12px_32px_rgba(0,0,0,0.12)]'>
        <Check className='size-3.5 text-green-400' strokeWidth={2.5} />
        Saved $612 by waiting
      </div>
    </div>
  </aside>
);
