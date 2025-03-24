'use client';

import { createCategoriesAction } from '@/app/actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCategory, CreateCategorySchema } from '@repo/api';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog';
import { Form, FormField, FormItem, FormLabel } from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { cn } from '@repo/ui/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export function CategoryForm({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const addCategory = useMutation({
    mutationKey: ['addCategory'],
    mutationFn: async (category: CreateCategory) => {
      const [newCategory, error] = await createCategoriesAction(category);
      if (error) throw error;
      return newCategory;
    },
  });

  const form = useForm<CreateCategory>({
    resolver: zodResolver(CreateCategorySchema),
  });

  const onSubmit = async (values: CreateCategory) => {
    await addCategory.mutateAsync(values);
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='grid grid-cols-8 items-center gap-3'>
                  <FormLabel className='col-span-1 text-sm text-right'>
                    Name
                  </FormLabel>
                  <Input
                    className='col-span-7'
                    onChange={field.onChange}
                    value={field.value ?? ''}
                    placeholder='Category Name'
                    spellCheck={false}
                  />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='submit'>
                <Loader2
                  className={cn(
                    'animate-spin',
                    addCategory.isPending ? '' : 'hidden'
                  )}
                />
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
