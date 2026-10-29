import { apiUrl } from '@/utils/api';
import { Button } from '@repo/ui/components/button';
import { browser } from 'wxt/browser';

export const SignIn = () => (
  <div className='flex flex-col items-center gap-3 p-6 text-center'>
    <p className='text-muted-foreground text-sm'>
      Sign in to Wishify to save items from any store.
    </p>
    <Button
      onClick={() => browser.tabs.create({ url: new URL('/login', apiUrl).href })}
    >
      Sign in
    </Button>
  </div>
);
