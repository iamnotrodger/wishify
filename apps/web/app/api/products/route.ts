import { auth, isAuthenticated } from '@/auth';
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
import { NextResponse } from 'next/server';
import { fromZodError } from 'zod-validation-error';

export const GET = auth(async (req) => {
  if (!isAuthenticated(req.auth)) return unauthorizedResponse();

  const queryValidation = GetProductQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams)
  );
  if (!queryValidation.success) {
    const validationError = fromZodError(queryValidation.error);
    return invalidRequestResponse(validationError);
  }

  const query = queryValidation.data;
  const [products, error] = await getProducts(query, req.auth);

  if (error) {
    return unknownErrorResponse(new Error('unable to process request'));
  }

  const cursor = products && products[0] ? products[0].id : null;
  return NextResponse.json({ products, cursor });
}) as any; // TODO: remove this when NextAuth is fixes this

export const POST = auth(async (req) => {
  if (!isAuthenticated(req.auth)) return unauthorizedResponse();

  const data = await req.json();
  const productValidation = CreateProductSchema.safeParse(data);
  if (!productValidation.success) {
    const validationError = fromZodError(productValidation.error);
    return invalidRequestResponse(validationError);
  }

  const productRequest = productValidation.data;
  const [product, error] = await createProduct(productRequest, req.auth);

  if (error) {
    return unknownErrorResponse(new Error('failed to save product'));
  }

  return NextResponse.json(product);
}) as any; // TODO: remove this when NextAuth is fixes this;
