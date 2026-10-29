import { describe, expect, it } from 'vitest';
import { findSite } from '..';
import ssenseHtml from '../../__tests__/data/ssense.html?raw';
import { parseHtml, ssenseUrl } from '../../__tests__/helpers';
import { ssense } from '../ssense';

describe('ssense', () => {
  it('handles ssense.com', () => {
    expect(findSite(new URL(ssenseUrl))).toBe(ssense);
  });

  it('reads every gallery photo, including ones not lazy loaded yet', () => {
    expect(ssense.extract(parseHtml(ssenseHtml), new URL(ssenseUrl))).toEqual({
      images: [1, 2, 3, 4, 5].map((n) => ({
        url: `https://img.ssensemedia.com/images/b_white,c_lpad,g_center,h_1412,w_940/c_scale,h_960/f_auto,dpr_2.0/251161M213015_${n}/fear-of-god-essentials-black-jersey-crewneck-t-shirt.jpg`,
      })),
    });
  });

  it('returns nothing without a gallery', () => {
    expect(ssense.extract(parseHtml(''), new URL(ssenseUrl))).toEqual({});
  });
});
