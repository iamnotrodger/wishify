'use server';

import { auth, isAuthenticated } from '@/auth';
import { createCategory, getCategories } from '@/services/category-service';
import {
  GetProductQuery,
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '@/services/product-service';
import {
  Category,
  CreateCategory,
  CreateProduct,
  Product,
  UpdateProduct,
} from '@repo/api';

type ProductActionResult<T = Product> = [T | null, Error | null];
type CategoryActionResult<T = Category> = [T | null, Error | null];

const UNAUTHORIZED_ERROR = new Error('Unauthorized');

export async function getProductsActions(
  query: GetProductQuery
): Promise<ProductActionResult<Product[]>> {
  const session = await auth();
  if (!isAuthenticated(session)) return [null, UNAUTHORIZED_ERROR];
  return await getProducts(query, session);
}

export type UpdateProductProps = { id: string; product: UpdateProduct };
export async function updateProductAction({
  id,
  product,
}: UpdateProductProps): Promise<ProductActionResult<Product>> {
  const session = await auth();
  if (!isAuthenticated(session)) return [null, UNAUTHORIZED_ERROR];
  return await updateProduct(id, product, session);
}

export async function createProductAction(
  product: CreateProduct
): Promise<ProductActionResult<Product>> {
  const session = await auth();
  if (!isAuthenticated(session)) return [null, UNAUTHORIZED_ERROR];
  return await createProduct(product, session);
}

export async function getProductByIdAction(
  id: string
): Promise<ProductActionResult> {
  const session = await auth();
  if (!isAuthenticated(session)) return [null, UNAUTHORIZED_ERROR];
  return await getProductById(id, session);
}

export async function deleteProductAction(id: string): Promise<Error | null> {
  const session = await auth();
  if (!isAuthenticated(session)) return UNAUTHORIZED_ERROR;
  return await deleteProduct(id, session);
}

export async function getCategoriesAction(): Promise<
  CategoryActionResult<Category[]>
> {
  const session = await auth();
  if (!isAuthenticated(session)) return [null, UNAUTHORIZED_ERROR];
  return await getCategories(session);
}

export async function createCategoriesAction(
  category: CreateCategory
): Promise<CategoryActionResult<Category>> {
  const session = await auth();
  if (!isAuthenticated(session)) return [null, UNAUTHORIZED_ERROR];
  return await createCategory(category, session);
}
