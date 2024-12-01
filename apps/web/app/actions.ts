'use server';

import { CreateProduct } from '@repo/api';

type UpdateProduct = Partial<CreateProduct> & {
  datePlanned?: string | null;
  dateBought?: string | null;
};

export async function updateProduct(id: string, product: UpdateProduct) {
  console.log(id, product);
  return [product, null];
}
