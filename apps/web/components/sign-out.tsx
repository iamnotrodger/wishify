import { auth } from '@/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export function SignOut() {
  return (
    <form
      action={async () => {
        'use server';
        await auth.api.signOut({ headers: await headers() });
        redirect('/');
      }}
    >
      <button type='submit'>Sign Out</button>
    </form>
  );
}
