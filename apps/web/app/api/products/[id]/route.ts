import { getSession, isAuthenticated } from '@/auth';
import {
  productNotFoundResponse,
  unauthorizedResponse,
  unknownErrorResponse,
} from '@/lib/responses';
import { deleteProduct, getProductById } from '@/services/product-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: RouteContext<'/api/products/[id]'>
) {
  const session = await getSession(req.headers);
  if (!isAuthenticated(session)) return unauthorizedResponse();

  const { id } = await params;
  const [product, error] = await getProductById(id, session);

  if (error) {
    return unknownErrorResponse(new Error('unable to process request'));
  }
  if (!product) {
    return productNotFoundResponse(new Error(`no product with id ${id}`));
  }

  return NextResponse.json(product);
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteContext<'/api/products/[id]'>
) {
  const session = await getSession(req.headers);
  if (!isAuthenticated(session)) return unauthorizedResponse();

  const { id } = await params;
  const error = await deleteProduct(id, session);

  if (error) {
    return unknownErrorResponse(new Error('failed to delete product'));
  }

  return NextResponse.json({ success: true });
}
