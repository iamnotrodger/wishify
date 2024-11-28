import '@repo/ui/globals.css';
import './App.css';
import ProductForm from './pages/ProductForm/ProductForm';
import { useEffect, useMemo, useState } from 'react';
import { getProduct } from '@repo/scraper';
import { Product } from '@repo/scraper/types';
type PageData = {
  url: string;
  html: string;
};

function App() {
  const [pageData, setPageData] = useState<PageData>({ url: '', html: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Request data from the background script
    chrome?.runtime?.sendMessage({ type: 'GET_PAGE_DATA' }, (response) => {
      if (response?.payload?.url) {
        setPageData(response.payload);
      }
    });

    if (!chrome?.runtime?.id) {
      setIsLoading(false);
    }
  }, []);

  const [product, error] = useMemo(() => {
    const { html, url } = pageData;
    let productFetched: [Product | null, Error | null] = [null, null];
    productFetched = getProduct(url, html);

    setIsLoading(false);
    return productFetched;
  }, [pageData]);

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
