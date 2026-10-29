import type { Category, CreateProduct, Product } from '@repo/api';

export const apiUrl: string = import.meta.env.WXT_API_URL;
if (!apiUrl) throw new Error('WXT_API_URL is not set');

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  // The web app's session cookie only goes along on cross-origin requests
  // when credentials are included.
  const res = await fetch(new URL(path, apiUrl), {
    ...init,
    credentials: 'include',
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? body.message);
  return body as T;
};

export const getCategories = () => request<Category[]>('/api/categories');

export const createProduct = (product: CreateProduct) =>
  request<Product>('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
