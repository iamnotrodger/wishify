import { z } from 'zod';

const LiteralSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof LiteralSchema>;
export type Json = Literal | { [key: string]: Json } | Json[];
export const JsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([LiteralSchema, z.array(JsonSchema), z.record(JsonSchema)])
);

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullish(),
});

export const ImageSchema = z.object({
  url: z.string().url(),
  width: z.number().int().nullish(),
  height: z.number().int().nullish(),
});

export const ProductSchema = z.object({
  id: z.string(),
  url: z.string().url({ message: 'Invalid link' }).nullish(),
  name: z.string().min(1, { message: 'Name cannot be empty' }).nullish(),
  brand: z.string().nullish(),
  price: z.number().min(0, { message: 'Invalid price' }).nullish(),
  currency: z
    .string()
    .length(3, { message: 'Must choose a valid currency' })
    .nullish(),
  description: z
    .string()
    .max(256, 'Description cannot be more than 256 characters')
    .nullish(),
  images: z.array(ImageSchema).optional(),
  category: CategorySchema.nullish(),
  metadata: JsonSchema.nullable(),
  plannedPurchaseDate: z.string().datetime({ offset: true }).nullish(),
  purchaseDate: z.string().datetime({ offset: true }).nullish(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  category: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  categoryId: z.string().nullable(),
});
export const CreateCategorySchema = CategorySchema.omit({
  id: true,
});

export type Category = z.infer<typeof CategorySchema>;
export type Image = z.infer<typeof ImageSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
