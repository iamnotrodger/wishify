import { getSession, isAuthenticated } from '@/auth';
import {
  invalidRequestResponse,
  unauthorizedResponse,
  unknownErrorResponse,
} from '@/lib/responses';
import {
  GetProductQuerySchema,
  createProduct,
  getProducts,
} from '@/services/product-service';
import { CreateProductSchema } from '@repo/api';
import { NextRequest, NextResponse } from 'next/server';
import { fromZodError } from 'zod-validation-error';

export async function GET(req: NextRequest) {
  const session = await getSession(req.headers);
  if (!isAuthenticated(session)) return unauthorizedResponse();

  const queryValidation = GetProductQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams)
  );
  if (!queryValidation.success) {
    const validationError = fromZodError(queryValidation.error);
    return invalidRequestResponse(validationError);
  }

  const query = queryValidation.data;
  const [products, error] = await getProducts(query, session);

  if (error) {
    return unknownErrorResponse(new Error('unable to process request'));
  }

  const cursor = products?.at(-1)?.id ?? null;
  return NextResponse.json({ products, cursor });
}

export async function POST(req: NextRequest) {
  const session = await getSession(req.headers);
  if (!isAuthenticated(session)) return unauthorizedResponse();

  const data = await req.json();
  const productValidation = CreateProductSchema.safeParse(data);
  if (!productValidation.success) {
    const validationError = fromZodError(productValidation.error);
    return invalidRequestResponse(validationError);
  }

  const productRequest = productValidation.data;
  const [product, error] = await createProduct(productRequest, session);

  if (error) {
    return unknownErrorResponse(new Error('failed to save product'));
  }

  return NextResponse.json(product);
}
