import { SignIn } from '@/components/sign-in';

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const redirect_to = (await searchParams).redirect_to as string | undefined;

  return (
    <main>
      <section className='mx-auto my-6 flex h-[80vh] max-w-md flex-col items-center justify-center gap-2'>
        <div className='my-2.5 text-center'>
          <h2 className='text-xl font-semibold'>Login</h2>
        </div>
        <SignIn redirectTo={redirect_to} />
      </section>
    </main>
  );
}
