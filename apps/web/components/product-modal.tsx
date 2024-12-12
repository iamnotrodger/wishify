'use client';

import { getProductByIdAction } from '@/app/actions';
import { Product } from '@repo/api';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const PLACEHOLDER_IMAGE =
  'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png';

export function ProductModal() {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // TODO: replace this with react query
  useEffect(() => {
    const fetchProduct = async () => {
      const id = searchParams.get('selectedProduct');
      if (!id) return;

      const [product] = await getProductByIdAction(id);
      setProduct(product);
      setOpen(true);
    };

    fetchProduct();
  }, [searchParams]);

  const handleClose = () => {
    setProduct(null);
    setOpen(false);

    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete('selectedProduct');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='overflow-hidden p-0 sm:max-w-[750px]'>
        <div className='flex'>
          <div className='flex-1'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className='h-full w-full object-cover transition-all duration-300'
              src={
                product && product.images && product.images[0]
                  ? product.images[0]?.url
                  : PLACEHOLDER_IMAGE
              }
              alt={`${product?.brand} - ${product?.name}`}
              loading='lazy'
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER_IMAGE;
              }}
            />
          </div>
          <div className='mx-10 my-14 h-96 flex-1'>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-8 items-center gap-4'>
                <Label htmlFor='name' className='text-right'>
                  Name
                </Label>
                <Input
                  id='name'
                  className='col-span-7'
                  value={product?.name ?? undefined}
                  readOnly
                />
              </div>
              <div className='grid grid-cols-8 items-center gap-4'>
                <Label htmlFor='price' className='text-right'>
                  Price
                </Label>
                <Input
                  id='price'
                  className='col-span-7'
                  value={product?.price ?? undefined}
                  readOnly
                />
              </div>
              <div className='grid grid-cols-8 items-center gap-4'>
                <Label htmlFor='url' className='text-right'>
                  URL
                </Label>
                <Input
                  id='url'
                  className='col-span-7'
                  value={product?.url ?? undefined}
                  readOnly
                />
              </div>
            </div>

            <DialogFooter className='mt-auto'>
              <Button type='submit'>Save</Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
