import ProductForm from '@/components/product-form';
import { getProduct } from '@repo/scraper';
import { useEffect, useMemo, useState } from 'react';

import '@repo/ui/globals.css';
import './App.css';

type PageData = {
  url: string;
  html: string;
};

function App() {
  const [pageData, setPageData] = useState<PageData | null>(null);

  useEffect(() => {
    // Request data from the background script
    chrome?.runtime?.sendMessage({ type: 'GET_PAGE_DATA' }, (response) => {
      if (response?.payload?.url) {
        setPageData(response.payload);
      }
    });
  }, []);

  // Outside the extension there is no background script to wait for.
  const isLoading = !!chrome?.runtime?.id && !pageData;

  const [product, error] = useMemo(
    () => (pageData ? getProduct(pageData.url, pageData.html) : [null, null]),
    [pageData]
  );

  if (error) {
    console.log(error);
  }

  return (
    <>
      <ProductForm product={product} isLoading={isLoading} />
    </>
  );
}

export default App;
