import { auth } from '@/auth';
import { Button } from '@repo/ui/components/button';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

interface SignInProps {
  redirectTo?: string;
}

export const SignIn = ({ redirectTo = '/app' }: SignInProps) => {
  return (
    <form
      action={async () => {
        'use server';
        const { url } = await auth.api.signInSocial({
          body: { provider: 'google', callbackURL: redirectTo },
          headers: await headers(),
        });
        if (url) redirect(url);
      }}
    >
      <Button type='submit'>Sign In</Button>
    </form>
  );
};
