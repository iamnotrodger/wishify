"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Button } from "@repo/ui/components/button"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/command"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover"
import { cn } from "@repo/ui/lib/utils"
import { CATEGORY_ICONS, type CategoryIconName } from "@repo/api"
import {
  Baby,
  Bike,
  Book,
  Box,
  Camera,
  Check,
  ChevronLeft,
  Coffee,
  Dog,
  Dumbbell,
  Footprints,
  Gamepad2,
  Gem,
  Gift,
  Headphones,
  Heart,
  Lamp,
  Laptop,
  type LucideIcon,
  Music,
  Palette,
  Plane,
  Plus,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
  Tag,
  Utensils,
  Watch,
} from "lucide-react"

type CategoryOption = { id: string; name: string; icon?: string | null }
type CreateCategoryInput = { name: string; icon: CategoryIconName | null }

// Static imports keep the bundle to this set instead of every lucide icon.
const categoryIcons: Record<CategoryIconName, LucideIcon> = {
  shirt: Shirt,
  footprints: Footprints,
  gem: Gem,
  watch: Watch,
  smartphone: Smartphone,
  laptop: Laptop,
  headphones: Headphones,
  camera: Camera,
  "gamepad-2": Gamepad2,
  sofa: Sofa,
  lamp: Lamp,
  utensils: Utensils,
  coffee: Coffee,
  sparkles: Sparkles,
  dumbbell: Dumbbell,
  bike: Bike,
  book: Book,
  music: Music,
  palette: Palette,
  baby: Baby,
  dog: Dog,
  plane: Plane,
  gift: Gift,
  heart: Heart,
}

function CategoryIcon({
  icon,
  className,
}: {
  icon?: string | null
  className?: string
}) {
  const Icon = (icon && categoryIcons[icon as CategoryIconName]) || Box
  return <Icon className={cn("size-4 shrink-0", className)} aria-hidden />
}

const categoryBadgeVariants = cva(
  "inline-flex w-fit max-w-full items-center rounded-md border",
  {
    variants: {
      size: {
        default: "border-foreground h-9 gap-2 px-3 text-sm",
        sm: "bg-background h-6 gap-1.5 px-2 text-xs [&>svg]:size-3.5",
      },
    },
    defaultVariants: { size: "default" },
  }
)

function CategoryBadge({
  category,
  size,
  className,
}: {
  category: Pick<CategoryOption, "name" | "icon">
  className?: string
} & VariantProps<typeof categoryBadgeVariants>) {
  return (
    <span className={cn(categoryBadgeVariants({ size }), className)}>
      <CategoryIcon icon={category.icon} />
      <span className="truncate">{category.name}</span>
    </span>
  )
}

interface CategoryPickerProps<T extends CategoryOption> {
  categories: T[]
  value: string[]
  onChange: (ids: string[]) => void
  onCreate: (category: CreateCategoryInput) => Promise<T>
  className?: string
}

