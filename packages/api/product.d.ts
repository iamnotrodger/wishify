interface Image {
  url: string;
  dimension?: {
    width: number;
    height: number;
  };
}

interface Product {
  id: string;
  url: string;
  price: number;
  name?: string;
  image?: Image[];
  // OpenGraph data, or whatever else dont ask me lol
  metadata?: Record<string, string>;
}
