import { ProductForm } from '@/components/product-form';
import { ProductFormSkeleton } from '@/components/product-form-skeleton';
import { type Product as ScrapedProduct } from '@/scraper';
import { apiUrl, getCategories } from '@/utils/api';
import { scrapeActiveTab } from '@/utils/scrape-active-tab';
import { type Category } from '@repo/api';
import { Button } from '@repo/ui/components/button';
import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';

type Data = { product: ScrapedProduct; categories: Category[] };

export const SaveProduct = () => {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    Promise.all([scrapeActiveTab(), getCategories()])
      .then(([product, categories]) => setData({ product, categories }))
      .catch((error: Error) => setError(error.message));
  }, []);

  if (error) {
    return <p className='text-destructive p-6 text-center text-sm'>{error}</p>;
  }

  if (isSaved) {
    return (
      <div className='flex flex-col items-center gap-3 p-6 text-center'>
        <p className='text-sm font-medium'>Saved to Wishify</p>
        <Button
          variant='outline'
          onClick={() => browser.tabs.create({ url: new URL('/app', apiUrl).href })}
        >
          View in Wishify
        </Button>
      </div>
    );
  }

  if (!data) return <ProductFormSkeleton />;

  return (
    <ProductForm
      product={data.product}
      categories={data.categories}
      onSaved={() => setIsSaved(true)}
    />
  );
};
