import { PopupHeader } from '@/components/popup-header';
import { ProductFound } from '@/components/product-found';
import { ProductImage } from '@/components/product-image';
import { apiUrl } from '@/utils/api';
import { scrapeActiveTab } from '@/utils/scrape-active-tab';
import { type Product as ScrapedProduct } from '@repo/scraper';
import { Button } from '@repo/ui/components/button';
import { formatPrice } from '@repo/ui/lib/format-price';
import { Heart, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';

const perks = [{ icon: Heart, text: 'One click to save from any store' }];

export const SignIn = () => {
  const [product, setProduct] = useState<ScrapedProduct>({});

  useEffect(() => {
    scrapeActiveTab().then(setProduct);
  }, []);

  return (
    <>
      <PopupHeader>
        <ProductFound product={product} />
      </PopupHeader>
      <div className='flex flex-col gap-6 px-5 py-6'>
        {product.name && (
          <div className='bg-muted/50 flex items-center gap-3 rounded-[14px] border p-3'>
            <ProductImage
              url={product.images?.[0]?.url}
              className='size-16 rounded-[10px]'
            />
            <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
              {product.brand && (
                <span className='text-muted-foreground truncate text-xs'>
                  {product.brand}
                </span>
              )}
              <span className='line-clamp-2 text-sm font-medium'>
                {product.name}
              </span>
              <span className='text-sm font-semibold tabular-nums'>
                {formatPrice(product.price, product.priceCurrency)}
              </span>
            </div>
            <span
              role='img'
              aria-label='Locked until you sign in'
              className='bg-background text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full border'
            >
              <Lock className='size-3.5' aria-hidden />
            </span>
          </div>
        )}
        <div className='flex flex-col gap-1.5'>
          <h1 className='text-xl leading-tight font-semibold tracking-tight'>
            {product.name ? 'Sign in to save this' : 'Sign in to Wishify'}
          </h1>
          <p className='text-muted-foreground text-[13px]'>
            Wishify keeps everything you want in one place, from every store.
          </p>
        </div>
        <ul className='flex flex-col gap-2.5 text-[13px]'>
          {perks.map(({ icon: Icon, text }) => (
            <li key={text} className='flex items-center gap-2.5'>
              <Icon className='text-muted-foreground size-4' aria-hidden />
              {text}
            </li>
          ))}
        </ul>
      </div>
      <footer className='flex flex-col gap-2.5 border-t px-4 pt-3 pb-4'>
        <Button
          size='lg'
          className='w-full'
          onClick={() =>
            browser.tabs.create({ url: new URL('/login', apiUrl).href })
          }
        >
          Sign in
        </Button>
        <span className='text-muted-foreground text-center text-xs'>
          Opens Wishify in a new tab. Come back here to save.
        </span>
      </footer>
    </>
  );
};
