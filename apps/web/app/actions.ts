'use server';

import { auth, getSession, isAuthenticated } from '@/auth';
import {
  CategoryExistsError,
  createCategory,
} from '@/services/category-service';
import {
  createProduct,
  deleteProduct,
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
} from '@repo/schema';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

// Errors are plain strings: React strips Error messages when serializing to the client in production.
type ActionResult<T> = [T | null, string | null];

const UNAUTHORIZED = 'Unauthorized';
const IdSchema = z.string().min(1);

const invalid = (error: z.ZodError) => fromZodError(error).message;

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

export async function deleteProductAction(id: string): Promise<string | null> {
  const session = await getSession();
  if (!isAuthenticated(session)) return UNAUTHORIZED;

  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) return invalid(parsedId.error);

  const error = await deleteProduct(parsedId.data, session);
  return error ? 'Failed to delete product' : null;
}

export async function createCategoriesAction(
  category: CreateCategory
): Promise<ActionResult<Category>> {
  const session = await getSession();
  if (!isAuthenticated(session)) return [null, UNAUTHORIZED];

  const parsed = CreateCategorySchema.safeParse(category);
  if (!parsed.success) return [null, invalid(parsed.error)];

  const [created, error] = await createCategory(parsed.data, session);
  if (error instanceof CategoryExistsError) return [null, error.message];
  return error ? [null, 'Failed to add category'] : [created, null];
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect('/');
}
