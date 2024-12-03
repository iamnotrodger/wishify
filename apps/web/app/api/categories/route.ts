import { auth, isAuthenticated } from '@/auth';
import {
  invalidRequestResponse,
  unauthorizedResponse,
  unknownErrorResponse,
} from '@/lib/responses';
import { safeAsync } from '@/lib/utils';
import { prisma } from '@/prisma';
import { CreateCategorySchema } from '@repo/api';
import { NextResponse } from 'next/server';
import { fromZodError } from 'zod-validation-error';

export const GET = auth(async (req) => {
  if (!isAuthenticated(req.auth)) return unauthorizedResponse();

  const { id } = req.auth!.user!;
  const [categories, error] = await safeAsync(
    prisma.category.findMany({
      where: { userId: id },
      select: {
        id: true,
        name: true,
        icon: true,
      },
    })
  );

  if (error) {
    console.log(error);
    return unknownErrorResponse(new Error('unable to process request'));
  }

  return NextResponse.json(categories || []);
});

export const POST = auth(async (req) => {
  if (!isAuthenticated(req.auth)) return unauthorizedResponse();

  const user = req.auth.user;
  const data = await req.json();

  const categoryValidation = CreateCategorySchema.safeParse(data);
  if (!categoryValidation.success) {
    const validationError = fromZodError(categoryValidation.error);
    return invalidRequestResponse(validationError);
  }

  const [category, error] = await safeAsync(
    prisma.category.create({
      data: {
        ...categoryValidation.data,
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        icon: true,
      },
    })
  );

  if (error) {
    console.log(error);
    return unknownErrorResponse(new Error('failed to add folder'));
  }

  return NextResponse.json(category);
});
