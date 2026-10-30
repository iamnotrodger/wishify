import { createProduct, deleteProduct, getCategories } from '@/utils/api';
import { scrapeActiveTab } from '@/utils/scrape-active-tab';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SaveProduct } from '../save-product';
import { categories, savedProduct } from './fixtures';

vi.mock('@/utils/api', () => ({
  createCategory: vi.fn(),
  createProduct: vi.fn(),
  deleteProduct: vi.fn(),
  getCategories: vi.fn(),
  openWishify: vi.fn(),
}));
vi.mock('@/utils/scrape-active-tab', () => ({ scrapeActiveTab: vi.fn() }));
vi.mock('@/utils/auth-client', () => ({
  authClient: { useSession: () => ({ data: null }) },
}));

beforeEach(() => {
  vi.mocked(scrapeActiveTab).mockResolvedValue({
    url: 'https://store.test/shoe',
    name: 'Runner',
    price: 25,
    priceCurrency: 'CAD',
  });
  vi.mocked(getCategories).mockResolvedValue(categories);
  vi.mocked(createProduct).mockResolvedValue(savedProduct);
  vi.mocked(deleteProduct).mockResolvedValue({ success: true });
});

describe('SaveProduct', () => {
  describe('when the page and categories load', () => {
    it('should show the form filled from the page', async () => {
      render(<SaveProduct />);

      expect(await screen.findByRole('textbox', { name: 'Name' })).toHaveValue(
        'Runner'
      );
    });
  });

  describe('when loading fails', () => {
    it('should show the error', async () => {
      vi.mocked(getCategories).mockRejectedValue(new Error('Unauthorized'));

      render(<SaveProduct />);

      expect(await screen.findByText('Unauthorized')).toBeInTheDocument();
    });
  });

  describe('when the product is saved', () => {
    it('should show the saved screen', async () => {
      const user = userEvent.setup();
      render(<SaveProduct />);

      await user.click(
        await screen.findByRole('button', { name: /save to wishify/i })
      );

      expect(
        await screen.findByRole('heading', { name: 'Saved' })
      ).toBeInTheDocument();
    });
  });

  describe('when the save is undone', () => {
    it('should return to the form as it was submitted', async () => {
      const user = userEvent.setup();
      render(<SaveProduct />);
      const name = await screen.findByRole('textbox', { name: 'Name' });

      await user.clear(name);
      await user.type(name, 'Trail runner');
      await user.click(
        screen.getByRole('button', { name: /save to wishify/i })
      );
      await user.click(await screen.findByRole('button', { name: 'Undo' }));

      expect(await screen.findByRole('textbox', { name: 'Name' })).toHaveValue(
        'Trail runner'
      );
    });
  });
});
