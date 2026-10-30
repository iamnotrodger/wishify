'use client';

import { createCategoriesAction } from '@/app/actions';
import { fetchJson } from '@/lib/fetch-json';
import { Category, CreateCategory } from '@repo/api';
import { categoryIconSet, categoryNoun } from '@repo/ui/custom/category-icons';
import { LabelPicker } from '@repo/ui/custom/label';
import { useMutation, useQuery } from '@tanstack/react-query';

interface CategoryInputProps {
  value: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}

export function CategoryInput({
  value,
  onChange,
  className,
}: CategoryInputProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchJson<Category[]>('/api/categories'),
  });

  const addCategory = useCreateCategory();

  return (
    <LabelPicker
      labels={categories}
      iconSet={categoryIconSet}
      noun={categoryNoun}
      value={value}
      onChange={onChange}
      onCreate={addCategory.mutateAsync}
      className={className}
    />
  );
}

export function useCreateCategory() {
  return useMutation({
    mutationKey: ['addCategory'],
    mutationFn: async (input: CreateCategory) => {
      const [category, error] = await createCategoriesAction(input);
      if (error || !category)
        throw new Error(error ?? 'Failed to add category');
      return category;
    },
  });
}
