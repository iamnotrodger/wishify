import { auth } from '@/auth';
import { GoogleIcon } from '@/components/google-icon';
import { Button } from '@repo/ui/components/button';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

interface SignInProps {
  redirectTo: string;
}

export const SignIn = ({ redirectTo }: SignInProps) => {
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
      <Button
        type='submit'
        variant='outline'
        className='h-11 w-full gap-2.5 rounded-[10px] [&_svg]:size-[18px]'
      >
        <GoogleIcon />
        Continue with Google
      </Button>
    </form>
  );
};
