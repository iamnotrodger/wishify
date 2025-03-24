import { getCategoriesAction } from '@/app/actions';
import { auth, isAuthenticated } from '@/auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@repo/ui/components/sidebar';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { Settings2 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { NavCategories } from './nav-categories';
import { NavMenu } from './nav-menu';

export async function AppSidebar() {
  const session = await auth();
  if (!isAuthenticated(session)) {
    return redirect('/login?redirectTo=/app');
  }

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const [products, error] = await getCategoriesAction();
      if (error) throw error;
      return products;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Sidebar collapsible='icon'>
        <SidebarContent>
          <NavMenu />
          <SidebarSeparator />
          <NavCategories />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href='?settings'>
                  <Settings2 className='h-4 w-4' />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </HydrationBoundary>
  );
}
