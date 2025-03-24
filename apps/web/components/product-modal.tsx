'use client';

import {
  getProductByIdAction,
  updateProductAction,
  UpdateProductProps,
} from '@/app/actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateProduct, UpdateProductSchema } from '@repo/api';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { cn } from '@repo/ui/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';

const PLACEHOLDER_IMAGE =
  'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png';

const classes = {
  formItem: 'grid grid-cols-8 items-center gap-4',
  formInput: 'col-span-6',
  formLabel: 'col-span-2 text-right text-sm text-nowrap',
};

export function ProductModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const id = searchParams.get('product_id');

  const { data: product } = useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      if (!id) return null;
      const [product, error] = await getProductByIdAction(id);
      if (error) throw error;
      return product;
    },
    enabled: !!id,
  });

  const form = useForm<UpdateProduct>({
    resolver: zodResolver(UpdateProductSchema),
  });

  const updateProduct = useMutation({
    mutationKey: ['updateProduct'],
    mutationFn: async (updateProduct: UpdateProductProps) => {
      const [updatedProduct, error] = await updateProductAction(updateProduct);
      if (error) throw error;
      return updatedProduct;
    },
  });

  useEffect(() => {
    if (product) {
      form.reset(product);
    }
  }, [product]);

  const onSubmit = useCallback(
    async (values: UpdateProduct) => {
      if (!id || !form.formState.isDirty) {
        console.log('No changes to save');
        return;
      }

      await updateProduct.mutateAsync({ id, product: values });
    },
    [id, form.formState.isDirty]
  );

  const handleClose = () => {
    form.reset();

    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete('product_id');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Dialog open={!!id && product != null} onOpenChange={handleClose}>
      <DialogContent className='overflow-hidden p-0 sm:max-w-[900px]'>
        <DialogHeader className='hidden'>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Make changes to your product here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className='flex h-[500px]'>
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
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='mx-10 my-14 flex-1 flex flex-col gap-2'
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className={classes.formItem}>
                    <FormLabel className={classes.formLabel}>
                      Product Name<span className='text-red-500'>*</span>
                    </FormLabel>
                    <Input
                      className={classes.formInput}
                      onChange={field.onChange}
                      value={field.value ?? ''}
                      placeholder='e.g. Wide Jeans'
                      spellCheck={false}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='brand'
                render={({ field }) => (
                  <FormItem className={classes.formItem}>
                    <FormLabel className={classes.formLabel}>Brand</FormLabel>
                    <Input
                      className={classes.formInput}
                      onChange={field.onChange}
                      value={field.value ?? ''}
                      placeholder='e.g. Biggie & Co.'
                      spellCheck={false}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem className={classes.formItem}>
                    <FormLabel className={classes.formLabel}>Price</FormLabel>
                    <Input
                      type='number'
                      step='0.01'
                      onChange={field.onChange}
                      className={classes.formInput}
                      value={field.value ?? ''}
                      placeholder='e.g. 100.00'
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='images'
                render={({ field }) => (
                  <FormItem className={classes.formItem}>
                    <FormLabel className={classes.formLabel}>
                      Image URL
                    </FormLabel>
                    <Input
                      className={classes.formInput}
                      onChange={(e) =>
                        field.onChange([{ url: e.target.value }])
                      }
                      value={field.value?.[0]?.url ?? ''}
                      placeholder='Insert image url here'
                      spellCheck={false}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='url'
                render={({ field }) => (
                  <FormItem className={classes.formItem}>
                    <FormLabel className={classes.formLabel}>
                      Product URL
                    </FormLabel>
                    <Input
                      className={classes.formInput}
                      onChange={field.onChange}
                      value={field.value ?? ''}
                      placeholder='Insert product url here'
                      spellCheck={false}
                    />
                  </FormItem>
                )}
              />

              <DialogFooter className='mt-auto'>
                <Button
                  type='submit'
                  disabled={
                    !product ||
                    updateProduct.isPending ||
                    !form.formState.isValid
                  }
                >
                  <Loader2
                    className={cn(
                      'animate-spin',
                      updateProduct.isPending ? '' : 'hidden'
                    )}
                  />
                  Save
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
