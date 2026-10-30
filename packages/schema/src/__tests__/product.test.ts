import { describe, expect, it } from 'vitest';
import {
  CategorySchema,
  CreateCategorySchema,
  CreateProductSchema,
  UpdateProductSchema,
} from '../product';

const product = { name: 'Runner', price: 25, priceCurrency: 'CAD' };

describe('CreateProductSchema', () => {
  describe('when the price comes from a form as text', () => {
    it('should turn it into a number', () => {
      expect(
        CreateProductSchema.parse({ ...product, price: '25.5' }).price
      ).toBe(25.5);
    });
  });

  describe('when the price is negative or not a number', () => {
    it.each([-1, 'abc'])('should reject %j', (price) => {
      expect(CreateProductSchema.safeParse({ ...product, price }).success).toBe(
        false
      );
    });
  });

  describe('when the price is free', () => {
    it('should accept it', () => {
      expect(CreateProductSchema.parse({ ...product, price: 0 }).price).toBe(0);
    });
  });

  describe('when the price or currency is missing', () => {
    it.each(['price', 'priceCurrency'] as const)(
      'should reject a product without %s',
      (field) => {
        const { [field]: _, ...rest } = product;

        expect(CreateProductSchema.safeParse(rest).success).toBe(false);
      }
    );
  });

  describe('when the currency is not a 3-letter code', () => {
    it('should explain the problem', () => {
      const result = CreateProductSchema.safeParse({
        ...product,
        priceCurrency: 'CA',
      });

      expect(result.error?.issues[0]?.message).toBe(
        'Must choose a valid currency'
      );
    });
  });

  describe('when the description is longer than 256 characters', () => {
    it('should reject it', () => {
      expect(
        CreateProductSchema.safeParse({
          ...product,
          description: 'a'.repeat(257),
        }).success
      ).toBe(false);
    });
  });
});

describe('UpdateProductSchema', () => {
  describe('when price and currency change together', () => {
    it.each([
      { price: 10, priceCurrency: 'USD' },
      { price: null, priceCurrency: null },
      {},
    ])('should accept %j', (changes) => {
      expect(UpdateProductSchema.safeParse(changes).success).toBe(true);
    });
  });

  describe('when only one of price and currency changes', () => {
    it.each([
      { price: 10 },
      { priceCurrency: 'USD' },
      { price: null },
      { price: 10, priceCurrency: null },
      { price: null, priceCurrency: 'USD' },
    ])('should reject %j on the currency field', (changes) => {
      const result = UpdateProductSchema.safeParse(changes);

      expect(result.error?.issues[0]).toMatchObject({
        message: 'Price and currency must be set together',
        path: ['priceCurrency'],
      });
    });
  });

  describe('when only some fields change', () => {
    it('should not require a name', () => {
      expect(
        UpdateProductSchema.safeParse({ purchaseDate: null }).success
      ).toBe(true);
    });

    it('should still reject an empty name', () => {
      expect(UpdateProductSchema.safeParse({ name: '' }).success).toBe(false);
    });
  });
});

describe('CreateCategorySchema', () => {
  describe('when the name has spaces around it', () => {
    it('should trim them so duplicates are caught', () => {
      expect(CreateCategorySchema.parse({ name: '  Clothes ' }).name).toBe(
        'Clothes'
      );
    });
  });

  describe('when the name is blank', () => {
    it('should reject it', () => {
      expect(CreateCategorySchema.safeParse({ name: '   ' }).success).toBe(
        false
      );
    });
  });

  describe('when the icon is not in the fixed list', () => {
    it('should reject it', () => {
      expect(
        CreateCategorySchema.safeParse({ name: 'Toys', icon: 'rocket' }).success
      ).toBe(false);
    });
  });

  describe('when no icon is chosen', () => {
    it.each([undefined, null])('should accept %j', (icon) => {
      expect(
        CreateCategorySchema.safeParse({ name: 'Toys', icon }).success
      ).toBe(true);
    });
  });
});

describe('CategorySchema', () => {
  describe('when a stored category has an icon outside the fixed list', () => {
    it('should still load it', () => {
      expect(
        CategorySchema.safeParse({ id: 'c1', name: 'Toys', icon: 'rocket' })
          .success
      ).toBe(true);
    });
  });
});
