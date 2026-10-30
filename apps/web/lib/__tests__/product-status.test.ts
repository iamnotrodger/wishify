import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { product } from '../../__tests__/fixtures';
import { getStatus, primaryActions, secondaryActions } from '../product-status';

const NOW = '2026-10-30T12:00:00.000Z';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('getStatus', () => {
  describe('when the product has no dates', () => {
    it('should be wanted', () => {
      expect(
        getStatus({ ...product, purchaseDate: null, plannedPurchaseDate: null })
      ).toBe('wanted');
    });
  });

  describe('when the product has a planned purchase date', () => {
    it('should be planned', () => {
      expect(
        getStatus({ ...product, purchaseDate: null, plannedPurchaseDate: NOW })
      ).toBe('planned');
    });
  });

  describe('when the product has a purchase date', () => {
    it('should be bought even if it was also planned', () => {
      expect(
        getStatus({ ...product, purchaseDate: NOW, plannedPurchaseDate: NOW })
      ).toBe('bought');
    });
  });
});

describe('primaryActions', () => {
  describe('when a wanted product is planned', () => {
    it('should set the planned date to now', () => {
      expect(primaryActions.wanted.update()).toEqual({
        plannedPurchaseDate: NOW,
      });
    });
  });

  describe('when a planned product is bought', () => {
    it('should set the purchase date to now', () => {
      expect(primaryActions.planned.update()).toEqual({ purchaseDate: NOW });
    });
  });

  describe('when a purchase is undone', () => {
    it('should clear the purchase date', () => {
      expect(primaryActions.bought.update()).toEqual({ purchaseDate: null });
    });
  });
});

describe('secondaryActions', () => {
  describe('when a wanted product was already bought', () => {
    it('should set the purchase date to now', () => {
      expect(secondaryActions.wanted?.update()).toEqual({ purchaseDate: NOW });
    });
  });

  describe('when a planned purchase is removed', () => {
    it('should clear the planned date', () => {
      expect(secondaryActions.planned?.update()).toEqual({
        plannedPurchaseDate: null,
      });
    });
  });

  describe('when the product is bought', () => {
    it('should have no secondary action', () => {
      expect(secondaryActions.bought).toBeUndefined();
    });
  });
});
