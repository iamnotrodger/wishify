import { deleteProduct, openWishify } from '@/utils/api';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductSaved } from '../product-saved';
import { savedProduct } from './fixtures';

vi.mock('@/utils/api', () => ({
  deleteProduct: vi.fn(),
  openWishify: vi.fn(),
}));
vi.mock('@/utils/auth-client', () => ({
  authClient: { useSession: () => ({ data: null }) },
}));

const setup = (product = savedProduct) => {
  const onUndone = vi.fn();
  render(<ProductSaved product={product} onUndone={onUndone} />);
  return { user: userEvent.setup(), onUndone };
};

beforeEach(() => {
  vi.mocked(deleteProduct).mockReset();
  vi.mocked(openWishify).mockReset();
});

describe('ProductSaved', () => {
  describe('when shown', () => {
    it('should summarize the saved product with its brand and categories', () => {
      setup();

      expect(screen.getByText('Runner')).toBeInTheDocument();
      expect(screen.getByText('Acme · Clothes')).toBeInTheDocument();
      expect(screen.getByText('$25.00')).toBeInTheDocument();
    });
  });

  describe('when it has no brand or categories', () => {
    it('should leave out the details line', () => {
      setup({ ...savedProduct, brand: null, categories: [] });

      expect(screen.queryByText(/·/)).not.toBeInTheDocument();
    });
  });

  describe('when undone', () => {
    it('should delete the product and report it', async () => {
      vi.mocked(deleteProduct).mockResolvedValue({ success: true });
      const { user, onUndone } = setup();

      await user.click(screen.getByRole('button', { name: 'Undo' }));

      expect(deleteProduct).toHaveBeenCalledWith('p1');
      expect(onUndone).toHaveBeenCalled();
    });
  });

  describe('when undoing fails', () => {
    it('should show the error and allow another try', async () => {
      vi.mocked(deleteProduct).mockRejectedValue(new Error('Not found'));
      const { user, onUndone } = setup();

      await user.click(screen.getByRole('button', { name: 'Undo' }));

      expect(await screen.findByText('Not found')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled();
      expect(onUndone).not.toHaveBeenCalled();
    });
  });

  describe('when the wishlist is opened', () => {
    it('should open the app', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('button', { name: 'Open wishlist' }));

      expect(openWishify).toHaveBeenCalledWith('/app');
    });
  });

  describe('when the item is viewed', () => {
    it('should open the app on that product', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('button', { name: 'View item' }));

      expect(openWishify).toHaveBeenCalledWith('/app?product_id=p1');
    });
  });
});
