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

export function CategoryForm({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <div className='mt-4 flex items-center gap-4'>
          <Label htmlFor='name' className='text-right'>
            Name
          </Label>
          <Input id='name' className='col-span-3' />
        </div>
        <DialogFooter>
          <Button type='submit'>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
