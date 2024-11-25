import '@repo/ui/globals.css';
import './App.css';
import ProductForm from './pages/ProductForm/ProductForm';
import { useEffect, useMemo, useState } from 'react';
import { getProduct } from '@repo/scraper';
type PageData = {
  url: string;
  html: string;
};

function App() {
  const [pageData, setPageData] = useState<PageData>({ url: '', html: '' });

  useEffect(() => {
    // Request data from the background script
    chrome.runtime.sendMessage({ type: 'GET_PAGE_DATA' }, (response) => {
      if (response?.payload) {
        setPageData(response.payload);
      }
    });
  }, []);

  const [product, error] = useMemo(() => {
    const { html, url } = pageData;
    if (html && url) {
      return getProduct(url, html);
    }
    return [null, null];
  }, [pageData]);

  if (error) {
    console.log(error);
  }

  return (
    <>
      <ProductForm product={product} />
    </>
  );
}

export default App;
