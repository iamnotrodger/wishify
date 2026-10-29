import { auth } from '@/auth';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

interface DevSignInProps {
  redirectTo?: string;
}

export const DevSignIn = ({ redirectTo = '/app' }: DevSignInProps) => {
  return (
    <form
      className='flex w-full flex-col gap-2'
      action={async (formData: FormData) => {
        'use server';
        const email = String(formData.get('email'));
        const password = String(formData.get('password'));
        const requestHeaders = await headers();

        try {
          await auth.api.signInEmail({
            body: { email, password },
            headers: requestHeaders,
          });
        } catch (error) {
          if (!(error instanceof APIError)) throw error;
          // Creates the account on first use so there is no sign-up step.
          await auth.api.signUpEmail({
            body: { email, password, name: email.split('@')[0] ?? email },
            headers: requestHeaders,
          });
        }

        redirect(redirectTo);
      }}
    >
      <Input name='email' type='email' defaultValue='dev@wishify.local' />
      <Input name='password' type='password' defaultValue='password' />
      <Button type='submit' variant='outline'>
        Dev sign in
      </Button>
    </form>
  );
};
