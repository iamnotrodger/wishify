import type {
  Category,
  CreateCategory,
  CreateProduct,
  Product,
} from '@repo/api';
import { browser } from 'wxt/browser';

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

export const createCategory = (category: CreateCategory) =>
  request<Category>('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  });

export const createProduct = (product: CreateProduct) =>
  request<Product>('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });

export const deleteProduct = (id: string) =>
  request<{ success: boolean }>(`/api/products/${id}`, { method: 'DELETE' });

export const openWishify = (path: string) =>
  browser.tabs.create({ url: new URL(path, apiUrl).href });
