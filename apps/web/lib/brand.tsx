// Shared by the generated icons and social images, which can't use Tailwind or theme variables.
export const BRAND_COLOR = '#3213b9';

// Two lines, broken the same way as the landing page headline.
const HEADLINE = ['Save it now.', 'Buy it when it fits.'];

export const SITE = {
  name: 'Wishify',
  headline: HEADLINE,
  tagline: HEADLINE.join(' '),
  description:
    'Save anything you want from any store in one click, then plan when to buy it.',
};

// lucide's Heart, inlined because next/og renders plain SVG only.
export const HeartMark = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='white'
    strokeWidth={2.4}
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5' />
  </svg>
);

export const BrandIcon = ({ size }: { size: number }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: BRAND_COLOR,
      borderRadius: size * 0.22,
    }}
  >
    <HeartMark size={size * 0.55} />
  </div>
);
