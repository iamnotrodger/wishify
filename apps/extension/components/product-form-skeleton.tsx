import { PopupHeader } from '@/components/popup-header';
import { Skeleton } from '@repo/ui/components/skeleton';

export const ProductFormSkeleton = () => (
  <>
    <PopupHeader />
    <div className='flex flex-col gap-4 p-4'>
      <div className='flex items-center gap-3'>
        <Skeleton className='size-[72px] rounded-xl' />
        <div className='flex flex-1 flex-col gap-1.5'>
          <Skeleton className='h-3 w-16' />
          <Skeleton className='h-4 w-40' />
          <Skeleton className='h-4 w-20' />
        </div>
      </div>
      <Skeleton className='h-[58px] w-full' />
      <div className='grid grid-cols-2 gap-2.5'>
        <Skeleton className='h-[58px]' />
        <Skeleton className='h-[58px]' />
      </div>
    </div>
    <div className='border-t px-4 pt-3 pb-4'>
      <Skeleton className='h-10 w-full' />
    </div>
  </>
);
