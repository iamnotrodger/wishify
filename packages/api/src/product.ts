import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
});

export const ImageSchema = z.object({
  url: z.string().url(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
});

export const ProductSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  url: z.string().url({ message: 'Invalid link' }),
  name: z.string().min(1, { message: 'Name cannot be empty' }),
  brand: z.string().optional(),
  price: z.number().min(0, { message: 'Invalid price' }),
  currency: z.string().length(3, { message: 'Must choose a valid currency' }),
  description: z
    .string()
    .max(256, 'Description cannot be more than 256 characters')
    .optional(),
  images: z.array(ImageSchema).optional(),
  category: CategorySchema.optional(),
  metadata: z.record(z.any()).optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  userId: true,
  category: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  categoryId: z.string().optional(),
});
export const CreateCategorySchema = CategorySchema.omit({
  id: true,
});

export type Category = z.infer<typeof CategorySchema>;
export type Image = z.infer<typeof ImageSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type CreateCategory = z.infer<typeof CreateProductSchema>;
