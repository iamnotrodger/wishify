import { signIn } from '@/auth';
import { Button } from '@repo/ui/components/button';

interface SignInProps {
  redirectTo?: string;
}

export const SignIn = ({ redirectTo = '/app' }: SignInProps) => {
  return (
    <form
      action={async () => {
        'use server';
        await signIn('google', { redirectTo });
      }}
    >
      <Button type='submit'>Sign In</Button>
    </form>
  );
};
