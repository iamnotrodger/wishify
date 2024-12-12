'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CreateProduct, CreateProductSchema } from '@repo/api';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog';
import { Form, FormField, FormItem, FormLabel } from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { useForm } from 'react-hook-form';

const formItemClass = 'grid grid-cols-8 items-center gap-3';
const formInputClass = 'col-span-6';
const formLabelClass = 'col-span-2 text-right text-sm';

export function ProductForm({ children }: { children: React.ReactNode }) {
  const form = useForm<CreateProduct>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      currency: 'CAD',
    },
  });

  const onSubmit = (values: CreateProduct) => {
    console.log(values);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Add a new item</DialogTitle>
          <DialogDescription className='text-muted-foreground'>
            Fill in the product details to add a new item.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-3 pb-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className={formItemClass}>
                    <FormLabel className={formLabelClass}>
                      Product Name<span className='text-red-500'>*</span>
                    </FormLabel>
                    <Input
                      className={formInputClass}
                      onChange={field.onChange}
                      value={field.value ?? ''}
                      placeholder='e.g. Wide Jeans'
                      spellCheck={false}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='brand'
                render={({ field }) => (
                  <FormItem className={formItemClass}>
                    <FormLabel className={formLabelClass}>Brand</FormLabel>
                    <Input
                      className={formInputClass}
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
                  <FormItem className={formItemClass}>
                    <FormLabel className={formLabelClass}>
                      Price<span className='text-red-500'>*</span>
                    </FormLabel>
                    <Input
                      type='number'
                      step='0.01'
                      onChange={field.onChange}
                      className={formInputClass}
                      value={field.value ?? undefined}
                      placeholder='e.g. 100.00'
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='images'
                render={({ field }) => (
                  <FormItem className={formItemClass}>
                    <FormLabel className={formLabelClass}>Image URL</FormLabel>
                    <Input
                      className={formInputClass}
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
                  <FormItem className={formItemClass}>
                    <FormLabel className={formLabelClass}>
                      Product URL
                    </FormLabel>
                    <Input
                      className={formInputClass}
                      onChange={field.onChange}
                      value={field.value ?? ''}
                      placeholder='Insert product url here'
                      spellCheck={false}
                    />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type='submit'>Add item</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
