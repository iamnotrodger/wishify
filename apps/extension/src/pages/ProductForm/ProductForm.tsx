import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import cc from 'currency-codes';

import { CreateProduct, CreateProductSchema, Folder } from '@repo/api';
import { Button } from '@repo/ui/button';
import { Textarea } from '@repo/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@repo/ui/form';
import { Input } from '@repo/ui/input';
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@repo/ui/select';

const testFolders = [
  { id: '672d791a4b3f63ec36d0a345', name: '❤️ Favorites' },
  { id: '6730fd807e3d9e1937290b1c', name: '🎁 Gifts' },
  {
    id: '6730fd807e3d9e1937290b2d',
    name: '💰 Splurge',
  },
];

function ProductForm() {
  const form = useForm<CreateProduct>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      name: '',
      description: '',
      url: '',
      currency: 'CAD',
      images: [{ url: '' }],
    },
  });
  const [folders, setFolders] = useState<Folder[]>([]);
  useEffect(() => {
    setFolders(testFolders);
  }, []);

  form.watch('folderId');

  function onSubmit(values: CreateProduct) {
    console.log(values);
  }

  const currencyCodes = useMemo<string[]>(() => cc.codes(), []);

  return (
    <Form {...form}>
      <div className='bg-slate-100 border-b-slate-200 border-b text-left p-4'>
        <h1 className='font-semibold text-xl'>Save item</h1>
      </div>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-4 p-4 w-full h-full'
      >
        {/* TODO: use Command, and add list creation inside Select */}
        <div className='flex gap-4'>
          <div className='border min-h-[122px] min-w-[122px] bg-gray-100 rounded-md'>
            {/* TODO: add image uploading, fix aspect ratio */}
            <FormField
              control={form.control}
              name='images'
              render={({ field }) => (
                <FormItem className='w-full'>
                  {field.value?.length && field.value[0]?.url ? (
                    <img
                      className='max-h-[150px] rounded-md'
                      src={field.value[0].url}
                      alt='Image'
                    />
                  ) : null}
                </FormItem>
              )}
            />
          </div>
          <div>
            <div className='flex flex-col text-left w-full'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <Input
                      className='font-bold text-base p-0 h-[unset]
                       border-none mb-1.5 focus-visible:ring-[none] focus:cursor-auto hover:cursor-pointer hover:underline focus:underline decoration-blue-500 decoration-2
                      '
                      onChange={field.onChange}
                      value={field.value}
                      placeholder='Brand'
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <Textarea
                      className='text-sm p-0 border-none resize-none min-h-[2.8rem] max-h-[2.8rem] mb-2 overflow-ellipsis
                      focus-visible:ring-[none] focus:cursor-auto hover:cursor-pointer hover:underline focus:underline decoration-blue-500 decoration-2'
                      onChange={field.onChange}
                      value={field.value}
                      placeholder='Product Name'
                      spellCheck={false}
                    />
                  </FormItem>
                )}
              />
            </div>
            <div className='flex flex-row items-center gap-2'>
              <FormField
                control={form.control}
                name='currency'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className='max-w-[80px]'>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='max-h-[300px]'>
                        {/* TODO: Fix render speed of long list here. using virutalization, react-window, or similar. */}
                        {currencyCodes.map((code) => (
                          <SelectItem key={code} value={code}>
                            {code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <Input
                      type='number'
                      min='1'
                      step='any'
                      className='text-sm font-semibold text-left p-0 ml-[-1rem]
                      border-none h-[unset] focus-visible:ring-transparent focus:cursor-auto hover:cursor-pointer hover:underline decoration-blue-500 decoration-2'
                      onChange={(e) => {
                        if (
                          e.target.value === '.' ||
                          typeof Number(e.target.value) === 'number'
                        ) {
                          field.onChange(e);
                        } else {
                          e.preventDefault();
                        }
                      }}
                      value={field.value ? field.value : ''}
                      placeholder='0.00'
                    />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <FormField
          control={form.control}
          name='folderId'
          render={({ field }) => (
            <FormItem className='w-full text-left flex flex-col gap-2 justify-start'>
              <h2 className='text-lg font-medium'>Add to List</h2>
              <FormLabel className='w-full text-base font-normal '>
                My lists
              </FormLabel>
              <div className='flex gap-2 flex-wrap'>
                {folders.map(({ name, id }, i) =>
                  i != null ? (
                    <Button
                      key={name}
                      value={id}
                      variant='outline'
                      className={`w-fit text-sm font-normal rounded-lg max-w-[9rem]
                        ${field.value === id && 'bg-slate-200 hover:bg-slate-300'}`}
                      onClick={() => {
                        if (field.value !== id) {
                          field.onChange(id);
                        } else {
                          form.resetField('folderId');
                        }
                      }}
                    >
                      <p className='truncate' title={name}>
                        {name}
                      </p>
                    </Button>
                  ) : null
                )}
                <Button
                  variant='outline'
                  className='w-fit text-sm font-normal rounded-lg max-w-[9rem]'
                >
                  <Plus size={16} className='mr-2' />
                  Add new
                </Button>
              </div>
              {/* <Select
                defaultValue={field.value}
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a Folder' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {folders.map(({ name }, i) =>
                    i != null ? (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ) : null
                  )}
                </SelectContent>
              </Select> */}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem className='text-left mb-5'>
              <FormLabel className='w-full text-base font-normal'>
                Notes
              </FormLabel>
              <Textarea
                className='text-sm resize-none min-h-[6rem] max-h-[2.8rem] bg-slate-200 placeholder:text-slate-800'
                onChange={field.onChange}
                value={field.value}
                placeholder='Add your notes here...'
                spellCheck={false}
              />
            </FormItem>
          )}
        />
        <Button className='w-full' type='submit'>
          Save item to Wishify
        </Button>
      </form>
    </Form>
  );
}

export default ProductForm;
