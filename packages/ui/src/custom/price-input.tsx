'use client';

import { Button } from '@repo/ui/components/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@repo/ui/components/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui/components/popover';
import { cn } from '@repo/ui/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import * as React from 'react';

// The browser ships ISO 4217 codes and names, so no list is bundled.
const currencyNames = new Intl.DisplayNames(undefined, { type: 'currency' });
const currencies = Intl.supportedValuesOf('currency').map((code) => ({
  code,
  name: currencyNames.of(code) ?? code,
}));

interface PriceInputProps extends Omit<
  React.ComponentProps<'input'>,
  'type' | 'value'
> {
  value?: string | number | null;
  currency?: string | null;
  onCurrencyChange: (currency: string) => void;
  defaultCurrency?: string;
}

function PriceInput({
  value,
  currency,
  onCurrencyChange,
  defaultCurrency = 'CAD',
  className,
  disabled,
  ...props
}: PriceInputProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!currency) onCurrencyChange(defaultCurrency);
  }, [currency, defaultCurrency, onCurrencyChange]);

  return (
    <div
      data-slot='price-input'
      className={cn(
        'flex h-9 w-full min-w-0 items-center rounded-md border border-input shadow-xs transition-[color,box-shadow] dark:bg-input/30',
        'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
        'has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20',
        className
      )}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            role='combobox'
            aria-expanded={open}
            aria-label='Currency'
            disabled={disabled}
            className='ml-0.5 h-7 gap-1 px-2 text-xs text-muted-foreground has-[>svg]:px-2'
          >
            {currency || defaultCurrency}
            <ChevronDown className='size-3' />
          </Button>
        </PopoverTrigger>
        <PopoverContent align='start' className='w-64 p-0'>
          <Command>
            <CommandInput placeholder='Search currency...' />
            <CommandList className='max-h-[min(240px,var(--radix-popover-content-available-height))]'>
              <CommandEmpty>No currency found.</CommandEmpty>
              <CommandGroup>
                {currencies.map(({ code, name }) => (
                  <CommandItem
                    key={code}
                    value={`${code} ${name}`}
                    onSelect={() => {
                      onCurrencyChange(code);
                      setOpen(false);
                    }}
                  >
                    <span className='w-9 font-medium'>{code}</span>
                    <span className='truncate text-muted-foreground'>
                      {name}
                    </span>
                    {code === currency && <Check className='ml-auto' />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <input
        type='number'
        inputMode='decimal'
        min='0'
        step='any'
        value={value ?? ''}
        disabled={disabled}
        className='h-full w-full min-w-0 bg-transparent px-2 text-base tabular-nums outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
        {...props}
      />
    </div>
  );
}

export { PriceInput };
