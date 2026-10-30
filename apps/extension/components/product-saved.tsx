import { PopupHeader } from '@/components/popup-header';
import { ProductImage } from '@/components/product-image';
import { deleteProduct, openWishify } from '@/utils/api';
import { type Product } from '@repo/schema';
import { Button } from '@repo/ui/components/button';
import { formatPrice } from '@repo/ui/lib/format-price';
import { Check } from 'lucide-react';
import { useState } from 'react';

interface ProductSavedProps {
  product: Product;
  onUndone: () => void;
}

export const ProductSaved = ({ product, onUndone }: ProductSavedProps) => {
  const [isUndoing, setIsUndoing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const details = [
    product.brand,
    ...(product.categories ?? []).map(({ name }) => name),
  ].filter(Boolean);

  const undo = async () => {
    setIsUndoing(true);
    try {
      await deleteProduct(product.id);
      onUndone();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to undo');
      setIsUndoing(false);
    }
  };

  return (
    <>
      <PopupHeader>
        <Button variant='ghost' size='sm' disabled={isUndoing} onClick={undo}>
          Undo
        </Button>
      </PopupHeader>
      <div className='flex flex-col items-center gap-4 px-6 pt-8 pb-4 text-center'>
        <span className='flex size-12 items-center justify-center rounded-full bg-green-50 text-green-700'>
          <Check className='size-[22px]' strokeWidth={2.5} aria-hidden />
        </span>
        <h1 className='text-lg font-semibold tracking-tight'>Saved</h1>
        <div className='flex w-full items-center gap-3 rounded-xl border p-3 text-left'>
          <ProductImage
            url={product.images?.[0]?.url}
            className='size-14 rounded-lg'
          />
          <div className='flex min-w-0 flex-1 flex-col'>
            <span className='truncate text-sm font-medium'>{product.name}</span>
            {details.length > 0 && (
              <span className='text-muted-foreground truncate text-xs'>
                {details.join(' · ')}
              </span>
            )}
          </div>
          <span className='text-sm font-semibold tabular-nums'>
            {formatPrice(product.price, product.priceCurrency)}
          </span>
        </div>
        {error && <p className='text-destructive text-sm'>{error}</p>}
      </div>
      <footer className='grid grid-cols-2 gap-2 px-4 pt-3 pb-4'>
        <Button variant='outline' size='lg' onClick={() => openWishify('/app')}>
          Open wishlist
        </Button>
        <Button
          size='lg'
          onClick={() => openWishify(`/app?product_id=${product.id}`)}
        >
          View item
        </Button>
      </footer>
    </>
  );
};
