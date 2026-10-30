import { BRAND_COLOR, HeartMark } from '@/lib/brand';
import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// iOS rounds the corners itself, so the tile stays square.
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: BRAND_COLOR,
      }}
    >
      <HeartMark size={100} />
    </div>,
    size
  );
}
