import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';

export function ProductForm({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-8 items-center gap-4'>
            <Label htmlFor='url' className='text-right'>
              URL
            </Label>
            <Input id='url' className='col-span-7' />
          </div>
          <div className='grid grid-cols-8 items-center gap-4'>
            <Label htmlFor='name' className='text-right'>
              Name
            </Label>
            <Input id='name' className='col-span-7' />
          </div>
          <div className='grid grid-cols-8 items-center gap-4'>
            <Label htmlFor='price' className='text-right'>
              Price
            </Label>
            <Input id='price' className='col-span-7' />
          </div>
        </div>
        <DialogFooter>
          <Button type='submit'>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
