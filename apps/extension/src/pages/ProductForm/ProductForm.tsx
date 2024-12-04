import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import cc from 'currency-codes';

import { CreateProduct, CreateProductSchema, Category } from '@repo/api';
import { Product as ScrapedProduct } from '@repo/scraper/types';
import { Button } from '@repo/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Textarea } from '@repo/ui/components/textarea';
import { cn } from '@repo/ui/lib/utils';
import { Plus } from 'lucide-react';

import ProductFormLoading from './ProductFormLoading';

const testCategories = [
  { id: '672d791a4b3f63ec36d0a345', name: '❤ Favorites' },
  { id: '6730fd807e3d9e1937290b1c', name: '🎁 Gifts' },
  {
    id: '6730fd807e3d9e1937290b2d',
    name: '💰 Splurge',
  },
];

const apiToForm = (product: ScrapedProduct) => ({
  name: product.name,
  brand: product?.brand,
  url: product.url,
  currency: product.currency ?? 'CAD',
  ...(product.price ? { price: product.price } : {}),
  ...(product.images?.length && product.images[0]
    ? { images: [product.images[0]] }
    : {}),
});

const ProductForm = ({
  product,
  isLoading,
}: {
  product: ScrapedProduct | null;
  isLoading: boolean;
}) => {
  const form = useForm<CreateProduct>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      ...(product ? apiToForm(product) : {}),
      name: '',
      brand: '',
      description: '',
      url: '',
      currency: 'CAD',
      images: [{ url: '' }],
    },
  });
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    setCategories(testCategories);
  }, []);

  useEffect(() => {
    if (product) {
      form.reset((prev) => ({
        ...prev,
        ...apiToForm(product),
      }));
    }
  }, [form, product]);

  form.watch('categoryId');

  function onSubmit(values: CreateProduct) {
    console.log(values);
  }

  const currencyCodes = useMemo<string[]>(() => cc.codes(), []);

  return (
    <Form {...form}>
      <div className='bg-brand-surface-layer px-4 py-3 text-left'>
        <h1 className='text-xl font-semibold'>Save item</h1>
      </div>
      {!isLoading ? (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex h-full w-full flex-col gap-4 p-4 pb-6'
        >
          {/* TODO: use Command, and add list creation inside Select */}
          <div className='flex gap-4'>
            <FormField
              control={form.control}
              name='images'
              render={({ field }) => (
                <FormItem
                  className={cn(
                    'bg-brand-surface-layer max-h-[116px] min-h-[116px] min-w-[116px] max-w-[116px] rounded-md border shadow-sm',
                    field.value?.length && 'border-gray-200'
                  )}
                >
                  {field.value?.length && field.value[0]?.url ? (
                    <img
                      className='h-full w-full rounded-md object-cover'
                      src={field.value[0].url}
                      alt='Image'
                    />
                  ) : null}
                </FormItem>
              )}
            />
            <div className='flex w-full flex-col gap-2 pt-1 text-left'>
              <FormField
                control={form.control}
                name='brand'
                render={({ field }) => (
                  <FormItem>
                    <Input
                      className='h-[unset] border-none p-0 text-base font-bold decoration-blue-500 decoration-2 hover:cursor-pointer hover:underline focus:cursor-auto focus:underline focus-visible:ring-[none]'
                      onChange={field.onChange}
                      value={field.value ?? undefined}
                      placeholder='Brand'
                      spellCheck={false}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <Input
                      className='text-secondary h-[unset] border-none p-0 text-sm decoration-blue-500 decoration-2 hover:cursor-pointer hover:underline focus:cursor-auto focus:underline focus-visible:ring-[none]'
                      onChange={field.onChange}
                      value={field.value ?? undefined}
                      placeholder='Product Name'
                      spellCheck={false}
                    />
                  </FormItem>
                )}
              />
              <div className='mt-2 flex flex-row items-center justify-start'>
                <FormField
                  control={form.control}
                  name='currency'
                  render={({ field }) => (
                    <FormItem className='mr-3 w-24'>
                      <Select
                        value={field.value ?? undefined}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className='border-brand-border max-w-[80px]'>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='border-brand-border max-h-[260px]'>
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
                    <FormItem>
                      <Input
                        type='number'
                        min='1'
                        step='any'
                        className='h-[unset] border-none p-0 text-left text-sm font-medium decoration-blue-500 decoration-2 hover:cursor-pointer hover:underline focus:cursor-auto focus:underline focus-visible:ring-transparent'
                        onChange={(e) => {
                          if (
                            e.target.value === '.' ||
                            typeof Number(e.target.value) === 'number'
                          ) {
                            field.onChange(e);
                          } else {
                            e.preventDefault();
                          }
                        }}
                        value={field.value ?? ''}
                        placeholder='0.00'
                      />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
          <FormField
            control={form.control}
            name='categoryId'
            render={({ field }) => (
              <FormItem className='flex w-full flex-col justify-start gap-2 text-left'>
                <FormLabel className='text-secondary w-full text-sm font-semibold'>
                  Assign to a category
                </FormLabel>
                <div className='flex min-h-[88px] flex-wrap gap-2'>
                  {categories.map(({ name, id }, i) =>
                    i != null ? (
                      <Button
                        key={name}
                        value={id}
                        variant={
                          field.value !== id
                            ? 'brand-outline'
                            : 'brand-outline-selected'
                        }
                        className={`h-9 w-fit max-w-[9rem] truncate rounded-lg px-3 text-sm font-normal`}
                        title={name}
                        onClick={() => {
                          if (field.value !== id) {
                            field.onChange(id);
                          } else {
                            form.resetField('categoryId');
                          }
                        }}
                      >
                        {name}
                      </Button>
                    ) : null
                  )}
                  <Button
                    variant='brand-outline'
                    className='h-9 w-fit max-w-[9rem] rounded-lg px-3 text-sm font-normal'
                  >
                    <Plus size={16} className='mr-0.5' />
                    Add new
                  </Button>
                </div>
                {/* <Select
          defaultValue={field.value}
          value={field.value}
          onValueChange={field.onChange}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder='Select a Category' />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {categories.map(({ name }, i) =>
              i != null ? (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ) : null
            )}
          </SelectContent>
        </Select> */}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem className='text-left'>
                <FormLabel className='w-full text-base font-normal'>
                  Notes
                </FormLabel>
                <Textarea
                  className='placeholder:text-secondary border-brand-border bg-brand-surface-layer h-[6rem] resize-none rounded-lg text-sm'
                  onChange={field.onChange}
                  value={field.value ?? undefined}
                  placeholder='Add your notes here...'
                  spellCheck={false}
                />
              </FormItem>
            )}
          />
          <Button className='w-full' variant='brand' type='submit'>
            Save item to Wishify
          </Button>
        </form>
      ) : (
        <ProductFormLoading />
      )}
    </Form>
  );
};

export default ProductForm;
