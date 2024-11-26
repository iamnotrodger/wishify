import { signIn } from '@/auth';

export const SignIn = () => {
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
