'use client';

import { Button } from '@repo/ui/components/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@repo/ui/components/command';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui/components/popover';
import { cn } from '@repo/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, ChevronLeft, Plus, Tag } from 'lucide-react';
import * as React from 'react';

export type LabelIconComponent = React.ComponentType<{
  className?: string;
  'aria-hidden'?: boolean;
}>;

/** Icons a label can use, keyed by the name stored on the label. */
export interface LabelIconSet<TIcon extends string = string> {
  icons: Record<TIcon, LabelIconComponent>;
  /** Shown for a label without an icon, or with a name not in `icons`. */
  fallback?: LabelIconComponent;
}

export interface LabelNoun {
  one: string;
  other: string;
}

export type LabelOption = { id: string; name: string; icon?: string | null };
export type NewLabel<TIcon extends string> = {
  name: string;
  icon: TIcon | null;
};

const defaultNoun: LabelNoun = { one: 'label', other: 'labels' };

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

const iconNames = <TIcon extends string>(iconSet?: LabelIconSet<TIcon>) =>
  iconSet ? (Object.keys(iconSet.icons) as TIcon[]) : [];

function LabelIcon({
  icon,
  iconSet,
  className,
}: {
  icon?: string | null;
  iconSet?: LabelIconSet;
  className?: string;
}) {
  const Icon =
    (icon && (iconSet?.icons as Record<string, LabelIconComponent>)?.[icon]) ||
    iconSet?.fallback;
  if (!Icon) return null;
  return <Icon className={cn('size-4 shrink-0', className)} aria-hidden />;
}

const labelBadgeVariants = cva(
  'inline-flex w-fit max-w-full items-center rounded-2xl border',
  {
    variants: {
      size: {
        default: 'border-foreground h-9 gap-2 px-3 text-sm',
        sm: 'bg-background h-7 gap-1.5 px-2.5 text-[13px] [&>svg]:size-4',
      },
    },
    defaultVariants: { size: 'default' },
  }
);

function LabelBadge({
  label,
  iconSet,
  size,
  className,
}: {
  label: Pick<LabelOption, 'name' | 'icon'>;
  iconSet?: LabelIconSet;
  className?: string;
} & VariantProps<typeof labelBadgeVariants>) {
  return (
    <span className={cn(labelBadgeVariants({ size }), className)}>
      <LabelIcon icon={label.icon} iconSet={iconSet} />
      <span className='truncate'>{label.name}</span>
    </span>
  );
}

interface LabelPickerProps<T extends LabelOption, TIcon extends string> {
  labels: T[];
  value: string[];
  onChange: (ids: string[]) => void;
  onCreate: (label: NewLabel<TIcon>) => Promise<T>;
  /** Without one, new labels skip the icon step. */
  iconSet?: LabelIconSet<TIcon>;
  noun?: LabelNoun;
  className?: string;
}

