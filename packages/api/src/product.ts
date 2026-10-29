import { z } from 'zod';

const LiteralSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof LiteralSchema>;
export type Json = Literal | { [key: string]: Json } | Json[];
export const JsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([
    LiteralSchema,
    z.array(JsonSchema),
    z.record(z.string(), JsonSchema),
  ])
);

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullish(),
});

export const ImageSchema = z.object({
  url: z.url(),
  width: z.number().int().nullish(),
  height: z.number().int().nullish(),
});

/** https://schema.org/ItemAvailability */
export const ItemAvailabilitySchema = z.enum([
  'BackOrder',
  'Discontinued',
  'InStock',
  'InStoreOnly',
  'LimitedAvailability',
  'MadeToOrder',
  'OnlineOnly',
  'OutOfStock',
  'PreOrder',
  'PreSale',
  'Reserved',
  'SoldOut',
]);

const NameSchema = z.string().min(1, { message: 'Name cannot be empty' });
const PriceSchema = z.coerce
  .number<string | number>()
  .min(0, { message: 'Invalid price' });
const PriceCurrencySchema = z
  .string()
  .length(3, { message: 'Must choose a valid currency' });

export const ProductSchema = z.object({
  id: z.string(),
  url: z.url({ message: 'Invalid link' }).nullish(),
  name: NameSchema,
  brand: z.string().nullish(),
  description: z
    .string()
    .max(256, 'Description cannot be more than 256 characters')
    .nullish(),
  sku: z.string().nullish(),
  gtin: z.string().nullish(),
  mpn: z.string().nullish(),
  price: PriceSchema.nullish(),
  priceCurrency: PriceCurrencySchema.nullish(),
  availability: ItemAvailabilitySchema.nullish(),
  images: z.array(ImageSchema).optional(),
  category: CategorySchema.nullish(),
  metadata: JsonSchema.nullish(),
  plannedPurchaseDate: z.iso.datetime({ offset: true }).nullish(),
  purchaseDate: z.iso.datetime({ offset: true }).nullish(),
  notes: z.string().nullish(),

  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  category: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  categoryId: z.string().nullish(),
  price: PriceSchema,
  priceCurrency: PriceCurrencySchema,
});
export const UpdateProductSchema = ProductSchema.omit({
  id: true,
  category: true,
  createdAt: true,
  updatedAt: true,
})
  .extend({
    categoryId: z.string().nullish(),
    name: NameSchema.optional(),
  })
  // Mirrors the DB CHECK: price and priceCurrency change together.
  .refine(
    (p) =>
      (p.price === undefined) === (p.priceCurrency === undefined) &&
      (p.price === null) === (p.priceCurrency === null),
    {
      message: 'Price and currency must be set together',
      path: ['priceCurrency'],
    }
  );
export const CreateCategorySchema = CategorySchema.omit({
  id: true,
});
export const UpdateCategorySchema = CategorySchema.omit({
  id: true,
});

export type Category = z.infer<typeof CategorySchema>;
export type Image = z.infer<typeof ImageSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export type CreateProductInput = z.input<typeof CreateProductSchema>;
export type UpdateProductInput = z.input<typeof UpdateProductSchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
