import { ProductFormSkeleton } from '@/components/product-form-skeleton';
import { SaveProduct } from '@/components/save-product';
import { SignIn } from '@/components/sign-in';
import { authClient } from '@/utils/auth-client';

function App() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <main>
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
