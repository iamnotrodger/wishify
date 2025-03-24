'use client';

import { getCategoriesAction } from '@/app/actions';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/ui/components/sidebar';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { CategoryForm } from './category-form';
import { CategoryIcon } from './category-icon';

export function NavCategories() {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const [categories, error] = await getCategoriesAction();
      if (error) throw error;
      return categories;
    },
  });

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
