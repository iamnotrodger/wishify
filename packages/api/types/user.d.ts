export interface Category {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name?: string;
  avatar_url?: string;
  email?: string;
  categories?: Category[];
  is_deleted?: boolean;
}
