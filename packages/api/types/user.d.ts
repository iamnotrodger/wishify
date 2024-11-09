export interface User {
  id: string;
  name?: string;
  avatar_url?: string;
  email?: string;
  folders?: Folder[];
  is_deleted?: boolean;
}
