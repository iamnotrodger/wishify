export interface Folder {
  id: string;
  name: string;
}

export interface Image {
  url: string;
  width: number;
  height: number;
}

export interface Product {
  id: string;
  url: string;
  price: number;
  name?: string;
  images?: Image[];
  folderId?: string;
  category?: string;
  // OpenGraph data, or whatever else dont ask me lol
  metadata?: Record<string, string>;
  createdAt: string;
}
