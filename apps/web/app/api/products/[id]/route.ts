import { auth } from '@/auth';
import { productNotFoundResponse, unauthorizedResponse } from '@/lib/responses';
import { safeAsync } from '@/lib/utils';
import { prisma } from '@/prisma';
import { NextResponse } from 'next/server';

interface Context {
  params: {
    id: string;
  };
}

export const GET = auth(async (req, ctx) => {
  if (!req.auth || !req.auth.user) return unauthorizedResponse();

  const user = req.auth.user;
  const { id } = (ctx as Context).params;

  if (!id) return productNotFoundResponse(new Error('product id not found'));

  const [product, error] = await safeAsync(
    prisma.product.findUniqueOrThrow({
      where: {
        id,
        userId: user.id,
      },
    })
  );
  if (error) {
    return productNotFoundResponse(new Error('product does not exist'));
  }

  return NextResponse.json(product);
});
