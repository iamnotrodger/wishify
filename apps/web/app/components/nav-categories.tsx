import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/ui/components/sidebar';
import { Box, Plus } from 'lucide-react';
import Link from 'next/link';
// import Icon, { IconName, iconNames } from './icon';

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
    icon: getCategoryIcon(category.icon),
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
            <Plus className='w-4 h-4' />
            <span className='text-sm font-medium'>Add new category</span>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

// TODO: move this somewhere else, perchance `lib/utils.ts`
const getCategoryIcon = (icon: string) => {
  if (isEmoji(icon)) {
    return <div className='w-4 h-4'>{icon}</div>;
  }

  // if (iconNames.includes(icon)) {
  //   return <Icon name={icon as IconName} className='w-4 h-4' />;
  // }

  return <Box className='w-4 h-4' />;
};

// TODO: move this somewhere else, perchance `lib/utils.ts`
const isEmoji = (icon: string) => {
  const regex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
  return regex.test(icon);
};
