'use client';

import { useCreateCategory } from '@/components/category-input';
import { fetchJson } from '@/lib/fetch-json';
import { Category } from '@repo/api';
import { CategoryIcon, CreateCategory } from '@repo/ui/components/category';
import { cn } from '@repo/ui/lib/utils';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const chip =
  'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px]';
const chipOff = 'bg-background text-foreground/80 hover:bg-accent';
const chipOn = 'border-primary bg-primary text-primary-foreground font-medium';

export function CategoryFilter() {
  const pathname = usePathname();
  const addCategory = useCreateCategory();
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchJson<Category[]>('/api/categories'),
  });

  const filters = [
    { href: '/app', label: 'All', icon: null },
    ...(categories ?? []).map((category) => ({
      href: `/app/categories/${category.id}`,
      label: category.name,
      icon: <CategoryIcon icon={category.icon} />,
    })),
  ];

  return (
    <nav aria-label='Categories' className='flex flex-wrap gap-2'>
      {filters.map(({ href, label, icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(chip, isActive ? chipOn : chipOff)}
          >
            {icon}
            {label}
          </Link>
        );
      })}
      <CreateCategory
        onCreate={addCategory.mutateAsync}
        className={cn(chip, chipOff, 'border-dashed')}
      />
    </nav>
  );
}
