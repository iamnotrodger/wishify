export interface Image {
  url: string;
  dimension?: {
    width: number;
    height: number;
  };
}

export interface Product {
  id: string;
  url: string;
  price: number;
  name?: string;
  image?: Image[];
  // OpenGraph data, or whatever else dont ask me lol
  metadata?: Record<string, string>;
  is_deleted?: boolean;
}
