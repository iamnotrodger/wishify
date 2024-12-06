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
