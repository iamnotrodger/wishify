'use client';

import {
  deleteProductAction,
  updateProductAction,
  UpdateProductProps,
} from '@/app/actions';
import { CategoryInput } from '@/components/category-input';
import {
  type Action,
  getStatus,
  primaryActions,
  secondaryActions,
  type Status,
} from '@/lib/product-status';
import { Product, UpdateProductInput } from '@repo/schema';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui/components/alert-dialog';
import { Button } from '@repo/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { formatPrice } from '@repo/ui/lib/format-price';
import { cn } from '@repo/ui/lib/utils';
import { useMutation } from '@tanstack/react-query';
import {
  Check,
  ExternalLink,
  type LucideIcon,
  MoreHorizontal,
  PartyPopper,
  ShoppingBag,
  ShoppingCart,
  Trash,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { id } = product;
  const status = getStatus(product);

  // Optimistic (see query-client), so the status reads straight from props.
  const updateProduct = useMutation({
    mutationKey: ['updateProduct'],
    mutationFn: async (updateProduct: UpdateProductProps) => {
      const [updatedProduct, error] = await updateProductAction(updateProduct);
      if (error) throw new Error(error);
      return updatedProduct;
    },
  });
  const update = (product: UpdateProductInput) =>
    updateProduct.mutate({ id, product });
  const run = (action: Action) => update(action.update());

  return (
    // cqw is the card's width: the image starts square and gives half its
    // height to the actions on hover, so the card height never changes.
    <div className='group @container flex flex-col gap-3 overflow-hidden'>
      <ProductMedia
        product={product}
        status={status}
        onAction={run}
        className='h-[100cqw] shrink-0 transition-[height] duration-300 group-hover:h-[50cqw] group-has-aria-expanded:h-[50cqw]'
      />
      <ProductContent product={product} className='flex flex-col gap-1' />
      <ProductActions
        product={product}
        status={status}
        onAction={run}
        onCategoriesChange={(categoryIds) => update({ categoryIds })}
        className='h-0 overflow-hidden opacity-0 transition-[height,opacity] duration-300 group-hover:h-[50cqw] group-hover:opacity-100 group-has-aria-expanded:h-[50cqw] group-has-aria-expanded:opacity-100'
      />
    </div>
  );
}

interface ProductMediaProps {
  product: Product;
  status: Status;
  onAction: (action: Action) => void;
  className?: string;
}

function ProductMedia({
  product,
  status,
  onAction,
  className,
}: ProductMediaProps) {
  return (
    <div
      className={cn(
        'group/media bg-muted relative overflow-hidden rounded-lg',
        className
      )}
    >
      <Link
        href={`?product_id=${product.id}`}
        scroll={false}
        className='block size-full'
      >
        <ProductImage product={product} />
      </Link>
      <StatusBadge status={status} />
      <div className='invisible absolute top-3 right-3 opacity-0 transition-opacity duration-300 group-hover:visible group-hover/media:opacity-100 has-data-[state=open]:visible has-data-[state=open]:opacity-100 pointer-coarse:visible pointer-coarse:opacity-100'>
        <ProductMenu product={product} status={status} onAction={onAction} />
      </div>
    </div>
  );
}

function ProductImage({ product }: { product: Product }) {
  const { images, brand, name } = product;
  const url = images?.[0]?.url;
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div className='flex size-full items-center justify-center'>
        <ShoppingBag
          className='text-muted-foreground/60 size-16'
          strokeWidth={1}
          aria-hidden
        />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className='size-full object-contain'
      src={url}
      alt={[brand, name].filter(Boolean).join(' - ')}
      loading='lazy'
      onError={() => setFailed(true)}
    />
  );
}

interface ProductContentProps {
  product: Product;
  className?: string;
}

function ProductContent({ product, className }: ProductContentProps) {
  const { brand, name, price, priceCurrency } = product;
  const formattedPrice = formatPrice(price, priceCurrency);
  return (
    <div className={className}>
      {brand ? (
        <div className='font-semibold tracking-tight'>
          {brand.toUpperCase()}
        </div>
      ) : null}
      <div className='text-sm'>{name}</div>
      {formattedPrice ? (
        <div className='text-sm font-medium'>{formattedPrice}</div>
      ) : null}
    </div>
  );
}

interface ProductActionsProps {
  product: Product;
  status: Status;
  onAction: (action: Action) => void;
  onCategoriesChange: (categoryIds: string[]) => void;
  className?: string;
}

function ProductActions({
  product,
  status,
  onAction,
  onCategoriesChange,
  className,
}: ProductActionsProps) {
  const { categories } = product;
  const primary = primaryActions[status];
  const secondary = secondaryActions[status];

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <CategoryInput
        value={categories?.map(({ id }) => id) ?? []}
        onChange={onCategoriesChange}
      />

      <Button
        className='w-full'
        variant={status === 'bought' ? 'ghost' : 'default'}
        onClick={() => onAction(primary)}
      >
        <span>{primary.label}</span>
        {status === 'planned' && <PartyPopper />}
      </Button>

      {secondary && (
        <Button
          variant='ghost'
          className='text-primary w-full'
          onClick={() => onAction(secondary)}
        >
          {secondary.label}
        </Button>
      )}
    </div>
  );
}

const statusBadges: Partial<
  Record<Status, { label: string; icon: LucideIcon; className?: string }>
> = {
  planned: { label: 'Planned', icon: ShoppingCart },
  bought: { label: 'Bought', icon: Check, className: 'text-green-700' },
};

function StatusBadge({ status }: { status: Status }) {
  const badge = statusBadges[status];
  if (!badge) return null;

  return (
    <span
      className={cn(
        'bg-background absolute top-3 left-3 inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-medium shadow-sm',
        badge.className
      )}
    >
      <badge.icon className='size-3' strokeWidth={2.5} aria-hidden />
      {badge.label}
    </span>
  );
}

interface ProductMenuProps {
  product: Product;
  status: Status;
  onAction: (action: Action) => void;
}

function ProductMenu({ product, status, onAction }: ProductMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const primary = primaryActions[status];
  const secondary = secondaryActions[status];

  const deleteProduct = useMutation({
    mutationKey: ['deleteProduct'],
    mutationFn: async (id: string) => {
      const error = await deleteProductAction(id);
      if (error) throw new Error(error);
    },
  });

  return (
    <>
      {/* Non-modal so opening the dialog from an item doesn't leave the page inert. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            size='icon'
            variant='outline'
            aria-label={`Actions for ${product.name}`}
            className='size-8 rounded-full shadow-sm'
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-48'>
          {product.url && (
            <DropdownMenuItem asChild>
              <a href={product.url} target='_blank' rel='noopener noreferrer'>
                <ExternalLink />
                Open in store
              </a>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => onAction(primary)}>
            <primary.icon />
            {primary.label}
          </DropdownMenuItem>
          {secondary && (
            <DropdownMenuItem onSelect={() => onAction(secondary)}>
              <secondary.icon />
              {secondary.label}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant='destructive'
            onSelect={() => setConfirmOpen(true)}
          >
            <Trash />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              {product.name} will be removed from your wishlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant='destructive'
                onClick={() => deleteProduct.mutate(product.id)}
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
