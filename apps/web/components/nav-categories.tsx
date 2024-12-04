import { auth, isAuthenticated } from '@/auth';
import { getCategories } from '@/services/category-service';
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
import { CategoryIcon } from './category-icon';

export async function NavCategories() {
  const session = await auth();

  let categoryLinks: {
    title: string;
    url: string;
    icon: JSX.Element;
  }[] = [];

  if (isAuthenticated(session)) {
    const [categories] = await getCategories(session);
    categoryLinks =
      categories?.map((category) => ({
        title: category.name,
        url: `/app/categories/${category.id}`,
        icon: <CategoryIcon icon={category.icon} />,
      })) ?? [];
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Categories</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {categoryLinks.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  {item.icon}
                  <span className='truncate text-sm font-medium'>
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuButton>
            <Plus className='h-4 w-4' />
            <span className='text-sm font-medium'>Add new category</span>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
