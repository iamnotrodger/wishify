import { auth } from '@/auth';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { APIError } from 'better-auth/api';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/** Signs in, creating the account on first use so there is no sign-up step. */
const signInOrSignUp = async (email: string, password: string) => {
  const requestHeaders = await headers();

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: requestHeaders,
    });
    return null;
  } catch (signInError) {
    if (!(signInError instanceof APIError)) throw signInError;

    try {
      await auth.api.signUpEmail({
        body: { email, password, name: email.split('@')[0] ?? email },
        headers: requestHeaders,
      });
      return null;
    } catch (signUpError) {
      if (!(signUpError instanceof APIError)) throw signUpError;
      // Sign-up only fails here when the account exists, so the password was wrong.
      return signInError.message;
    }
  }
};

interface DevSignInProps {
  redirectTo: string;
}

export const DevSignIn = ({ redirectTo }: DevSignInProps) => {
  return (
    <form
      className='flex flex-col gap-3'
      action={async (formData: FormData) => {
        'use server';
        const error = await signInOrSignUp(
          String(formData.get('email')),
          String(formData.get('password'))
        );

        if (error) {
          redirect(`/login?${new URLSearchParams({ error, redirectTo })}`);
        }
        redirect(redirectTo);
      }}
    >
      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='dev-email'>Email</Label>
        <Input
          id='dev-email'
          name='email'
          type='email'
          required
          defaultValue='dev@wishify.local'
        />
      </div>
      <div className='flex flex-col gap-1.5'>
        <Label htmlFor='dev-password'>Password</Label>
        <Input
          id='dev-password'
          name='password'
          type='password'
          required
          defaultValue='password'
        />
      </div>
      <Button type='submit' variant='secondary' className='h-10'>
        Dev sign in
      </Button>
    </form>
  );
};
