import { PopupHeader } from '@/components/popup-header';
import { ProductForm, toFormValues } from '@/components/product-form';
import { ProductFormSkeleton } from '@/components/product-form-skeleton';
import { ProductSaved } from '@/components/product-saved';
import { getCategories } from '@/utils/api';
import { scrapeActiveTab } from '@/utils/scrape-active-tab';
import {
  type Category,
  type CreateProductInput,
  type Product,
} from '@repo/api';
import { type Product as ScrapedProduct } from '@repo/scraper';
import { useEffect, useState } from 'react';

type Data = { product: ScrapedProduct; categories: Category[] };

export const SaveProduct = () => {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Kept across an undo so the user gets back the form as they submitted it.
  const [draft, setDraft] = useState<CreateProductInput | null>(null);
  const [saved, setSaved] = useState<Product | null>(null);

  useEffect(() => {
    Promise.all([scrapeActiveTab(), getCategories()])
      .then(([product, categories]) => {
        setData({ product, categories });
        setDraft(toFormValues(product));
      })
      .catch((error: Error) => setError(error.message));
  }, []);

  if (error) {
    return (
      <>
        <PopupHeader />
        <p className='text-destructive p-6 text-center text-sm'>{error}</p>
      </>
    );
  }

  if (!data || !draft) return <ProductFormSkeleton />;

  if (saved) {
    return <ProductSaved product={saved} onUndone={() => setSaved(null)} />;
  }

  return (
    <ProductForm
      product={data.product}
      categories={data.categories}
      defaultValues={draft}
      onCategoryCreated={(category) =>
        setData({ ...data, categories: [...data.categories, category] })
      }
      onSaved={(product, values) => {
        setDraft(values);
        setSaved(product);
      }}
    />
  );
};
