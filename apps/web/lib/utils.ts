export async function safeAsync<T>(
  promise: Promise<T>
): Promise<[T | null, Error | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (err) {
    const error = err instanceof Error ? err : new Error('unknown error');
    return [null, error];
  }
}

// Only same-origin paths: "//host" and "/\host" are treated by browsers as other origins.
export const toSafeRedirect = (path: unknown, fallback = '/app') =>
  typeof path === 'string' && /^\/(?![/\\])/.test(path) ? path : fallback;
