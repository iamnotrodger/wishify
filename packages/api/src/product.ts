import { z } from 'zod';

export const FolderSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const ImageSchema = z.object({
  url: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const ProductSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  url: z.string(),
  name: z.string().optional(),
  price: z.number().optional(),
  images: z.array(ImageSchema).optional(),
  folderId: z.string().optional(),
  category: z.string().optional(),
  metadata: z.record(z.string()).optional(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Folder = z.infer<typeof FolderSchema>;
export type Image = z.infer<typeof ImageSchema>;
export type Product = z.infer<typeof ProductSchema>;
