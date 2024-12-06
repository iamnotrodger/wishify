import { AuthenticatedSession } from '@/auth';
import { safeAsync } from '@/lib/utils';
import { prisma } from '@/prisma';
import { Category, CreateCategory } from '@repo/api';
import { Prisma } from '@repo/db';

const CATEGORY_FIELDS = {
  id: true,
  name: true,
  icon: true,
} satisfies Prisma.CategorySelect;

export type CategoryDatabaseSchema = Prisma.CategoryGetPayload<{
  select: typeof CATEGORY_FIELDS;
}>;

type CategoryResult<T = Category> = [T | null, Error | null];

export async function getCategories(
  session: AuthenticatedSession
): Promise<CategoryResult<Category[]>> {
  const { id } = session.user;

  const [data, error] = await safeAsync(
    prisma.category.findMany({
      where: { userId: id, deletedAt: undefined },
      select: CATEGORY_FIELDS,
    })
  );

  if (error) {
    console.log(error);
  }

  return [data, error];
}

export async function getCategoryById(
  id: string,
  session: AuthenticatedSession
): Promise<CategoryResult> {
  const { user } = session;

  const [data, error] = await safeAsync(
    prisma.category.findUnique({
      where: { id, userId: user.id, deletedAt: undefined },
      select: CATEGORY_FIELDS,
    })
  );

  if (error) {
    console.log(error);
  }

  return [data, error];
}

export async function createCategory(
  category: CreateCategory,
  session: AuthenticatedSession
): Promise<CategoryResult> {
  const { user } = session;

  const [data, error] = await safeAsync(
    prisma.category.create({
      data: {
        ...category,
        userId: user.id,
      },
      select: CATEGORY_FIELDS,
    })
  );

  if (error) {
    console.log(error);
  }

  return [data, error];
}

export async function updateCategory(
  id: string,
  category: CreateCategory,
  session: AuthenticatedSession
): Promise<CategoryResult> {
  const { user } = session;

  const [data, error] = await safeAsync(
    prisma.category.update({
      where: { id, userId: user.id },
      data: category,
      select: CATEGORY_FIELDS,
    })
  );

  if (error) {
    console.log(error);
  }

  return [data, error];
}

export async function deleteCategory(
  id: string,
  session: AuthenticatedSession
) {
  const { user } = session;

  const [, error] = await safeAsync(
    prisma.category.update({
      where: { id, userId: user.id },
      data: { deletedAt: new Date() },
      select: CATEGORY_FIELDS,
    })
  );

  if (error) {
    console.log(error);
  }

  return error;
}
