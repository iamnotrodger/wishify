'use server';

import { getSession, isAuthenticated } from '@/auth';
import { createCategory, getCategories } from '@/services/category-service';
import {
  GetProductQueryInput,
  GetProductQuerySchema,
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '@/services/product-service';
import {
  Category,
  CreateCategory,
  CreateCategorySchema,
  CreateProductInput,
  CreateProductSchema,
  Product,
  UpdateProductInput,
  UpdateProductSchema,
} from '@repo/api';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

// Errors are plain strings: React strips Error messages when serializing to the client in production.
type ActionResult<T> = [T | null, string | null];

const UNAUTHORIZED = 'Unauthorized';
const IdSchema = z.string().min(1);

const invalid = (error: z.ZodError) => fromZodError(error).message;

export async function getProductsActions(
  query: GetProductQueryInput
): Promise<ActionResult<Product[]>> {
  const session = await getSession();
  if (!isAuthenticated(session)) return [null, UNAUTHORIZED];

  const parsed = GetProductQuerySchema.safeParse(query);
  if (!parsed.success) return [null, invalid(parsed.error)];

  const [products, error] = await getProducts(parsed.data, session);
  return error ? [null, 'Unable to load products'] : [products, null];
}

export type UpdateProductProps = { id: string; product: UpdateProductInput };
export async function updateProductAction({
  id,
  product,
}: UpdateProductProps): Promise<ActionResult<Product>> {
  const session = await getSession();
  if (!isAuthenticated(session)) return [null, UNAUTHORIZED];

  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) return [null, invalid(parsedId.error)];
  const parsed = UpdateProductSchema.safeParse(product);
  if (!parsed.success) return [null, invalid(parsed.error)];

  const [updated, error] = await updateProduct(
    parsedId.data,
    parsed.data,
    session
  );
  return error ? [null, 'Failed to update product'] : [updated, null];
}

export async function createProductAction(
  product: CreateProductInput
): Promise<ActionResult<Product>> {
  const session = await getSession();
  if (!isAuthenticated(session)) return [null, UNAUTHORIZED];

  const parsed = CreateProductSchema.safeParse(product);
  if (!parsed.success) return [null, invalid(parsed.error)];

  const [created, error] = await createProduct(parsed.data, session);
  return error ? [null, 'Failed to save product'] : [created, null];
}

export async function getProductByIdAction(
  id: string
): Promise<ActionResult<Product>> {
  const session = await getSession();
  if (!isAuthenticated(session)) return [null, UNAUTHORIZED];

  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) return [null, invalid(parsedId.error)];

  const [product, error] = await getProductById(parsedId.data, session);
  return error ? [null, 'Product not found'] : [product, null];
}

export async function deleteProductAction(id: string): Promise<string | null> {
  const session = await getSession();
  if (!isAuthenticated(session)) return UNAUTHORIZED;

  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) return invalid(parsedId.error);

  const error = await deleteProduct(parsedId.data, session);
  return error ? 'Failed to delete product' : null;
}

export async function getCategoriesAction(): Promise<ActionResult<Category[]>> {
  const session = await getSession();
  if (!isAuthenticated(session)) return [null, UNAUTHORIZED];

  const [categories, error] = await getCategories(session);
  return error ? [null, 'Unable to load categories'] : [categories, null];
}

export async function createCategoriesAction(
  category: CreateCategory
): Promise<ActionResult<Category>> {
  const session = await getSession();
  if (!isAuthenticated(session)) return [null, UNAUTHORIZED];

  const parsed = CreateCategorySchema.safeParse(category);
  if (!parsed.success) return [null, invalid(parsed.error)];

  const [created, error] = await createCategory(parsed.data, session);
  return error ? [null, 'Failed to add category'] : [created, null];
}
