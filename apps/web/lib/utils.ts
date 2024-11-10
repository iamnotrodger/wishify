export async function safeAsync<T>(promise: Promise<T>): Promise<[T?, Error?]> {
  try {
    const data = await promise;
    return [data, undefined];
  } catch (err) {
    const error = err instanceof Error ? err : new Error('unknown error');
    return [undefined, error];
  }
}