function LabelPicker<T extends LabelOption, TIcon extends string>({
  labels,
  value,
  onChange,
  onCreate,
  iconSet,
  noun = defaultNoun,
  className,
}: LabelPickerProps<T, TIcon>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  // Set once "Create" is chosen; the popover then asks for an icon.
  const [pendingName, setPendingName] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const selected = labels.filter(({ id }) => value.includes(id));
  const name = search.trim();
  const canCreate =
    name !== '' &&
    !labels.some((l) => l.name.toLowerCase() === name.toLowerCase());

  const onOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setSearch('');
      setPendingName(null);
      setError(null);
    }
  };

  const toggle = (id: string) =>
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    );

  const create = async (name: string, icon: TIcon | null) => {
    setIsCreating(true);
    setError(null);
    try {
      const label = await onCreate({ name, icon });
      onChange([...value, label.id]);
      setSearch('');
      setPendingName(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {/* Anchored to the wrapper: the trigger swaps when the last pick is removed. */}
      <PopoverAnchor asChild>
        <div className={cn('flex flex-wrap items-center gap-1', className)}>
          {selected.map((label) => (
            // Like Linear: a badge opens the picker, where unchecking removes it.
            <button
              key={label.id}
              type='button'
              onClick={() => setOpen(true)}
              className='focus-visible:ring-ring/50 max-w-full rounded-md outline-none focus-visible:ring-2'
            >
              <LabelBadge
                label={label}
                iconSet={iconSet}
                size='sm'
                className='hover:bg-accent'
              />
            </button>
          ))}
          <PopoverTrigger asChild>
            {selected.length === 0 ? (
              <Button
                type='button'
                variant='outline'
                role='combobox'
                aria-expanded={open}
                aria-label={`Add ${noun.other}`}
                className='w-full justify-start font-normal'
              >
                <Tag />
                <span className='text-muted-foreground'>Add {noun.other}</span>
              </Button>
            ) : (
              <Button
                type='button'
                variant='ghost'
                size='icon-xs'
                className='size-7 rounded-full'
                role='combobox'
                aria-expanded={open}
                aria-label={`Add ${noun.one}`}
              >
                <Plus />
              </Button>
            )}
          </PopoverTrigger>
        </div>
      </PopoverAnchor>
      <PopoverContent align='start' className='w-60 p-0'>
        {pendingName == null ? (
          <Command>
            <CommandInput
              placeholder={`Change ${noun.other}...`}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList className='max-h-[min(240px,var(--radix-popover-content-available-height))]'>
              {/* forceMount: cmdk hides a group with no matches, which would hide Create. */}
                <CommandGroup forceMount>
                {labels.map((label) => (
                  <CommandItem
                    key={label.id}
                    value={label.name}
                    onSelect={() => toggle(label.id)}
                  >
                    <LabelIcon icon={label.icon} iconSet={iconSet} />
                    <span className='truncate'>{label.name}</span>
                    {value.includes(label.id) && <Check className='ml-auto' />}
                  </CommandItem>
                ))}
                {canCreate && (
                  // cmdk filters by value, so this would hide without forceMount.
                  <CommandItem
                    forceMount
                    value={`create:${name}`}
                    disabled={isCreating}
                    onSelect={() =>
                      iconNames(iconSet).length
                        ? setPendingName(name)
                        : create(name, null)
                    }
                  >
                    <Plus />
                    <span className='truncate'>
                      Create new {noun.one}: &ldquo;{name}&rdquo;
                    </span>
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : (
          <LabelIconStep
            name={pendingName}
            iconSet={iconSet}
            disabled={isCreating}
            onBack={() => setPendingName(null)}
            onPick={(icon) => create(pendingName, icon)}
          />
        )}
        {error && (
          <p className='text-destructive border-t px-3 py-2 text-xs'>{error}</p>
        )}
      </PopoverContent>
    </Popover>
  );
}

function LabelIconStep<TIcon extends string>({
  name,
  iconSet,
  disabled,
  onBack,
  onPick,
}: {
  name: string;
  iconSet?: LabelIconSet<TIcon>;
  disabled: boolean;
  onBack: () => void;
  onPick: (icon: TIcon | null) => void;
}) {
  return (
    <div className='flex flex-col gap-2 p-2'>
      <div className='flex items-center gap-1 text-sm'>
        <Button
          type='button'
          variant='ghost'
          size='icon-xs'
          aria-label='Back'
          onClick={onBack}
        >
          <ChevronLeft />
        </Button>
        <span className='truncate'>Icon for &ldquo;{name}&rdquo;</span>
      </div>
      <div role='group' aria-label='Icon' className='grid grid-cols-6 gap-1'>
        {iconNames(iconSet).map((icon) => (
          <button
            key={icon}
            type='button'
            aria-label={icon.replace(/-/g, ' ')}
            disabled={disabled}
            onClick={() => onPick(icon)}
            className='hover:bg-accent focus-visible:ring-ring/50 flex size-8 items-center justify-center rounded-md outline-none focus-visible:ring-2 disabled:opacity-50'
          >
            <LabelIcon icon={icon} iconSet={iconSet} />
          </button>
        ))}
      </div>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        disabled={disabled}
        onClick={() => onPick(null)}
      >
        Skip
      </Button>
    </div>
  );
}

function CreateLabel<T, TIcon extends string>({
  onCreate,
  iconSet,
  noun = defaultNoun,
  className,
}: {
  onCreate: (label: NewLabel<TIcon>) => Promise<T>;
  /** Without one, Enter creates the label straight away. */
  iconSet?: LabelIconSet<TIcon>;
  noun?: LabelNoun;
  className?: string;
}) {
  const [step, setStep] = React.useState<'idle' | 'name' | 'icon'>('idle');
  const [name, setName] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (step === 'name') inputRef.current?.focus();
  }, [step]);

  const reset = () => {
    setStep('idle');
    setName('');
    setError(null);
  };

  const create = async (icon: TIcon | null) => {
    setIsCreating(true);
    setError(null);
    try {
      await onCreate({ name: name.trim(), icon });
      reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create');
    } finally {
      setIsCreating(false);
    }
  };

  if (step === 'idle') {
    return (
      <button
        type='button'
        className={className}
        onClick={() => setStep('name')}
      >
        <Plus className='size-3.5' />
        Add {noun.one}
      </button>
    );
  }

  return (
    <Popover
      open={step === 'icon' || error != null}
      onOpenChange={(open) => {
        setStep(open ? 'icon' : 'name');
        if (!open) setError(null);
      }}
    >
      <PopoverAnchor asChild>
        <input
          ref={inputRef}
          aria-label={`${capitalize(noun.one)} name`}
          placeholder={`${capitalize(noun.one)} name`}
          value={name}
          disabled={isCreating}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && name.trim()) {
              event.preventDefault();
              if (iconNames(iconSet).length) setStep('icon');
              else create(null);
            } else if (event.key === 'Escape') {
              reset();
            }
          }}
          onBlur={() => {
            if (step === 'name' && !name.trim()) reset();
          }}
          className={cn(className, 'w-40 outline-none')}
        />
      </PopoverAnchor>
      <PopoverContent align='start' className='w-60 p-0'>
        {step === 'icon' && (
          <LabelIconStep
            name={name.trim()}
            iconSet={iconSet}
            disabled={isCreating}
            onBack={() => setStep('name')}
            onPick={create}
          />
        )}
        {error && (
          <p className='text-destructive border-t px-3 py-2 text-xs'>{error}</p>
        )}
      </PopoverContent>
    </Popover>
  );
}

export { CreateLabel, LabelBadge, LabelIcon, LabelPicker };
