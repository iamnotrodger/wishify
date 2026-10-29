import { type Product as ScrapedProduct } from '@repo/scraper';

const getHostname = (url?: string | null) => {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, '') : null;
  } catch {
    return null;
  }
};

export const ProductFound = ({ product }: { product: ScrapedProduct }) => {
  const hostname = getHostname(product.url);
  if (!product.name || !hostname) return null;

  return (
    <span className='text-muted-foreground flex min-w-0 items-center gap-1.5 text-xs'>
      <span className='size-1.5 shrink-0 rounded-full bg-green-600' />
      <span className='truncate'>Product found on {hostname}</span>
    </span>
  );
};
