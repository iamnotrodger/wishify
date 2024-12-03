import { Skeleton } from '@repo/ui/components/skeleton';

const ProductFormLoading = () => {
  return (
    <div className='flex flex-col gap-3 p-4'>
      <div className='mb-1 flex gap-4'>
        <Skeleton className='h-[116px] w-[116px] rounded-md' />
        <div>
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-6 w-full max-w-[280px] rounded-md' />
            <Skeleton className='mb-1 h-6 w-full max-w-[280px] rounded-md pb-2' />
          </div>
          <div className='mt-2 flex items-center gap-2'>
            <Skeleton className='h-10 w-[80px] rounded-md' />
            <Skeleton className='h-10 w-16 rounded-md' />
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        {/* <Skeleton className='mb-3 h-6 w-24 rounded-md' /> */}
        <Skeleton className='mb-2 h-6 w-36 rounded-md' />
        <div className='flex flex-wrap gap-2'>
          {Array(3)
            .fill(null)
            .map((_, idx) => (
              <Skeleton key={idx} className='h-10 w-24 rounded-lg' />
            ))}
        </div>
        <Skeleton className='h-10 w-[7.5rem] rounded-lg' />
      </div>
      <Skeleton className='h-6 w-14 rounded-md' />
      <Skeleton className='mb-6 h-[5rem] w-full rounded-md' />
      <Skeleton className='h-10 w-full rounded-md' />
    </div>
  );
};

export default ProductFormLoading;
