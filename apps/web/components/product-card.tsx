'use client';

import { updateProductAction } from '@/app/actions';
import { Button } from '@repo/ui/components/button';
import {
  ExternalLink,
  PartyPopper,
  ShoppingCart,
  Tag,
  Trash,
} from 'lucide-react';
import { useState } from 'react';
import { CategoryIcon } from './category-icon';
import { Product } from '@repo/api';
import { cn } from '@repo/ui/lib/utils';

const PRODUCT = {
  id: '',
  url: '',
  brand: 'The North Face',
  name: "Women's 1996 Retro Nuptse Jacket",
  images: [
    {
      url: 'https://assets.thenorthface.com/images/t_img/c_pad,b_white,f_auto,h_906,w_780,e_sharpen:70/NF0A833R4H0-HERO/NF0A833R4H0-in-TNF-Black.png',
    },
  ],
  price: 429.99,
  currency: 'CAD',
  category: {
    id: '1',
    name: 'Clothings',
    icon: 'shirt',
  },
  datePlanned: null,
  dateBought: null,
};

const PLACEHOLDER_IMAGE =
  'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png';

// FIXME: TempProduct is a workaround to avoid TypeScript error
interface TempProduct extends Product {
  plannedPurchaseDate?: string | null;
  purchaseDate?: string | null;
}

// TODO: make product and onDelete a required field
interface ProductCardProps {
  product?: TempProduct;
  onDelete?: () => void;
}

export function ProductCard({
  product = PRODUCT,
  onDelete = () => {},
}: ProductCardProps) {
  const { id, plannedPurchaseDate, purchaseDate } = product;
  const [isPlanning, setIsPlanning] = useState(plannedPurchaseDate != null);
  const [isBought, setIsBought] = useState(purchaseDate != null);

  const handlePrimaryClick = () => {
    if (isBought) {
      updateProductAction(id, { purchaseDate: null });
      setIsBought(false);
    } else if (isPlanning) {
      updateProductAction(id, { purchaseDate: new Date().toISOString() });
      setIsBought(true);
    } else {
      updateProductAction(id, {
        plannedPurchaseDate: new Date().toISOString(),
      });
      setIsPlanning(true);
    }
  };

  const handleSecondaryClick = () => {
    if (!isBought && !isPlanning) {
      updateProductAction(id, { purchaseDate: new Date().toISOString() });
      setIsBought(true);
    } else if (isPlanning && !isBought) {
      updateProductAction(id, { plannedPurchaseDate: null });
      setIsPlanning(false);
    }
  };

  return (
    <div className='group flex h-[450px] cursor-pointer flex-col gap-3 overflow-hidden'>
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
  const { images, brand, name, url } = product;
  return (
    <div
      className={cn(
        'group/media relative overflow-hidden rounded-lg',
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className='h-full w-full object-cover transition-all duration-300'
        src={images ? images[0]?.url : PLACEHOLDER_IMAGE}
        alt={`${brand} - ${name}`}
        loading='lazy'
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER_IMAGE;
        }}
      />
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
  if (!isPlanning || !isBought) {
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
  url: string;
  onDelete: () => void;
}

function ProductMediaActions({ url, onDelete }: ProductMediaActionsProps) {
  return (
    <div className='invisible absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:visible group-hover/media:opacity-100'>
      <a href={url}>
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
        <span>{currency}</span>
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
        <div className='flex h-9 w-fit items-center gap-2 rounded-md border px-3 text-sm'>
          <CategoryIcon icon={category.icon} />
          <span>{category.name}</span>
        </div>
      ) : null}

      <Button
        className={cn('w-full', primaryButtonClass)}
        variant={isBought ? 'outline' : 'default'}
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
        className={cn('w-full', secondaryButtonClass)}
        onClick={onSecondaryClick}
      >
        {isPlanning
          ? 'Remove from planned purchases'
          : 'I bought this item already'}
      </Button>
    </div>
  );
}
