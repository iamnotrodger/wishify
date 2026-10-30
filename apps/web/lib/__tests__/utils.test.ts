import { describe, expect, it } from 'vitest';
import { safeAsync, toSafeRedirect } from '../utils';

describe('safeAsync', () => {
  describe('when the promise resolves', () => {
    it('should return the data and no error', async () => {
      await expect(safeAsync(Promise.resolve(1))).resolves.toEqual([1, null]);
    });
  });

  describe('when the promise rejects with an Error', () => {
    it('should return that error', async () => {
      const error = new Error('boom');

      await expect(safeAsync(Promise.reject(error))).resolves.toEqual([
        null,
        error,
      ]);
    });
  });

  describe('when the promise rejects with something else', () => {
    it('should return an unknown error', async () => {
      const [, error] = await safeAsync(Promise.reject('boom'));

      expect(error).toEqual(new Error('unknown error'));
    });
  });
});

describe('toSafeRedirect', () => {
  describe('when the path is on this site', () => {
    it('should keep it', () => {
      expect(toSafeRedirect('/app/categories/1?x=1')).toBe(
        '/app/categories/1?x=1'
      );
    });
  });

  describe('when the path could lead to another site', () => {
    it.each(['//evil.test', '/\\evil.test', 'https://evil.test', 'app', ''])(
      'should fall back for %j',
      (path) => {
        expect(toSafeRedirect(path)).toBe('/app');
      }
    );
  });

  describe('when the path is not a string', () => {
    it('should use the given fallback', () => {
      expect(toSafeRedirect(undefined, '/login')).toBe('/login');
      expect(toSafeRedirect(['/app'], '/login')).toBe('/login');
    });
  });
});
