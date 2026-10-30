// Pinned rather than the runtime default: the server and browser locales can
// differ, and server-rendered text must match the client's or hydration fails.
export const LOCALE = 'en-CA';

export const formatPrice = (
  price?: number | string | null,
  currency?: string | null
) => {
  const amount = Number(price);
  if (price === '' || price == null || !Number.isFinite(amount)) return null;

  try {
    return new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency: currency ?? 'CAD',
    }).format(amount);
  } catch {
    // Unknown currency codes throw; show the bare amount instead.
    return amount.toFixed(2);
  }
};
