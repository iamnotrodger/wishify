import { auth, isAuthenticated } from '@/auth';
import { getCategories } from '@/services/category-service';
import { Category } from '@repo/api';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/ui/components/sidebar';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { CategoryForm } from './category-form';
import { CategoryIcon } from './category-icon';

export async function NavCategories() {
  const session = await auth();
  let categories: Category[] | null = [];

  if (isAuthenticated(session)) {
    [categories] = await getCategories(session);
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Categories</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {categories?.map((category) => (
            <SidebarMenuItem key={category.id}>
              <SidebarMenuButton asChild>
                <Link href={`/app/categories/${category.id}`}>
                  <CategoryIcon icon={category.icon} />
                  <span className='truncate text-sm font-medium'>
                    {category.name}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <CategoryForm>
            <SidebarMenuButton>
              <Plus className='h-4 w-4' />
              <span className='text-sm font-medium'>Add new category</span>
            </SidebarMenuButton>
          </CategoryForm>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
