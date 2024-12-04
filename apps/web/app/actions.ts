'use server';

import { CreateProduct } from '@repo/api';

// TODO: remove this
type UpdateProduct = Partial<CreateProduct> & {
  plannedPurchaseDate?: string | null;
  purchaseDate?: string | null;
};

export async function updateProductAction(id: string, product: UpdateProduct) {
  console.log(id, product);
  return [product, null];
}
