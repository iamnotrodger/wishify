'use client';

import { updateProductAction, UpdateProductProps } from '@/app/actions';
import { CategoryInput } from '@/components/category-input';
import { fetchJson } from '@/lib/fetch-json';
import {
  getStatus,
  primaryActions,
  secondaryActions,
} from '@/lib/product-status';
import { Image, Product, UpdateProductInput } from '@repo/schema';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { ImageInput } from '@repo/ui/custom/image-input';
import { PriceInput } from '@repo/ui/custom/price-input';
import { LOCALE } from '@repo/ui/lib/format-price';
import { cn } from '@repo/ui/lib/utils';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { ArrowUpRight, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';

// Marks fields where Escape should revert the edit instead of closing the dialog.
const INLINE_EDIT = 'data-inline-edit';

const inlineEditClass =
  'hover:bg-accent/60 focus-visible:ring-ring/50 -mx-1.5 rounded-md bg-transparent px-1.5 outline-none focus-visible:bg-transparent focus-visible:ring-2';

const savedDate = new Intl.DateTimeFormat(LOCALE, {
  month: 'short',
  day: 'numeric',
});

const getHostname = (url?: string | null) => {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, '') : null;
  } catch {
    return null;
  }
};

// "InStock" -> "In stock"
const formatAvailability = (availability: string) => {
  const words = availability.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export function ProductModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const id = searchParams.get('product_id');

  // Keeps the last product while closing so the exit animation has content.
  const { data: product, isPlaceholderData } = useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      if (!id) return null;
      return fetchJson<Product>(`/api/products/${id}`);
    },
    enabled: !!id,
    placeholderData: keepPreviousData,
  });

  const updateProduct = useMutation({
    mutationKey: ['updateProduct'],
    mutationFn: async (updateProduct: UpdateProductProps) => {
      const [updatedProduct, error] = await updateProductAction(updateProduct);
      if (error) throw new Error(error);
      return updatedProduct;
    },
  });

  const handleClose = () => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete('product_id');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Dialog
      open={!!id && product != null && !isPlaceholderData}
      onOpenChange={handleClose}
    >
      <DialogContent
        showCloseButton={false}
        className='max-h-[calc(100svh-6rem)] gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-[1000px]'
        onEscapeKeyDown={(event) => {
          if (document.activeElement?.hasAttribute(INLINE_EDIT)) {
            event.preventDefault();
          }
        }}
      >
        {product && (
          <ProductDetail
            product={product}
            onUpdate={(changes) =>
              updateProduct.mutate({ id: product.id, product: changes })
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ProductDetailProps {
  product: Product;
  onUpdate: (changes: UpdateProductInput) => void;
}

function ProductDetail({ product, onUpdate }: ProductDetailProps) {
  const { url, name, brand, images, categories, availability, createdAt } =
    product;
  const hostname = getHostname(url);
  const status = getStatus(product);
  const primary = primaryActions[status];
  const secondary = secondaryActions[status];
  const meta = [
    availability && formatAvailability(availability),
    `Saved ${savedDate.format(new Date(createdAt))}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <DialogTitle className='sr-only'>{name}</DialogTitle>
      <DialogDescription className='sr-only'>Product details</DialogDescription>

      <header className='bg-background/90 sticky top-0 z-10 flex items-center justify-between gap-3 border-b py-3 pr-4 pl-6 backdrop-blur'>
        {url ? (
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-muted-foreground hover:text-foreground inline-flex min-w-0 items-center gap-1.5 text-[13px]'
          >
            <span className='truncate'>{hostname ?? 'Store'}</span>
            <ArrowUpRight className='size-3 shrink-0' />
          </a>
        ) : (
          <span />
        )}
        <DialogClose asChild>
          <Button variant='ghost' size='icon-sm' aria-label='Close'>
            <X />
          </Button>
        </DialogClose>
      </header>

      <div className='flex flex-wrap gap-8 p-6'>
        <ProductGallery
          images={images ?? []}
          onChange={(images) => onUpdate({ images })}
        />

        <div className='flex min-w-0 flex-[1_1_360px] flex-col gap-5'>
          <div className='flex flex-col gap-1.5'>
            <EditableText
              key={`brand:${brand}`}
              aria-label='Brand'
              value={brand ?? ''}
              placeholder='Add brand'
              className='text-muted-foreground text-[13px]'
              onSave={(value) => onUpdate({ brand: value || null })}
            />
            <EditableText
              key={`name:${name}`}
              aria-label='Name'
              value={name}
              required
              className='text-[26px] leading-tight font-semibold tracking-tight'
              onSave={(value) => onUpdate({ name: value })}
            />
            <EditablePrice
              key={`price:${product.price}:${product.priceCurrency}`}
              product={product}
              onUpdate={onUpdate}
            />
            <span className='text-muted-foreground text-[13px]'>{meta}</span>
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <Button
              size='lg'
              variant={status === 'bought' ? 'outline' : 'default'}
              className='h-[42px] rounded-[10px]'
              onClick={() => onUpdate(primary.update())}
            >
              <primary.icon />
              {primary.label}
            </Button>
            {url && (
              <Button
                asChild
                size='lg'
                variant='outline'
                className='h-[42px] rounded-[10px]'
              >
                <a href={url} target='_blank' rel='noopener noreferrer'>
                  Open in store
                  <ArrowUpRight />
                </a>
              </Button>
            )}
          </div>

          <dl className='flex flex-col border-t text-[13px]'>
            <div className='flex items-start gap-4 border-b py-2'>
              <dt className='text-muted-foreground w-24 shrink-0 leading-7'>
                Categories
              </dt>
              <dd className='min-w-0 flex-1'>
                <CategoryInput
                  value={categories?.map(({ id }) => id) ?? []}
                  onChange={(categoryIds) => onUpdate({ categoryIds })}
                />
              </dd>
            </div>
          </dl>

          {secondary && (
            <button
              type='button'
              onClick={() => onUpdate(secondary.update())}
              className='text-muted-foreground hover:text-foreground self-start text-[13px] underline underline-offset-3'
            >
              {secondary.label}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

interface ProductGalleryProps {
  images: Image[];
  onChange: (images: Image[]) => void;
}

function ProductGallery({ images, onChange }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);
  // Clamped so removing the last image never points past the end.
  const index = Math.min(selected, Math.max(images.length - 1, 0));

  return (
    <div className='flex min-w-0 flex-[1_1_360px] flex-col gap-2.5'>
      <ImageInput
        value={images[index]?.url}
        onChange={(url) =>
          onChange(
            url
              ? images.length
                ? images.map((image, i) => (i === index ? { url } : image))
                : [{ url }]
              : images.filter((_, i) => i !== index)
          )
        }
        className='aspect-square w-full rounded-[14px] [&_img]:p-6'
      />
      {images.length > 1 && (
        <div className='grid grid-cols-4 gap-2.5'>
          {images.map((image, i) => (
            <button
              key={image.url}
              type='button'
              aria-label={`Image ${i + 1}`}
              aria-pressed={i === index}
              onClick={() => setSelected(i)}
              className={cn(
                'bg-muted aspect-square overflow-hidden rounded-[10px] border-2',
                i === index ? 'border-primary' : 'border-transparent'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className='size-full object-contain p-1 mix-blend-multiply dark:mix-blend-normal'
                src={image.url}
                alt=''
                loading='lazy'
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  'aria-label': string;
}

// Uncontrolled and keyed by value, so a saved or refetched value remounts it.
function EditableText({
  value,
  onSave,
  required,
  placeholder,
  className,
  'aria-label': ariaLabel,
}: EditableTextProps) {
  return (
    <textarea
      {...{ [INLINE_EDIT]: '' }}
      aria-label={ariaLabel}
      rows={1}
      defaultValue={value}
      placeholder={placeholder}
      spellCheck={false}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          event.currentTarget.blur();
        } else if (event.key === 'Escape') {
          event.currentTarget.value = value;
          event.currentTarget.blur();
        }
      }}
      onBlur={(event) => {
        const next = event.currentTarget.value.trim();
        if (required && !next) {
          event.currentTarget.value = value;
        } else if (next !== value) {
          onSave(next);
        }
      }}
      className={cn(
        'placeholder:text-muted-foreground field-sizing-content resize-none',
        inlineEditClass,
        className
      )}
    />
  );
}

interface EditablePriceProps {
  product: Product;
  onUpdate: (changes: UpdateProductInput) => void;
}

function EditablePrice({ product, onUpdate }: EditablePriceProps) {
  const savedPrice = product.price != null ? String(product.price) : '';
  const [price, setPrice] = useState(savedPrice);
  const [currency, setCurrency] = useState(product.priceCurrency ?? '');
  const cancelled = useRef(false);

  // The DB keeps price and currency together, so a currency alone isn't saved.
  const save = (nextPrice: string, nextCurrency: string) => {
    if (nextPrice === '') {
      if (product.price != null) onUpdate({ price: null, priceCurrency: null });
      return;
    }
    const amount = Number(nextPrice);
    if (!Number.isFinite(amount) || amount < 0) {
      setPrice(savedPrice);
      return;
    }
    if (amount !== product.price || nextCurrency !== product.priceCurrency) {
      onUpdate({ price: amount, priceCurrency: nextCurrency });
    }
  };

  return (
    <PriceInput
      {...{ [INLINE_EDIT]: '' }}
      aria-label='Price'
      placeholder='Add price'
      value={price}
      currency={currency}
      onChange={(event) => setPrice(event.target.value)}
      onCurrencyChange={(next) => {
        setCurrency(next);
        if (product.priceCurrency && next !== product.priceCurrency) {
          save(price, next);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        } else if (event.key === 'Escape') {
          cancelled.current = true;
          setPrice(savedPrice);
          event.currentTarget.blur();
        }
      }}
      onBlur={(event) => {
        if (cancelled.current) {
          cancelled.current = false;
          return;
        }
        save(event.currentTarget.value, currency);
      }}
      className='hover:border-input -ml-2.5 h-11 w-56 border-transparent shadow-none [&_input]:text-2xl [&_input]:font-semibold [&_input]:tracking-tight'
    />
  );
}
