import { signIn } from '@/auth';

export const SignInButton = () => {
  return (
    <form
      action={async () => {
        'use server';
        await signIn('google', { redirectTo: '/app' });
      }}
    >
      <button type='submit'>Sign in</button>
    </form>
  );
};
