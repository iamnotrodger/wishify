import { type Product as ScrapedProduct } from '@/scraper';
import { createProduct } from '@/utils/api';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type Category,
  type CreateProduct,
  type CreateProductInput,
  CreateProductSchema,
} from '@repo/api';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Textarea } from '@repo/ui/components/textarea';
import { cn } from '@repo/ui/lib/utils';
import cc from 'currency-codes';
import { useForm } from 'react-hook-form';

const currencyCodes = cc.codes();
const DESCRIPTION_MAX_LENGTH = 256;

const toFormValues = (product: ScrapedProduct): CreateProductInput => ({
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
  priceCurrency: product.priceCurrency ?? 'CAD',
  availability: product.availability,
  images: product.images ?? undefined,
  metadata: product.metadata,
});

interface ProductFormProps {
  product: ScrapedProduct;
  categories: Category[];
  onSaved: () => void;
}

export const ProductForm = ({
  product,
  categories,
  onSaved,
}: ProductFormProps) => {
  const form = useForm<CreateProductInput, unknown, CreateProduct>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: toFormValues(product),
  });
  const image = product.images?.[0];

  const onSubmit = async (values: CreateProduct) => {
    try {
      await createProduct(values);
      onSaved();
    } catch (error) {
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Failed to save',
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-4 p-4 pb-6'
      >
        {!product.name && (
          <p className='text-muted-foreground text-sm'>
            Couldn&apos;t find product details on this page. Fill them in
            below.
          </p>
        )}
        <div className='flex gap-4'>
          <div className='bg-muted size-[116px] shrink-0 rounded-md border'>
            {image && (
              <img
                className='size-full rounded-md object-cover'
                src={image.url}
                alt=''
              />
            )}
          </div>
          <div className='flex w-full flex-col gap-2 pt-1'>
            <FormField
              control={form.control}
              name='brand'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder='Brand'
                      spellCheck={false}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Product name'
                      spellCheck={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex gap-2'>
              <FormField
                control={form.control}
                name='priceCurrency'
                render={({ field }) => (
                  <FormItem>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='w-[88px]'>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-h-[260px]'>
                        {currencyCodes.map((code) => (
                          <SelectItem key={code} value={code}>
                            {code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        min='0'
                        step='any'
                        placeholder='0.00'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        {categories.length > 0 && (
          <FormField
            control={form.control}
            name='categoryId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <div className='flex flex-wrap gap-2'>
                  {categories.map(({ id, name }) => (
                    <Button
                      key={id}
                      type='button'
                      variant='outline'
                      title={name}
                      className={cn(
                        'max-w-36 truncate font-normal',
                        field.value === id && 'border-primary bg-accent'
                      )}
                      onClick={() =>
                        field.onChange(field.value === id ? null : id)
                      }
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name='notes'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  className='h-20 resize-none'
                  placeholder='Add your notes here...'
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
        <Button type='submit' disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save to Wishify'}
        </Button>
      </form>
    </Form>
  );
};
