import { useEffect, useMemo, useState } from 'react';
import cc from 'currency-codes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/select';
import { Button } from '@repo/ui/button';
import { Form, FormControl, FormField, FormItem } from '@repo/ui/form';
import { Input } from '@repo/ui/input';
import { CreateProductSchema } from '@repo/api';

const testGroups = [{ name: 'list1' }, { name: 'list2' }];

function ProductForm() {
  const form = useForm<z.infer<typeof CreateProductSchema>>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      name: '',
      description: '',
      url: '',
      currency: 'CAD',
      images: [{ url: '' }],
    },
  });
  const [categories, setCategories] = useState<{ name: string }[]>([]);
  useEffect(() => {
    setCategories(testGroups);
  }, []);

  const currencyCodes = useMemo<string[]>(() => cc.codes(), []);

  function onSubmit(values: z.infer<typeof CreateProductSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-4 p-5 w-full h-full items-center'
      >
        {/* TODO: add list creation inside Select */}
        <FormField
          control={form.control}
          name='category'
          render={({ field }) => (
            <FormItem className='w-full'>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a category' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(({ name }) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <div className='flex flex-col text-left pb-2 w-full'>
          <div className='border min-h-[100px] bg-gray-100 rounded-md mb-1.5'>
            {/* TODO: add image uploading, fix aspect ratio */}
            <FormField
              control={form.control}
              name='images'
              render={({ field }) => (
                <FormItem className='w-full'>
                  {field.value?.length && field.value[0]?.url ? (
                    <img
                      className='max-h-[150px] rounded-md'
                      src={field.value[0].url}
                      alt='Image'
                    />
                  ) : null}
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <Input
                  className='font-semibold text-lg border-none focus-visible:ring-[none] p-0 focus:cursor-auto hover:cursor-pointer hover:underline focus:underline decoration-blue-500 decoration-2'
                  onChange={field.onChange}
                  value={field.value}
                  placeholder='Product Name'
                />
              </FormItem>
            )}
          />
          {/* TODO: Show urlParsed if unfocused */}
          <FormField
            control={form.control}
            name='url'
            render={({ field }) => (
              <FormItem>
                <Input
                  type='url'
                  className='text-xs bg-transparent mt-[-1rem] border-none focus-visible:ring-[none] shadow-transparent p-0 focus:cursor-auto hover:cursor-pointer hover:underline focus:underline decoration-blue-500 decoration-2'
                  onChange={field.onChange}
                  value={field.value}
                  placeholder='Product URL'
                />
              </FormItem>
            )}
          />
        </div>
        <div className='flex flex-row items-center justify-between w-full gap-2'>
          <FormField
            control={form.control}
            name='currency'
            render={({ field }) => (
              <FormItem className='w-full'>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className='max-w-[100px]'>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className='max-h-[200px]'>
                    {/* TODO: Fix render speed of long list here. using virutalization, react-window, or similar. */}
                    {currencyCodes.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              // TODO: Format input for currency-only values
              <FormItem>
                <Input
                  type='text'
                  className='text-xl font-semibold text-right border-none focus-visible:ring-transparent p-0 focus:cursor-auto hover:cursor-pointer hover:underline decoration-blue-500 decoration-2'
                  onChange={field.onChange}
                  value={field.value ? field.value : ''}
                  placeholder='0.00'
                />
              </FormItem>
            )}
          />
        </div>
        <Button className='w-full' type='submit'>
          Save
        </Button>
      </form>
    </Form>
  );
}

export default ProductForm;