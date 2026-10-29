export const formatPrice = (
  price?: number | string | null,
  currency?: string | null
) => {
  const amount = Number(price);
  if (price === '' || price == null || !Number.isFinite(amount)) return null;

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency ?? 'CAD',
    }).format(amount);
  } catch {
    // Unknown currency codes throw; show the bare amount instead.
    return amount.toFixed(2);
  }
};
