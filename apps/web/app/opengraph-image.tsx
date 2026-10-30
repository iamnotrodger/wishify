import { BrandIcon, SITE } from '@/lib/brand';
import { ImageResponse } from 'next/og';

export const alt = `${SITE.name}: ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        background: 'white',
        color: '#09090b',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', width: 64, height: 64 }}>
          <BrandIcon size={64} />
        </div>
        <span style={{ fontSize: 44 }}>{SITE.name}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 84,
            letterSpacing: -3,
            lineHeight: 1.05,
          }}
        >
          {SITE.headline.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
        <span style={{ fontSize: 34, color: '#71717a' }}>
          {SITE.description}
        </span>
      </div>
    </div>,
    size
  );
}
