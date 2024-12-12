'use server';

import { auth, isAuthenticated } from '@/auth';
import { getProductById, updateProduct } from '@/services/product-service';
import { Product, UpdateProduct } from '@repo/api';

type ProductActionResult<T = Product> = [T | null, Error | null];

const UNAUTHORIZED_ERROR = new Error('Unauthorized');

export async function updateProductAction(id: string, product: UpdateProduct) {
  const session = await auth();
  if (!isAuthenticated(session)) return [null, UNAUTHORIZED_ERROR];
  return await updateProduct(id, product, session);
}

export async function getProductByIdAction(
  id: string
): Promise<ProductActionResult> {
  const session = await auth();
  if (!isAuthenticated(session)) return [null, UNAUTHORIZED_ERROR];
  return await getProductById(id, session);
}
