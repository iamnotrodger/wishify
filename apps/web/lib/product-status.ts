import { Product, UpdateProductInput } from '@repo/api';
import {
  Check,
  type LucideIcon,
  PartyPopper,
  ShoppingCart,
  Undo2,
  X,
} from 'lucide-react';

export type Status = 'wanted' | 'planned' | 'bought';

export const getStatus = (product: Product): Status =>
  product.purchaseDate
    ? 'bought'
    : product.plannedPurchaseDate
      ? 'planned'
      : 'wanted';

export interface Action {
  label: string;
  icon: LucideIcon;
  update: () => UpdateProductInput;
}

const now = () => new Date().toISOString();

export const primaryActions: Record<Status, Action> = {
  wanted: {
    label: 'Want to Buy',
    icon: ShoppingCart,
    update: () => ({ plannedPurchaseDate: now() }),
  },
  planned: {
    label: 'Bought it!',
    icon: PartyPopper,
    update: () => ({ purchaseDate: now() }),
  },
  bought: {
    label: 'Undo purchase',
    icon: Undo2,
    update: () => ({ purchaseDate: null }),
  },
};

export const secondaryActions: Partial<Record<Status, Action>> = {
  wanted: {
    label: 'I bought this item already',
    icon: Check,
    update: () => ({ purchaseDate: now() }),
  },
  planned: {
    label: 'Remove from planned purchases',
    icon: X,
    update: () => ({ plannedPurchaseDate: null }),
  },
};
