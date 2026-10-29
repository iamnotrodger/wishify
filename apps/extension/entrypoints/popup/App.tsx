import { ProductFormSkeleton } from '@/components/product-form-skeleton';
import { SaveProduct } from '@/components/save-product';
import { SignIn } from '@/components/sign-in';
import { authClient } from '@/utils/auth-client';
import { Button } from '@repo/ui/components/button';
import { LogOut } from 'lucide-react';

function App() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <main>
      <header className='bg-muted flex items-center justify-between px-4 py-3'>
        <h1 className='text-xl font-semibold'>Save item</h1>
        {session && (
          <Button
            variant='ghost'
            size='icon-sm'
            title={`Sign out ${session.user.email}`}
            onClick={() => authClient.signOut()}
          >
            <LogOut />
          </Button>
        )}
      </header>
      {isPending ? (
        <ProductFormSkeleton />
      ) : session ? (
        <SaveProduct />
      ) : (
        <SignIn />
      )}
    </main>
  );
}

export default App;
