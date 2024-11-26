import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@repo/ui/sidebar';
import { AppSidebar } from '@components/app-sidebar';

type Props = { children: React.ReactNode };

export default function AppLayout({ children }: Props) {
  return (
    <SidebarProvider>
      <div className='flex'>
        <AppSidebar />
        <SidebarInset>
          <main className='mx-auto w-full'>
            <SidebarTrigger />
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
