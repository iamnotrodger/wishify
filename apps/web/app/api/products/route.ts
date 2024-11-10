import { auth } from '@/auth';
import {
  invalidRequestResponse,
  unauthorizedResponse,
  unknownErrorResponse,
} from '@/lib/responses';
import { safeAsync } from '@/lib/utils';
import { prisma } from '@/prisma';
import { CreateProductSchema } from '@repo/api';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const GetProductQuerySchema = z.object({
  search: z.string().optional(),
  sort_by: z.enum(['price', 'createdAt']).optional().default('createdAt'),
  sort_dir: z.enum(['asc', 'desc']).optional().default('desc'),
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

export const GET = auth(async function GET(req) {
  if (!req.auth) return unauthorizedResponse();

  const searchParamsValidation = GetProductQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams)
  );
  if (!searchParamsValidation.success) {
    const validationError = fromZodError(searchParamsValidation.error);
    return invalidRequestResponse(validationError);
  }

  const searchParams = searchParamsValidation.data;
  const [products, error] = await safeAsync(
    prisma.product.findMany({
      where: { userId: req.auth!.user?.id },
      orderBy: [
        {
          [searchParams.sort_by]: searchParams.sort_dir,
        },
      ],
      take: searchParams.limit,
    })
  );
  if (error) {
    console.log(error);
    return unknownErrorResponse(new Error('unable to process request'));
  }

  return NextResponse.json({ products });
});


export const POST = auth(async function GET(req) {
  if (!req.auth) return unauthorizedResponse();

  const { user } = req.auth;
  const data = await req.json();

  const productValidation = CreateProductSchema.safeParse(data);
  if (!productValidation.success) {
    const validationError = fromZodError(productValidation.error);
    return invalidRequestResponse(validationError);
  }

  const productRequest = productValidation.data;
  const [product, error] = await safeAsync(
    prisma.product.create({
      data: {
        ...productRequest,
        userId: user!.id as string,
      },
    })
  );
  if (error) return unknownErrorResponse(error);

  return NextResponse.json({ product });
});
