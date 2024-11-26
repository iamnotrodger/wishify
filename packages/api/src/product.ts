import { z } from 'zod';

export const FolderSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
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
  price: z.number().min(0, { message: 'Invalid price' }),
  currency: z.string().length(3, { message: 'Must choose a valid currency' }),
  description: z
    .string()
    .max(256, 'Description cannot be more than 256 characters')
    .optional(),
  images: z.array(ImageSchema).optional(),
  folderId: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  metadata: z.record(z.string()).optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  isDeleted: z.boolean().optional(),
});

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
});

export type Folder = z.infer<typeof FolderSchema>;
export type Image = z.infer<typeof ImageSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
