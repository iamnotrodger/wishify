'use server';

import { auth, isAuthenticated } from '@/auth';
import { getProductById, updateProduct } from '@/services/product-service';
import { CreateProduct, Product } from '@repo/api';

export async function updateProductAction(id: string, product: CreateProduct) {
  const session = await auth();
  if (!isAuthenticated(session)) return [null, new Error('Unauthorized')];

  const [updatedProduct, error] = await updateProduct(id, product, session);
  if (error) console.log(error);

  return [updatedProduct, error];
}

export async function getProductByIdAction(
  id: string
): Promise<[Product?, Error?]> {
  const session = await auth();
  if (!isAuthenticated(session)) return [undefined, new Error('Unauthorized')];

  const [product, error] = await getProductById(id, session);
  if (error) console.log(error);

  return [product, error];
}
