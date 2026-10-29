import { getSession, isAuthenticated, isEmailPasswordEnabled } from '@/auth';
import { DevSignIn } from '@/components/dev-sign-in';
import { LoginShowcase } from '@/components/login-showcase';
import { SignIn } from '@/components/sign-in';
import { toSafeRedirect } from '@/lib/utils';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const redirectTo = toSafeRedirect(params.redirectTo);
  const error = typeof params.error === 'string' ? params.error : null;

  if (isAuthenticated(await getSession())) redirect(redirectTo);

  return (
    <div className='flex min-h-svh flex-wrap text-sm'>
      <main className='bg-background flex min-w-0 flex-[1_1_480px] flex-col px-6 py-8'>
        <Link
          href='/'
          className='inline-flex items-center gap-2 self-start text-[15px] font-semibold tracking-tight sm:ml-10'
        >
          <span className='bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-[7px]'>
            <Heart className='size-[13px]' strokeWidth={2.4} />
          </span>
          Wishify
        </Link>

        <div className='flex flex-1 items-center justify-center py-12'>
          <div className='flex w-full max-w-[360px] flex-col gap-7'>
            <div className='flex flex-col gap-2'>
              <h1 className='text-3xl leading-tight font-semibold tracking-tight'>
                Want it now?
                <br />
                Plan it instead.
              </h1>
              <p className='text-muted-foreground'>
                Save anything from any store. Wishify tells you when it fits
                your budget, and when it gets cheaper.
              </p>
            </div>

            <div className='flex flex-col gap-3'>
              {error && (
                <p role='alert' className='text-destructive'>
                  {error}
                </p>
              )}
              <SignIn redirectTo={redirectTo} />
              <p className='text-muted-foreground text-center text-xs'>
                New here? The same button creates your account.
              </p>
            </div>

            {isEmailPasswordEnabled && (
              <div className='flex flex-col gap-4'>
                <div className='text-muted-foreground flex items-center gap-3 text-xs'>
                  <span className='h-px flex-1 bg-border' />
                  Dev only
                  <span className='h-px flex-1 bg-border' />
                </div>
                <DevSignIn redirectTo={redirectTo} />
              </div>
            )}

            <p className='text-muted-foreground border-t pt-5 text-xs'>
              By continuing, you agree to the Terms and Privacy Policy. The
              extension only reads the product page you choose to save.
            </p>
          </div>
        </div>
      </main>

      <LoginShowcase />
    </div>
  );
}
