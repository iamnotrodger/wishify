import { AuthenticatedSession } from '@/auth';
import { safeAsync } from '@/lib/utils';
import { prisma } from '@/prisma';
import { CreateProduct, Json, Product } from '@repo/api';
import { Prisma } from '@repo/db';
import { z } from 'zod';

const PRODUCT_FIELDS = {
  id: true,
  url: true,
  brand: true,
  name: true,
  price: true,
  currency: true,
  images: true,
  description: true,
  category: {
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
export type ProductModel = Prisma.ProductGetPayload<{
  select: typeof PRODUCT_FIELDS;
}>;

export const GetProductQuerySchema = z.object({
  search: z.string().optional(),
  sort_by: z.enum(['price', 'createdAt']).optional().default('createdAt'),
  sort_dir: z.enum(['asc', 'desc']).optional().default('desc'),
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .pipe(
      z.coerce
        .number()
        .int()
        .min(1)
        .transform((x) => Math.min(x, 100))
        .default(50)
    ),
});
export type GetProductQuery = z.infer<typeof GetProductQuerySchema>;

export async function getProducts(
  query: GetProductQuery,
  session: AuthenticatedSession
): Promise<[Product[] | undefined, Error | undefined]> {
  const { user } = session;

  const [data, error] = await safeAsync(
    prisma.product.findMany({
      where: { userId: user.id, deletedAt: undefined },
      orderBy: [
        {
          [query.sort_by]: query.sort_dir,
        },
      ],
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

  if (data == null || error) return [undefined, error];

  const products: Product[] = data.map((product) => transformProduct(product));
  return [products, error];
}

export async function getProductById(
  id: string,
  session: AuthenticatedSession
) {
  const { user } = session;

  return await safeAsync(
    prisma.product.findFirst({
      where: { id, userId: user.id, deletedAt: undefined },
      select: PRODUCT_FIELDS,
    })
  );
}

export async function createProduct(
  product: CreateProduct,
  session: AuthenticatedSession
) {
  const { user } = session;

  return await safeAsync(
    prisma.product.create({
      data: {
        ...product,
        userId: user.id,
      },
      select: PRODUCT_FIELDS,
    })
  );
}

export async function updateProduct(
  id: string,
  product: CreateProduct,
  session: AuthenticatedSession
) {
  const { user } = session;

  return await safeAsync(
    prisma.product.update({
      where: { id, userId: user.id },
      data: {
        ...product,
      },
    })
  );
}

export async function deleteProduct(id: string, session: AuthenticatedSession) {
  const { user } = session;

  return await safeAsync(
    prisma.product.update({
      where: { id, userId: user.id },
      data: {
        deletedAt: new Date(),
      },
    })
  );
}

const transformProduct = (product: ProductModel): Product => ({
  ...product,
  metadata: product.metadata as Json,
  purchaseDate: product.purchaseDate?.toISOString(),
  plannedPurchaseDate: product.plannedPurchaseDate?.toISOString(),
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
});
