'use client';

import { updateProduct } from '@/app/actions';
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

const product = {
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
    name: 'Clothings',
    icon: 'shirt',
  },
  datePlanned: null,
  dateBought: null,
};

const PLACEHOLDER_IMAGE =
  'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png';

export function ProductCard() {
  const {
    id,
    url,
    brand,
    name,
    images,
    price,
    currency,
    category,
    datePlanned,
    dateBought,
  } = product;
  const [isPlanning, setIsPlanning] = useState(datePlanned != null);
  const [isBought, setIsBought] = useState(dateBought != null);

  const handlePrimaryButtonClick = () => {
    if (!isPlanning) {
      updateProduct(id, { datePlanned: new Date().toISOString() });
      setIsPlanning(true);
    } else if (!isBought) {
      updateProduct(id, { dateBought: new Date().toISOString() });
      setIsBought(true);
    }
  };

  const handleSecondaryButtonClick = () => {
    if (isBought) {
      updateProduct(id, { dateBought: null });
      setIsBought(false);
    } else if (isPlanning) {
      updateProduct(id, { datePlanned: null });
      setIsPlanning(false);
    } else {
      updateProduct(id, { dateBought: new Date().toISOString() });
      setIsBought(true);
    }
  };

  return (
    <div className='group flex h-[450px] cursor-pointer flex-col gap-3 overflow-hidden'>
      <div className='group/media relative flex-[1_1_100%] overflow-hidden rounded-lg transition-all duration-300 group-hover:flex-[0_0_50%]'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className='h-full w-full object-cover transition-all duration-300'
          src={images[0]?.url}
          alt={`${brand} - ${name}`}
          loading='lazy'
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />
        {isPlanning || isBought ? (
          <div
            dir='rtl'
            className='bg-muted absolute left-0 top-3 flex items-center gap-2 rounded-s-lg p-3 shadow'
          >
            <span className='text-sm'>
              {isBought ? 'Bought' : 'Plan to buy'}
            </span>
            {isBought ? (
              <Tag className='h-4 w-4' />
            ) : (
              <ShoppingCart className='h-4 w-4' />
            )}
          </div>
        ) : null}
        <div className='invisible absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:visible group-hover/media:opacity-100'>
          <a href={url}>
            <Button size='icon' variant='outline' className='rounded-full'>
              <ExternalLink />
            </Button>
          </a>
          <Button size='icon' variant='destructive' className='rounded-full'>
            <Trash />
          </Button>
        </div>
      </div>
      <div className='flex flex-col gap-1 align-top'>
        <div className='font-semibold tracking-tight'>
          {brand.toUpperCase()}
        </div>
        <div className='text-sm'>{name}</div>
        <div className='flex gap-1 text-sm font-medium'>
          <span>{currency}</span>
          <span>{price}</span>
        </div>
      </div>
      <div className='flex h-0 flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:flex-1 group-hover:opacity-100'>
        <div className='flex h-9 w-fit items-center gap-2 rounded-md border px-3 text-sm'>
          <CategoryIcon icon={category.icon} />
          <span>{category.name}</span>
        </div>

        {!isBought && (
          <Button className='w-full' onClick={handlePrimaryButtonClick}>
            {isPlanning ? (
              <>
                <span>Bought it!</span>
                <PartyPopper />
              </>
            ) : (
              'Want to Buy'
            )}
          </Button>
        )}

        <Button
          variant='ghost'
          className='w-full'
          onClick={handleSecondaryButtonClick}
        >
          {isBought
            ? 'Undo purchase'
            : isPlanning
              ? 'Remove from planned purchases'
              : 'I bought this item already'}
        </Button>
      </div>
    </div>
  );
}
