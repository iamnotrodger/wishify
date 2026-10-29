import { getSession, isAuthenticated } from '@/auth';
import {
  invalidRequestResponse,
  unauthorizedResponse,
  unknownErrorResponse,
} from '@/lib/responses';
import { createCategory, getCategories } from '@/services/category-service';
import { CreateCategorySchema } from '@repo/api';
import { NextRequest, NextResponse } from 'next/server';
import { fromZodError } from 'zod-validation-error';

export async function GET(req: NextRequest) {
  const session = await getSession(req.headers);
  if (!isAuthenticated(session)) return unauthorizedResponse();

  const [categories, error] = await getCategories(session);

  if (error) {
    return unknownErrorResponse(new Error('unable to process request'));
  }

  return NextResponse.json(categories || []);
}

export async function POST(req: NextRequest) {
  const session = await getSession(req.headers);
  if (!isAuthenticated(session)) return unauthorizedResponse();

  const data = await req.json();
  const categoryValidation = CreateCategorySchema.safeParse(data);
  if (!categoryValidation.success) {
    const validationError = fromZodError(categoryValidation.error);
    return invalidRequestResponse(validationError);
  }

  const [category, error] = await createCategory(
    categoryValidation.data,
    session
  );

  if (error) {
    return unknownErrorResponse(new Error('failed to add folder'));
  }

  return NextResponse.json(category);
}
