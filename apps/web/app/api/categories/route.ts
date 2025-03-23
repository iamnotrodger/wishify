import { auth, isAuthenticated } from '@/auth';
import {
  invalidRequestResponse,
  unauthorizedResponse,
  unknownErrorResponse,
} from '@/lib/responses';
import { createCategory, getCategories } from '@/services/category-service';
import { CreateCategorySchema } from '@repo/api';
import { NextResponse } from 'next/server';
import { fromZodError } from 'zod-validation-error';

export const GET = auth(async (req) => {
  if (!isAuthenticated(req.auth)) return unauthorizedResponse();

  const [categories, error] = await getCategories(req.auth);

  if (error) {
    return unknownErrorResponse(new Error('unable to process request'));
  }

  return NextResponse.json(categories || []);
}) as any; // TODO: remove this when NextAuth is fixes this

export const POST = auth(async (req) => {
  if (!isAuthenticated(req.auth)) return unauthorizedResponse();

  const data = await req.json();
  const categoryValidation = CreateCategorySchema.safeParse(data);
  if (!categoryValidation.success) {
    const validationError = fromZodError(categoryValidation.error);
    return invalidRequestResponse(validationError);
  }

  const [category, error] = await createCategory(
    categoryValidation.data,
    req.auth
  );

  if (error) {
    return unknownErrorResponse(new Error('failed to add folder'));
  }

  return NextResponse.json(category);
}) as any; // TODO: remove this when NextAuth is fixes this
