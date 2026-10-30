import { type AuthenticatedSession } from '@/auth';
import { type Product } from '@repo/schema';
import { Prisma } from '@repo/db';

export const session = {
  user: { id: 'u1', name: 'Rodger', email: 'rodger@wishify.test' },
  session: { id: 's1', userId: 'u1' },
} as AuthenticatedSession;

export const productRow = {
  id: 'p1',
  url: 'https://store.test/shoe',
  name: 'Runner',
  brand: 'Acme',
  description: null,
  sku: null,
  gtin: null,
  mpn: null,
  price: new Prisma.Decimal('25.50'),
  priceCurrency: 'CAD',
  availability: null,
  images: [{ url: 'https://cdn.test/shoe.jpg' }],
  categories: [{ id: 'c1', name: 'Clothes', icon: 'shirt' }],
  metadata: null,
  plannedPurchaseDate: null,
  purchaseDate: new Date('2026-10-02T00:00:00.000Z'),
  createdAt: new Date('2026-10-01T00:00:00.000Z'),
  updatedAt: new Date('2026-10-01T00:00:00.000Z'),
};

export const product: Product = {
  ...productRow,
  price: 25.5,
  purchaseDate: '2026-10-02T00:00:00.000Z',
  plannedPurchaseDate: undefined,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
};

export const duplicateError = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
  });
