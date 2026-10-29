import { Skeleton } from '@repo/ui/components/skeleton';

export const ProductFormSkeleton = () => (
  <div className='flex flex-col gap-4 p-4'>
    <div className='flex gap-4'>
      <Skeleton className='size-[116px] rounded-md' />
      <div className='flex flex-1 flex-col gap-2'>
        <Skeleton className='h-6 w-full rounded-md' />
        <Skeleton className='h-6 w-full rounded-md' />
        <Skeleton className='h-9 w-40 rounded-md' />
      </div>
    </div>
    <Skeleton className='h-24 w-full rounded-md' />
    <Skeleton className='h-20 w-full rounded-md' />
    <Skeleton className='h-9 w-full rounded-md' />
  </div>
);
