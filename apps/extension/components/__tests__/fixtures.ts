import { type Category, type Product } from '@repo/schema';

export const categories: Category[] = [
  { id: 'c1', name: 'Clothes', icon: 'shirt' },
  { id: 'c2', name: 'Books', icon: 'book' },
];

export const savedProduct: Product = {
  id: 'p1',
  url: 'https://store.test/shoe',
  name: 'Runner',
  brand: 'Acme',
  price: 25,
  priceCurrency: 'CAD',
  images: [{ url: 'https://cdn.test/shoe.jpg' }],
  categories: [categories[0]!],
  createdAt: '2026-10-29T00:00:00.000Z',
  updatedAt: '2026-10-29T00:00:00.000Z',
};

export const session = {
  data: {
    user: { name: 'Rodger', email: 'rodger@wishify.test', image: null },
  },
};
