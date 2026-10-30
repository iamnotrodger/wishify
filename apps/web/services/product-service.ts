import { AuthenticatedSession } from '@/auth';
import { safeAsync } from '@/lib/utils';
import { CreateProduct, Image, Json, Product, UpdateProduct } from '@repo/schema';
import { Prisma, prisma } from '@repo/db';
import { z } from 'zod';

const PRODUCT_FIELDS = {
  id: true,
  url: true,
  name: true,
  brand: true,
  description: true,
  sku: true,
  gtin: true,
  mpn: true,
  price: true,
  priceCurrency: true,
  availability: true,
  images: true,
  categories: {
    select: {
      id: true,
      name: true,
      icon: true,
    },
  },
  metadata: true,
  plannedPurchaseDate: true,
  purchaseDate: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

export type ProductDatabaseSchema = Prisma.ProductGetPayload<{
  select: typeof PRODUCT_FIELDS;
}>;

type ProductResult<T = Product> = [T | null, Error | null];

export const GetProductQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(['price', 'createdAt']).optional().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
  category: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce
    .number<string | number>()
    .int()
    .min(1)
    .transform((x) => Math.min(x, 100))
    .default(50),
});
export type GetProductQuery = z.infer<typeof GetProductQuerySchema>;
export type GetProductQueryInput = z.input<typeof GetProductQuerySchema>;

export async function getProducts(
  query: GetProductQuery,
  session: AuthenticatedSession
): Promise<ProductResult<Product[]>> {
  const { user } = session;

  const [data, error] = await safeAsync(
    prisma.product.findMany({
      where: {
        userId: user.id,
        ...(query.category
          ? { categories: { some: { id: query.category } } }
          : {}),
        ...(query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: 'insensitive' } },
                { brand: { contains: query.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      // id breaks ties so the cursor stays stable across equal sort values.
      orderBy: [{ [query.sortBy]: query.sortDir }, { id: query.sortDir }],
      select: PRODUCT_FIELDS,
      take: query.limit,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor
        ? {
            id: query.cursor,
          }
        : undefined,
    })
  );

  if (data == null || error) {
    console.log(error);
    return [null, error];
  }

  const products: Product[] = data.map((product) => transformProduct(product));
  return [products, error];
}

export async function getProductById(
  id: string,
  session: AuthenticatedSession
): Promise<ProductResult> {
  const { user } = session;

  const [data, error] = await safeAsync(
    prisma.product.findFirst({
      where: { id, userId: user.id },
      select: PRODUCT_FIELDS,
    })
  );

  if (data == null || error) {
    console.log(error);
    return [null, error];
  }

  return [transformProduct(data), null];
}

const ownsCategories = async (
  categoryIds: string[] | undefined,
  userId: string
) => {
  const ids = [...new Set(categoryIds)];
  if (ids.length === 0) return true;
  const count = await prisma.category.count({
    where: { id: { in: ids }, userId },
  });
  return count === ids.length;
};

const toCategoryIds = (ids: string[]) => ids.map((id) => ({ id }));

// Postgres separates SQL NULL from JSON null; Prisma needs DbNull to clear a Json column.
const toJsonInput = (value: Json | null | undefined) =>
  value === null ? Prisma.DbNull : (value as Prisma.InputJsonValue | undefined);

export async function createProduct(
  product: CreateProduct,
  session: AuthenticatedSession
): Promise<ProductResult> {
  const { user } = session;

  const { categoryIds, ...fields } = product;
  if (!(await ownsCategories(categoryIds, user.id))) {
    return [null, new Error('Category not found')];
  }

  const [data, error] = await safeAsync(
    prisma.product.create({
      data: {
        ...fields,
        metadata: toJsonInput(fields.metadata),
        categories: categoryIds && { connect: toCategoryIds(categoryIds) },
        userId: user.id,
      },
      select: PRODUCT_FIELDS,
    })
  );

  if (data == null || error) {
    console.log(error);
    return [null, error];
  }

  return [transformProduct(data), null];
}

export async function updateProduct(
  id: string,
  product: UpdateProduct,
  session: AuthenticatedSession
): Promise<ProductResult> {
  const { user } = session;

  const { categoryIds, ...fields } = product;
  if (!(await ownsCategories(categoryIds, user.id))) {
    return [null, new Error('Category not found')];
  }

  const [data, error] = await safeAsync(
    prisma.product.update({
      where: { id, userId: user.id },
      data: {
        ...fields,
        metadata: toJsonInput(fields.metadata),
        categories: categoryIds && { set: toCategoryIds(categoryIds) },
      },
      select: PRODUCT_FIELDS,
    })
  );

  if (data == null || error) {
    console.log(error);
    return [null, error];
  }

  return [transformProduct(data), null];
}

export async function deleteProduct(id: string, session: AuthenticatedSession) {
  const { user } = session;

  const [, error] = await safeAsync(
    prisma.product.delete({
      where: { id, userId: user.id },
    })
  );

  if (error) {
    console.log(error);
  }
  return error;
}

const transformProduct = (product: ProductDatabaseSchema): Product => ({
  ...product,
  price: product.price?.toNumber(),
  images: product.images as Image[],
  metadata: product.metadata as Json,
  purchaseDate: product.purchaseDate?.toISOString(),
  plannedPurchaseDate: product.plannedPurchaseDate?.toISOString(),
  createdAt: product.createdAt?.toISOString(),
  updatedAt: product.updatedAt?.toISOString(),
});
