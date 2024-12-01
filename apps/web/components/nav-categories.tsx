import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/ui/components/sidebar';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { CategoryIcon } from './category-icon';

// TODO: create this to types, or use api types
interface Category {
  id?: string;
  name: string;
  icon: string;
}

const DUMMY_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Clothings',
    icon: 'shirt',
  },
  {
    id: '2',
    name: 'Electronics',
    icon: 'smartphone',
  },
  {
    id: '3',
    name: 'Furnitures',
    icon: 'sofa',
  },
];

interface NavCategoriesProps {
  categories?: Category[];
}

export const NavCategories = ({
  categories = DUMMY_CATEGORIES,
}: NavCategoriesProps) => {
  const categoryLinks = categories.map((category) => ({
    title: category.name,
    // url: `/categories/${category.id}`,
    url: `?category=${category.name}`,
    icon: <CategoryIcon icon={category.icon} />,
  }));

  return (
    <SidebarGroup>
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
};
