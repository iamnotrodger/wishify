'use client';

import { updateProductAction, UpdateProductProps } from '@/app/actions';
import { Product } from '@repo/api';
import { Button } from '@repo/ui/components/button';
import { cn } from '@repo/ui/lib/utils';
import {
  ExternalLink,
  PartyPopper,
  ShoppingCart,
  Tag,
  Trash,
} from 'lucide-react';
import { useState } from 'react';
import { CategoryIcon } from './category-icon';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';

const PLACEHOLDER_IMAGE =
  'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png';

interface ProductCardProps {
  product: Product;
  onDelete?: () => void;
}

export function ProductCard({
  product,
  onDelete = () => { },
}: ProductCardProps) {
  const { id, plannedPurchaseDate, purchaseDate } = product;
  const [isPlanning, setIsPlanning] = useState(plannedPurchaseDate != null);
  const [isBought, setIsBought] = useState(purchaseDate != null);

  const updateProduct = useMutation({
    mutationKey: ['updateProduct'],
    mutationFn: async (updateProduct: UpdateProductProps) => {
      const [updatedProduct, error] = await updateProductAction(updateProduct);
      if (error) throw error;
      return updatedProduct;
    },
  });

  const handlePrimaryClick = () => {
    if (isBought) {
      updateProduct.mutate({ id, product: { purchaseDate: null } });
      setIsBought(false);
    } else if (isPlanning) {
      updateProduct.mutate({
        id,
        product: { purchaseDate: new Date().toISOString() },
      });
      setIsBought(true);
    } else {
      updateProduct.mutate({
        id,
        product: { plannedPurchaseDate: new Date().toISOString() },
      });
      setIsPlanning(true);
    }
  };

  const handleSecondaryClick = () => {
    if (!isBought && !isPlanning) {
      updateProduct.mutate({
        id,
        product: { purchaseDate: new Date().toISOString() },
      });
      setIsBought(true);
    } else if (isPlanning && !isBought) {
      updateProduct.mutate({ id, product: { plannedPurchaseDate: null } });
      setIsPlanning(false);
    }
  };

  return (
    <div className='group flex h-[450px] flex-col gap-3 overflow-hidden'>
      <ProductMedia
        product={product}
        isPlanning={isPlanning}
        isBought={isBought}
        onDelete={onDelete}
        className='flex-[1_1_100%] transition-all duration-300 group-hover:flex-[0_0_50%]'
      />
      <ProductContent product={product} className='flex flex-col gap-1' />
      <ProductActions
        product={product}
        isPlanning={isPlanning}
        isBought={isBought}
        onPrimaryClick={handlePrimaryClick}
        onSecondaryClick={handleSecondaryClick}
        className='h-0 opacity-0 transition-opacity duration-300 group-hover:flex-1 group-hover:opacity-100'
      />
    </div>
  );
}

interface ProductMediaProps {
  product: Product;
  isPlanning: boolean;
  isBought: boolean;
  onDelete: () => void;
  className?: string;
}

function ProductMedia({
  product,
  isPlanning,
  isBought,
  onDelete,
  className,
}: ProductMediaProps) {
  const { id, images, brand, name, url } = product;
  return (
    <div
      className={cn(
        'group/media relative overflow-hidden rounded-lg',
        className
      )}
    >
      <Link href={`?selectedProduct=${id}`} scroll={false}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className='h-full w-full object-cover transition-all duration-300'
          src={images && images[0] ? images[0]?.url : PLACEHOLDER_IMAGE}
          alt={`${brand} - ${name}`}
          loading='lazy'
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />
      </Link>
      <ProductTag isPlanning={isPlanning} isBought={isBought} />
      <ProductMediaActions url={url} onDelete={onDelete} />
    </div>
  );
}

interface ProductTagProps {
  isPlanning: boolean;
  isBought: boolean;
}

function ProductTag({ isPlanning, isBought }: ProductTagProps) {
  if (!isPlanning && !isBought) {
    return null;
  }

  return (
    <div
      dir='rtl'
      className='bg-muted absolute left-0 top-3 flex items-center gap-2 rounded-s-lg p-3 shadow'
    >
      <span className='text-sm'>{isBought ? 'Bought' : 'Plan to buy'}</span>
      {isBought ? (
        <Tag className='h-4 w-4' />
      ) : (
        <ShoppingCart className='h-4 w-4' />
      )}
    </div>
  );
}

interface ProductMediaActionsProps {
  url?: string | null;
  onDelete: () => void;
}

function ProductMediaActions({ url, onDelete }: ProductMediaActionsProps) {
  return (
    <div className='invisible absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:visible group-hover/media:opacity-100'>
      <a href={url ?? ''} className={url ? '' : 'hidden'}>
        <Button size='icon' variant='outline' className='rounded-full'>
          <ExternalLink />
        </Button>
      </a>
      <Button
        size='icon'
        variant='destructive'
        className='rounded-full'
        onClick={onDelete}
      >
        <Trash />
      </Button>
    </div>
  );
}

interface ProductContentProps {
  product: Product;
  className?: string;
}

function ProductContent({ product, className }: ProductContentProps) {
  const { brand, name, price, currency } = product;
  return (
    <div className={className}>
      {brand ? (
        <div className='font-semibold tracking-tight'>
          {brand.toUpperCase()}
        </div>
      ) : null}
      <div className='text-sm'>{name}</div>
      <div className='flex gap-1 text-sm font-medium'>
        <span>{currency ?? 'USD'}</span>
        <span>{price}</span>
      </div>
    </div>
  );
}

interface ProductActionsProps {
  product: Product;
  isPlanning: boolean;
  isBought: boolean;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
  className?: string;
}

function ProductActions({
  product,
  isPlanning,
  isBought,
  onPrimaryClick,
  onSecondaryClick,
  className,
}: ProductActionsProps) {
  const { category } = product;
  const primaryButtonClass = isBought ? '' : '';
  const secondaryButtonClass = isBought ? 'hidden' : '';

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {category ? (
        <div className='border-foreground flex h-9 w-fit items-center gap-2 rounded-md border px-3 text-sm'>
          <CategoryIcon icon={category.icon} />
          <span>{category.name}</span>
        </div>
      ) : null}

      <Button
        className={cn('w-full', primaryButtonClass)}
        variant={isBought ? 'ghost' : 'default'}
        onClick={onPrimaryClick}
      >
        {isBought ? (
          'Undo purchase'
        ) : isPlanning ? (
          <>
            <span>Bought it!</span>
            <PartyPopper />
          </>
        ) : (
          'Want to Buy'
        )}
      </Button>

      <Button
        variant='ghost'
        className={cn('text-primary w-full', secondaryButtonClass)}
        onClick={onSecondaryClick}
      >
        {isPlanning
          ? 'Remove from planned purchases'
          : 'I bought this item already'}
      </Button>
    </div>
  );
}