function CategoryPicker<T extends CategoryOption>({
  categories,
  value,
  onChange,
  onCreate,
  className,
}: CategoryPickerProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)
  // Set once "Create" is chosen; the popover then asks for an icon.
  const [pendingName, setPendingName] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const selected = categories.filter(({ id }) => value.includes(id))
  const name = search.trim()
  const canCreate =
    name !== "" &&
    !categories.some((c) => c.name.toLowerCase() === name.toLowerCase())

  const onOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      setSearch("")
      setPendingName(null)
      setError(null)
    }
  }

  const toggle = (id: string) =>
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    )

  const create = async (icon: CategoryIconName | null) => {
    if (pendingName == null) return
    setIsCreating(true)
    setError(null)
    try {
      const category = await onCreate({ name: pendingName, icon })
      onChange([...value, category.id])
      setSearch("")
      setPendingName(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {/* Anchored to the wrapper: the trigger swaps when the last pick is removed. */}
      <PopoverAnchor asChild>
        <div className={cn("flex flex-wrap items-center gap-1", className)}>
          {selected.map((category) => (
            // Like Linear: a badge opens the picker, where unchecking removes it.
            <button
              key={category.id}
              type="button"
              onClick={() => setOpen(true)}
              className="max-w-full rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <CategoryBadge
                category={category}
                size="sm"
                className="hover:bg-accent"
              />
            </button>
          ))}
          <PopoverTrigger asChild>
            {selected.length === 0 ? (
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-start font-normal"
              >
                <Tag />
                <span className="text-muted-foreground">Add categories</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="rounded-full"
                role="combobox"
                aria-expanded={open}
                aria-label="Add category"
              >
                <Plus />
              </Button>
            )}
          </PopoverTrigger>
        </div>
      </PopoverAnchor>
      <PopoverContent align="start" className="w-60 p-0">
        {pendingName == null ? (
          <Command>
            <CommandInput
              placeholder="Change categories..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList className="max-h-[min(240px,var(--radix-popover-content-available-height))]">
              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem
                    key={category.id}
                    value={category.name}
                    onSelect={() => toggle(category.id)}
                  >
                    <CategoryIcon icon={category.icon} />
                    <span className="truncate">{category.name}</span>
                    {value.includes(category.id) && (
                      <Check className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
                {canCreate && (
                  // cmdk filters by value, so this would hide without forceMount.
                  <CommandItem
                    forceMount
                    value={`create:${name}`}
                    onSelect={() => setPendingName(name)}
                  >
                    <Plus />
                    <span className="truncate">
                      Create new category: &ldquo;{name}&rdquo;
                    </span>
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : (
          <CategoryIconStep
            name={pendingName}
            disabled={isCreating}
            onBack={() => setPendingName(null)}
            onPick={create}
          />
        )}
        {error && (
          <p className="text-destructive border-t px-3 py-2 text-xs">
            {error}
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}

function CategoryIconStep({
  name,
  disabled,
  onBack,
  onPick,
}: {
  name: string
  disabled: boolean
  onBack: () => void
  onPick: (icon: CategoryIconName | null) => void
}) {
  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center gap-1 text-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Back"
          onClick={onBack}
        >
          <ChevronLeft />
        </Button>
        <span className="truncate">Icon for &ldquo;{name}&rdquo;</span>
      </div>
      <div role="group" aria-label="Icon" className="grid grid-cols-6 gap-1">
        {CATEGORY_ICONS.map((icon) => (
          <button
            key={icon}
            type="button"
            aria-label={icon.replace(/-/g, " ")}
            disabled={disabled}
            onClick={() => onPick(icon)}
            className="flex size-8 items-center justify-center rounded-md outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
          >
            <CategoryIcon icon={icon} />
          </button>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => onPick(null)}
      >
        Skip
      </Button>
    </div>
  )
}

function CreateCategory<T>({
  onCreate,
  className,
}: {
  onCreate: (category: CreateCategoryInput) => Promise<T>
  className?: string
}) {
  const [step, setStep] = React.useState<"idle" | "name" | "icon">("idle")
  const [name, setName] = React.useState("")
  const [isCreating, setIsCreating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (step === "name") inputRef.current?.focus()
  }, [step])

  const reset = () => {
    setStep("idle")
    setName("")
    setError(null)
  }

  const create = async (icon: CategoryIconName | null) => {
    setIsCreating(true)
    setError(null)
    try {
      await onCreate({ name: name.trim(), icon })
      reset()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create")
    } finally {
      setIsCreating(false)
    }
  }

  if (step === "idle") {
    return (
      <button
        type="button"
        className={className}
        onClick={() => setStep("name")}
      >
        <Plus className="size-3.5" />
        Add category
      </button>
    )
  }

  return (
    <Popover
      open={step === "icon"}
      onOpenChange={(open) => setStep(open ? "icon" : "name")}
    >
      <PopoverAnchor asChild>
        <input
          ref={inputRef}
          aria-label="Category name"
          placeholder="Category name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && name.trim()) {
              event.preventDefault()
              setStep("icon")
            } else if (event.key === "Escape") {
              reset()
            }
          }}
          onBlur={() => {
            if (step === "name" && !name.trim()) reset()
          }}
          className={cn(className, "w-40 outline-none")}
        />
      </PopoverAnchor>
      <PopoverContent align="start" className="w-60 p-0">
        <CategoryIconStep
          name={name.trim()}
          disabled={isCreating}
          onBack={() => setStep("name")}
          onPick={create}
        />
        {error && (
          <p className="text-destructive border-t px-3 py-2 text-xs">
            {error}
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}

export { CategoryBadge, CategoryIcon, CategoryPicker, CreateCategory }
