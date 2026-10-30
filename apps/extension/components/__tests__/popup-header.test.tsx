import { openWishify } from '@/utils/api';
import { authClient } from '@/utils/auth-client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PopupHeader } from '../popup-header';
import { session } from './fixtures';

vi.mock('@/utils/api', () => ({ openWishify: vi.fn() }));
vi.mock('@/utils/auth-client', () => ({
  authClient: { useSession: vi.fn(), signOut: vi.fn() },
}));

const signedIn = () =>
  vi
    .mocked(authClient.useSession)
    .mockReturnValue(session as ReturnType<typeof authClient.useSession>);

const openMenu = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /wishify/i }));
  return user;
};

beforeEach(() => {
  vi.mocked(authClient.useSession).mockReturnValue({ data: null } as ReturnType<
    typeof authClient.useSession
  >);
});

describe('PopupHeader', () => {
  describe('when signed out', () => {
    it('should show the brand without a menu', () => {
      render(<PopupHeader />);

      expect(screen.getByText('Wishify')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('when given actions', () => {
    it('should show them beside the brand', () => {
      render(<PopupHeader>Undo</PopupHeader>);

      expect(screen.getByText('Undo')).toBeInTheDocument();
    });
  });

  describe('when signed in and the brand is clicked', () => {
    it('should show the account', async () => {
      signedIn();
      render(<PopupHeader />);

      await openMenu();

      expect(await screen.findByText('Rodger')).toBeInTheDocument();
      expect(screen.getByText('rodger@wishify.test')).toBeInTheDocument();
    });

    it('should open Wishify from the menu', async () => {
      signedIn();
      render(<PopupHeader />);

      const user = await openMenu();
      await user.click(
        await screen.findByRole('menuitem', { name: 'Open Wishify' })
      );

      expect(openWishify).toHaveBeenCalledWith('/app');
    });

    it('should sign out from the menu', async () => {
      signedIn();
      render(<PopupHeader />);

      const user = await openMenu();
      await user.click(
        await screen.findByRole('menuitem', { name: 'Sign out' })
      );

      expect(authClient.signOut).toHaveBeenCalled();
    });
  });
});
