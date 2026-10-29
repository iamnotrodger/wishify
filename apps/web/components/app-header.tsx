import { AccountMenu } from '@/components/account-menu';
import { Heart } from 'lucide-react';
import Link from 'next/link';

interface AppHeaderProps {
  user: { name: string; email: string; image?: string | null };
}

export function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className='bg-background/85 border-b'>
      <div className='mx-auto flex min-h-15 max-w-7xl items-center justify-between gap-3 px-6'>
        <Link
          href='/app'
          className='flex items-center gap-2 text-[15px] font-semibold tracking-tight'
        >
          <span className='bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-[7px]'>
            <Heart className='size-[13px]' strokeWidth={2.4} />
          </span>
          Wishify
        </Link>
        <AccountMenu user={user} />
      </div>
    </header>
  );
}
