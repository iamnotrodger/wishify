import { vi } from 'vitest';
import { session } from './fixtures';

export const getSession = vi.fn();

export const authMock = {
  getSession,
  isAuthenticated: (value: unknown) => !!value,
  auth: { api: { signOut: vi.fn() } },
};

export const signIn = () => getSession.mockResolvedValue(session);
export const signOut = () => getSession.mockResolvedValue(null);
