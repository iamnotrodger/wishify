'use client';

import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui/components/popover';
import { cn } from '@repo/ui/lib/utils';
import { ImagePlus, Loader2 } from 'lucide-react';
import * as React from 'react';

const LOAD_TIMEOUT_MS = 10_000;

// Only accept links the browser can actually render, so a typo never saves.
const loadImage = (src: string) =>
  new Promise<void>((resolve, reject) => {
    const image = new window.Image();
    const timeout = setTimeout(reject, LOAD_TIMEOUT_MS);
    image.onload = () => {
      clearTimeout(timeout);
      resolve();
    };
    image.onerror = () => {
      clearTimeout(timeout);
      reject();
    };
    image.src = src;
  });

const toImageUrl = (input: string) => {
  try {
    const url = new URL(input.trim());
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.href
      : null;
  } catch {
    return null;
  }
};

interface ImageInputProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  className?: string;
}

function ImageInput({ value, onChange, className }: ImageInputProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setDraft('');
      setError(null);
    }
  };

  const submit = async () => {
    const url = toImageUrl(draft);
    if (!url) {
      setError('Paste a link that starts with http or https');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await loadImage(url);
      onChange(url);
      onOpenChange(false);
    } catch {
      setError("Couldn't load an image from that link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type='button'
          aria-label={value ? 'Change image' : 'Add image'}
          className={cn(
            '@container flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            !value &&
              'border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-muted-foreground hover:text-foreground',
            className
          )}
        >
          {value ? (
            <img
              src={value}
              alt=''
              className='size-full object-contain mix-blend-multiply dark:mix-blend-normal'
            />
          ) : (
            <span className='flex flex-col items-center gap-1.5 text-xs'>
              <ImagePlus className='size-5' strokeWidth={1.5} />
              <span className='hidden @[8rem]:inline'>Add image</span>
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align='start' className='flex w-72 flex-col gap-2 p-2'>
        <form
          className='flex gap-2'
          onSubmit={(event) => {
            event.preventDefault();
            // Stops the submit reaching a form this popover sits inside.
            event.stopPropagation();
            submit();
          }}
        >
          <Input
            autoFocus
            aria-label='Image link'
            placeholder='Paste an image link'
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            spellCheck={false}
          />
          <Button type='submit' disabled={!draft.trim() || isLoading}>
            {isLoading && <Loader2 className='animate-spin' />}
            {value ? 'Change' : 'Add'}
          </Button>
        </form>
        {value && (
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='text-destructive hover:text-destructive'
            onClick={() => {
              onChange(null);
              onOpenChange(false);
            }}
          >
            Remove image
          </Button>
        )}
        {error && <p className='px-1 text-xs text-destructive'>{error}</p>}
      </PopoverContent>
    </Popover>
  );
}

export { ImageInput };
