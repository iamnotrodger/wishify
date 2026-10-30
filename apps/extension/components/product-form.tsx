import { PopupHeader } from '@/components/popup-header';
import { ProductFound } from '@/components/product-found';
import { createCategory, createProduct } from '@/utils/api';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type Category,
  type CreateProduct,
  type CreateProductInput,
  CreateProductSchema,
  type Product,
} from '@repo/schema';
import { type Product as ScrapedProduct } from '@repo/scraper';
import { Button } from '@repo/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { categoryIconSet, categoryNoun } from '@repo/ui/custom/category-icons';
import { ImageInput } from '@repo/ui/custom/image-input';
import { LabelPicker } from '@repo/ui/custom/label';
import { PriceInput } from '@repo/ui/custom/price-input';
import { formatPrice } from '@repo/ui/lib/format-price';
import { type KeyboardEvent } from 'react';
import { useForm, useWatch } from 'react-hook-form';

const DESCRIPTION_MAX_LENGTH = 256;
const isMac = navigator.userAgent.includes('Mac');

export const toFormValues = (product: ScrapedProduct): CreateProductInput => ({
  url: product.url,
  name: product.name ?? '',
  brand: product.brand,
  // Scraped descriptions can exceed the API limit and the user can't edit
  // this field, so trim instead of failing validation.
  description: product.description?.slice(0, DESCRIPTION_MAX_LENGTH),
  sku: product.sku,
  gtin: product.gtin,
  mpn: product.mpn,
  price: product.price ?? '',
  // Empty lets PriceInput apply its default currency.
  priceCurrency: product.priceCurrency ?? '',
  availability: product.availability,
  images: product.images ?? undefined,
  metadata: product.metadata,
});

interface ProductFormProps {
  product: ScrapedProduct;
  categories: Category[];
  defaultValues: CreateProductInput;
  onSaved: (product: Product, values: CreateProductInput) => void;
  onCategoryCreated: (category: Category) => void;
}

export const ProductForm = ({
  product,
  categories,
  defaultValues,
  onSaved,
  onCategoryCreated,
}: ProductFormProps) => {
  const form = useForm<CreateProductInput, unknown, CreateProduct>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues,
  });
  const [name, price, priceCurrency] = useWatch({
    control: form.control,
    name: ['name', 'price', 'priceCurrency'],
  });

  const imageField = (
    <FormField
      control={form.control}
      name='images'
      render={({ field }) => (
        <ImageInput
          value={field.value?.[0]?.url}
          onChange={(url) => field.onChange(url ? [{ url }] : [])}
          className='size-[72px]'
        />
      )}
    />
  );

  const onSubmit = async (values: CreateProduct) => {
    try {
      onSaved(await createProduct(values), form.getValues());
    } catch (error) {
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Failed to save',
      });
    }
  };

  const submitOnModEnter = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <>
      <PopupHeader>
        <ProductFound product={product} />
      </PopupHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={submitOnModEnter}
          className='flex flex-col'
        >
          <div className='flex flex-col gap-4 p-4'>
            {product.name ? (
              <div className='flex items-center gap-3'>
                {imageField}
                <div className='flex min-w-0 flex-col gap-0.5'>
                  {product.brand && (
                    <span className='text-muted-foreground truncate text-xs'>
                      {product.brand}
                    </span>
                  )}
                  <span className='line-clamp-2 text-sm font-medium'>
                    {name}
                  </span>
                  <span className='text-[15px] font-semibold tabular-nums'>
                    {formatPrice(price, priceCurrency)}
                  </span>
                </div>
              </div>
            ) : (
              <div className='flex items-center gap-3'>
                {imageField}
                <p className='text-muted-foreground text-sm'>
                  Couldn&apos;t find product details on this page. Fill them in
                  below.
                </p>
              </div>
            )}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} spellCheck={false} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormField
                    control={form.control}
                    name='priceCurrency'
                    render={({ field: currency }) => (
                      <FormControl>
                        <PriceInput
                          {...field}
                          currency={currency.value}
                          onCurrencyChange={currency.onChange}
                          placeholder='0.00'
                        />
                      </FormControl>
                    )}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='categoryIds'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categories</FormLabel>
                  <FormControl>
                    <LabelPicker
                      labels={categories}
                      iconSet={categoryIconSet}
                      noun={categoryNoun}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      onCreate={async (input) => {
                        const category = await createCategory(input);
                        onCategoryCreated(category);
                        return category;
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <p className='text-destructive text-sm'>
                {form.formState.errors.root.message}
              </p>
            )}
          </div>
          <footer className='border-t px-4 pt-3 pb-4'>
            <Button
              type='submit'
              size='lg'
              className='w-full'
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Saving...' : 'Save to Wishify'}
              <kbd className='rounded bg-white/15 px-1.5 py-px font-sans text-[11px]'>
                {isMac ? '⌘↵' : 'Ctrl ↵'}
              </kbd>
            </Button>
          </footer>
        </form>
      </Form>
    </>
  );
};
