import { BrandIcon } from '@/lib/brand';
import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(<BrandIcon size={size.width} />, size);
}
