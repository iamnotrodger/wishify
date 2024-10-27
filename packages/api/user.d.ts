interface Category {
  id: string;
  name: string;
}

interface User {
  id: string;
  name?: string;
  avatar_url?: string;
  email?: string;
  categories?: Category[];
}
