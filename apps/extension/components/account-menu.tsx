import { openWishify } from '@/utils/api';
import { authClient } from '@/utils/auth-client';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { ChevronDown, LayoutGrid, LogOut } from 'lucide-react';
import { type ReactNode } from 'react';

interface AccountMenuProps {
  user: { name: string; email: string; image?: string | null };
  children: ReactNode;
}

export const AccountMenu = ({ user, children }: AccountMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger className='hover:bg-accent data-[state=open]:bg-accent -mx-2 -my-1.5 flex h-8 items-center gap-2 rounded-lg px-2 outline-none focus-visible:ring-2'>
      {children}
      <ChevronDown className='text-muted-foreground size-3.5' aria-hidden />
    </DropdownMenuTrigger>
    <DropdownMenuContent align='start' className='w-66 rounded-xl p-1.5'>
      <DropdownMenuLabel className='flex items-center gap-2.5 px-2 pt-2 pb-2.5 font-normal'>
        <Avatar>
          <AvatarImage src={user.image ?? undefined} alt='' />
          <AvatarFallback className='text-xs font-medium'>
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className='flex min-w-0 flex-col'>
          <span className='truncate font-medium'>{user.name}</span>
          <span className='text-muted-foreground truncate text-xs'>
            {user.email}
          </span>
        </span>
      </DropdownMenuLabel>
      <DropdownMenuItem className='h-9' onSelect={() => openWishify('/app')}>
        <LayoutGrid />
        Open Wishify
      </DropdownMenuItem>
      <DropdownMenuSeparator className='mx-1 my-1.5' />
      <DropdownMenuItem
        variant='destructive'
        className='h-9'
        onSelect={() => authClient.signOut()}
      >
        <LogOut />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
