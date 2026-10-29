import ProductForm from '@/components/product-form';
import { Product, scrapeProduct } from '@/scraper';
import { useEffect, useState } from 'react';

import '@repo/ui/globals.css';
import './App.css';

const scrapeActiveTab = async (): Promise<Product> => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id == null) throw new Error('No active tab');

  const [injection] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      url: document.URL,
      html: document.documentElement.outerHTML,
    }),
  });
  if (!injection?.result) throw new Error('Unable to read page');

  return scrapeProduct(injection.result.url, injection.result.html);
};

function App() {
  // Outside the extension there is no tab to scrape.
  const isExtension = !!globalThis.chrome?.runtime?.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(isExtension);

  useEffect(() => {
    if (!isExtension) return;

    scrapeActiveTab()
      .then(setProduct)
      .catch((error) => console.log(error))
      .finally(() => setIsLoading(false));
  }, [isExtension]);

  return (
    <>
      <ProductForm product={product} isLoading={isLoading} />
    </>
  );
}

export default App;
