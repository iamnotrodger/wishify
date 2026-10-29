export interface Scraper {
  getProduct(): Product;
}

/** https://schema.org/ItemAvailability */
export const itemAvailabilities = [
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
] as const;
export type ItemAvailability = (typeof itemAvailabilities)[number];

/** Field names follow schema.org Product, with its Offer flattened in. */
export type Product = {
  url?: string | null;
  name?: string | null;
  brand?: string | null;
  description?: string | null;
  sku?: string | null;
  gtin?: string | null;
  mpn?: string | null;
  price?: number | null;
  priceCurrency?: string | null;
  availability?: ItemAvailability | null;
  images?: Image[] | null;
  metadata?: Json | null;
};

export type Image = {
  url: string;
  width?: number;
  height?: number;
};

export type Json = Record<string, any>;
