'use server';

import { auth, isAuthenticated } from '@/auth';
import { updateProduct } from '@/services/product-service';
import { CreateProduct } from '@repo/api';

export async function updateProductAction(id: string, product: CreateProduct) {
  const session = await auth();
  if (!isAuthenticated(session)) return [null, new Error('Unauthorized')];

  const [updatedProduct, error] = await updateProduct(id, product, session);
  if (error) console.log(error);

  return [updatedProduct, error];
}
