import { createCategory, createProduct } from '@/utils/api';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductForm, toFormValues } from '../product-form';
import { categories, savedProduct } from './fixtures';

vi.mock('@/utils/api', () => ({
  createCategory: vi.fn(),
  createProduct: vi.fn(),
  openWishify: vi.fn(),
}));
vi.mock('@/utils/auth-client', () => ({
  authClient: { useSession: () => ({ data: null }) },
}));

const scraped = {
  url: 'https://www.store.test/shoe',
  name: 'Runner',
  brand: 'Acme',
  price: 25,
  priceCurrency: 'USD',
};

const setup = (product: typeof scraped | Record<string, never> = scraped) => {
  const onSaved = vi.fn();
  const onCategoryCreated = vi.fn();
  render(
    <ProductForm
      product={product}
      categories={categories}
      defaultValues={toFormValues(product)}
      onSaved={onSaved}
      onCategoryCreated={onCategoryCreated}
    />
  );
  return { user: userEvent.setup(), onSaved, onCategoryCreated };
};

beforeEach(() => {
  vi.mocked(createProduct).mockReset().mockResolvedValue(savedProduct);
  vi.mocked(createCategory).mockReset();
});

describe('toFormValues', () => {
  describe('when the scraper finds nothing', () => {
    it('should start with empty fields so defaults apply', () => {
      expect(toFormValues({})).toMatchObject({
        name: '',
        price: '',
        priceCurrency: '',
      });
    });
  });

  describe('when the description is longer than the API allows', () => {
    it('should trim it to 256 characters', () => {
      const values = toFormValues({ description: 'a'.repeat(300) });

      expect(values.description).toHaveLength(256);
    });
  });

  describe('when the scraper finds images', () => {
    it('should keep them', () => {
      const images = [{ url: 'https://cdn.test/shoe.jpg' }];

      expect(toFormValues({ images }).images).toEqual(images);
    });
  });
});

describe('ProductForm', () => {
  describe('when a product was found', () => {
    it('should summarize it with where it was found', () => {
      setup();

      expect(screen.getByText('Acme')).toBeInTheDocument();
      expect(screen.getByText('US$25.00')).toBeInTheDocument();
      expect(
        screen.getByText('Product found on store.test')
      ).toBeInTheDocument();
    });

    it('should prefill the name and price', () => {
      setup();

      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(
        'Runner'
      );
      expect(screen.getByRole('spinbutton', { name: 'Price' })).toHaveValue(25);
    });
  });

  describe('when no product was found', () => {
    it('should ask the user to fill in the details', () => {
      setup({});

      expect(
        screen.getByText(/couldn't find product details/i)
      ).toBeInTheDocument();
    });
  });

  describe('when submitted', () => {
    it('should save the product and report it with the submitted values', async () => {
      const { user, onSaved } = setup();

      await user.click(
        screen.getByRole('button', { name: /save to wishify/i })
      );

      await waitFor(() => expect(onSaved).toHaveBeenCalled());
      expect(createProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Runner',
          price: 25,
          priceCurrency: 'USD',
        })
      );
      expect(onSaved).toHaveBeenCalledWith(
        savedProduct,
        expect.objectContaining({ name: 'Runner' })
      );
    });

    it('should use the default currency when none was scraped', async () => {
      const { user } = setup({});

      await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Lamp');
      await user.type(screen.getByRole('spinbutton', { name: 'Price' }), '40');
      await user.click(
        screen.getByRole('button', { name: /save to wishify/i })
      );

      await waitFor(() =>
        expect(createProduct).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Lamp',
            price: 40,
            priceCurrency: 'CAD',
          })
        )
      );
    });
  });

  describe('when Ctrl+Enter or Cmd+Enter is pressed', () => {
    it('should save the product', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('textbox', { name: 'Name' }));
      await user.keyboard('{Control>}{Enter}{/Control}');

      await waitFor(() => expect(createProduct).toHaveBeenCalled());
    });
  });

  describe('when the name is empty', () => {
    it('should show the error and not save', async () => {
      const { user } = setup();

      await user.clear(screen.getByRole('textbox', { name: 'Name' }));
      await user.click(
        screen.getByRole('button', { name: /save to wishify/i })
      );

      expect(
        await screen.findByText('Name cannot be empty')
      ).toBeInTheDocument();
      expect(createProduct).not.toHaveBeenCalled();
    });
  });

  describe('when saving fails', () => {
    it('should show the error from the API', async () => {
      vi.mocked(createProduct).mockRejectedValue(new Error('Unauthorized'));
      const { user, onSaved } = setup();

      await user.click(
        screen.getByRole('button', { name: /save to wishify/i })
      );

      expect(await screen.findByText('Unauthorized')).toBeInTheDocument();
      expect(onSaved).not.toHaveBeenCalled();
    });
  });

  describe('while saving', () => {
    it('should disable the save button', async () => {
      vi.mocked(createProduct).mockReturnValue(new Promise(() => {}));
      const { user } = setup();

      await user.click(
        screen.getByRole('button', { name: /save to wishify/i })
      );

      expect(
        await screen.findByRole('button', { name: /saving/i })
      ).toBeDisabled();
    });
  });

  describe('when categories are picked', () => {
    it('should save the product with them', async () => {
      const { user } = setup();

      await user.click(
        screen.getByRole('combobox', { name: 'Add categories' })
      );
      await user.click(await screen.findByRole('option', { name: 'Books' }));
      await user.keyboard('{Escape}');
      await user.click(
        screen.getByRole('button', { name: /save to wishify/i })
      );

      await waitFor(() =>
        expect(createProduct).toHaveBeenCalledWith(
          expect.objectContaining({ categoryIds: ['c2'] })
        )
      );
    });
  });

  describe('when a category is created', () => {
    it('should create it through the API and report it', async () => {
      const created = { id: 'c3', name: 'Toys', icon: null };
      vi.mocked(createCategory).mockResolvedValue(created);
      const { user, onCategoryCreated } = setup();

      await user.click(
        screen.getByRole('combobox', { name: 'Add categories' })
      );
      await user.type(
        await screen.findByPlaceholderText('Change categories...'),
        'Toys'
      );
      await user.click(
        screen.getByRole('option', { name: /create new category/i })
      );
      await user.click(screen.getByRole('button', { name: 'Skip' }));

      await waitFor(() =>
        expect(onCategoryCreated).toHaveBeenCalledWith(created)
      );
      expect(createCategory).toHaveBeenCalledWith({ name: 'Toys', icon: null });
    });
  });
});
