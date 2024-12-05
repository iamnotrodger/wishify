import { AppSidebar } from '@/components/app-sidebar';
import { ProductModal } from '@/components/product-modal';
import { SidebarInset, SidebarProvider } from '@repo/ui/components/sidebar';

type Props = { children: React.ReactNode };

export default function AppLayout({ children }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
      <ProductModal />
    </SidebarProvider>
  );
}
