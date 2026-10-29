'use client';

import { signOutAction } from '@/app/actions';
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
import { LogOut } from 'lucide-react';

interface AccountMenuProps {
  user: { name: string; email: string; image?: string | null };
}

export function AccountMenu({ user }: AccountMenuProps) {
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label='Account'
        className='rounded-full outline-none focus-visible:ring-2'
      >
        <Avatar>
          <AvatarImage src={user.image ?? undefined} alt='' />
          <AvatarFallback className='text-xs font-medium'>
            {initial}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-66 rounded-xl p-1.5'>
        <DropdownMenuLabel className='flex flex-col px-2 pt-2 pb-2.5 font-normal'>
          <span className='truncate font-medium'>{user.name}</span>
          <span className='text-muted-foreground truncate text-xs'>
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='mx-1 my-1.5' />
        <DropdownMenuItem
          variant='destructive'
          className='h-9'
          onSelect={() => signOutAction()}
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
