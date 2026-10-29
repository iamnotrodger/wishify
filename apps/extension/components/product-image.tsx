import { cn } from '@repo/ui/lib/utils';
import { ShoppingBag } from 'lucide-react';

interface ProductImageProps {
  url?: string;
  className?: string;
}

export const ProductImage = ({ url, className }: ProductImageProps) => (
  <div
    className={cn(
      'bg-muted flex shrink-0 items-center justify-center overflow-hidden rounded-xl',
      className
    )}
  >
    {url ? (
      <img className='size-full object-cover' src={url} alt='' />
    ) : (
      <ShoppingBag
        className='text-muted-foreground size-1/2'
        strokeWidth={1.2}
        aria-hidden
      />
    )}
  </div>
);
