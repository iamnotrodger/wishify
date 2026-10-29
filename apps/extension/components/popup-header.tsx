import { AccountMenu } from '@/components/account-menu';
import { authClient } from '@/utils/auth-client';
import { Heart } from 'lucide-react';
import { type ReactNode } from 'react';

const Brand = () => (
  <span className='flex items-center gap-2 text-sm font-semibold'>
    <span className='bg-primary text-primary-foreground flex size-[22px] items-center justify-center rounded-md'>
      <Heart className='size-3' strokeWidth={2.4} />
    </span>
    Wishify
  </span>
);

export const PopupHeader = ({ children }: { children?: ReactNode }) => {
  const { data: session } = authClient.useSession();

  return (
    <header className='flex items-center justify-between gap-2 border-b px-4 py-3'>
      {session ? (
        <AccountMenu user={session.user}>
          <Brand />
        </AccountMenu>
      ) : (
        <Brand />
      )}
      <div className='flex min-w-0 items-center gap-1'>{children}</div>
    </header>
  );
};
