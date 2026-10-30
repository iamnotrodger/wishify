import { scrapeActiveTab } from '@/utils/scrape-active-tab';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { SignIn } from '../sign-in';

vi.mock('@/utils/scrape-active-tab', () => ({ scrapeActiveTab: vi.fn() }));
vi.mock('@/utils/auth-client', () => ({
  authClient: { useSession: () => ({ data: null }) },
}));

describe('SignIn', () => {
  describe('when a product is on the page', () => {
    it('should preview it as locked until sign in', async () => {
      vi.mocked(scrapeActiveTab).mockResolvedValue({
        url: 'https://store.test/shoe',
        name: 'Runner',
      });

      render(<SignIn />);

      expect(
        await screen.findByRole('heading', { name: 'Sign in to save this' })
      ).toBeInTheDocument();
      expect(screen.getByText('Runner')).toBeInTheDocument();
      expect(
        screen.getByRole('img', { name: 'Locked until you sign in' })
      ).toBeInTheDocument();
    });
  });

  describe('when no product is on the page', () => {
    it('should ask to sign in to Wishify', async () => {
      vi.mocked(scrapeActiveTab).mockResolvedValue({});

      render(<SignIn />);

      expect(
        await screen.findByRole('heading', { name: 'Sign in to Wishify' })
      ).toBeInTheDocument();
    });
  });

  describe('when sign in is clicked', () => {
    it('should open the login page in a new tab', async () => {
      vi.mocked(scrapeActiveTab).mockResolvedValue({});
      const create = vi.spyOn(fakeBrowser.tabs, 'create');
      const user = userEvent.setup();
      render(<SignIn />);

      await user.click(screen.getByRole('button', { name: 'Sign in' }));

      expect(create).toHaveBeenCalledWith({
        url: 'https://wishify.test/login',
      });
    });
  });
});
