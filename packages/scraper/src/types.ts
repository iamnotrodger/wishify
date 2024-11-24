export interface Scraper {
  getJsonLd(): Product;
  getMicrodata(): Product;
  getMetadata(): Product;
  getHTMLData(): Product;
}

export type Product = {
  url?: string | null;
  name?: string | null;
  price?: number | null;
  currency?: string | null;
  description?: string | null;
  images?: Image[] | null;
  metadata?: Json | null;
};

export type Image = {
  url: string;
  width?: number;
  height?: number;
};

export type Json = Record<string, any>;
