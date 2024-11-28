import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@repo/ui/components/sidebar';
import { Inbox, PieChart } from 'lucide-react';
import Link from 'next/link';

const items = [
  {
    title: 'Overview',
    url: '?overview',
    icon: PieChart,
  },
  {
    title: 'Inbox',
    url: '#',
    icon: Inbox,
  },
];

export function NavMenu() {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <item.icon className='h-4 w-4' />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
