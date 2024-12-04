import { AuthenticatedSession } from '@/auth';
import { safeAsync } from '@/lib/utils';
import { prisma } from '@/prisma';
import { CreateCategory } from '@repo/api';
import { Prisma } from '@repo/db';

const CATEGORY_FIELDS = {
  id: true,
  name: true,
  icon: true,
} satisfies Prisma.CategorySelect;
export type CategoryModel = Prisma.CategoryGetPayload<{
  select: typeof CATEGORY_FIELDS;
}>;

export async function getCategories(session: AuthenticatedSession) {
  const { id } = session.user;

  return await safeAsync(
    prisma.category.findMany({
      where: { userId: id, isDeleted: false },
      select: CATEGORY_FIELDS,
    })
  );
}

export async function createCategory(
  category: CreateCategory,
  session: AuthenticatedSession
) {
  const { user } = session;

  return await safeAsync(
    prisma.category.create({
      data: {
        ...category,
        userId: user.id,
      },
      select: CATEGORY_FIELDS,
    })
  );
}

export async function updateCategory(
  id: string,
  category: CreateCategory,
  session: AuthenticatedSession
) {
  const { user } = session;

  return await safeAsync(
    prisma.category.update({
      where: { id, userId: user.id },
      data: category,
      select: CATEGORY_FIELDS,
    })
  );
}

export async function deleteCategory(
  id: string,
  session: AuthenticatedSession
) {
  const { user } = session;

  return await safeAsync(
    prisma.category.update({
      where: { id, userId: user.id },
      data: { isDeleted: true },
      select: CATEGORY_FIELDS,
    })
  );
}
