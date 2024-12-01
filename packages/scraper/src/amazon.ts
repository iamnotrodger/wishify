import { Selector } from './selector';

export const amazonSelectors: Record<string, Selector[]> = {
  name: [
    { selector: '#productTitle', attribute: 'value' },
    {
      selector: '[name="productTitle"]',
      attribute: 'value',
    },
  ],
  brand: [
    {
      selector:
        '#productOverview_feature_div table tbody tr.po-brand td:nth-child(2) span',
    },
  ],
  price: [
    { selector: '#priceValue', attribute: 'value' },
    {
      selector: '[name="priceValue"]',
      attribute: 'value',
    },
    { selector: '#dp .a-price span.a-offscreen' },
    { selector: '#priceblock_ourprice' },
  ],
  currency: [
    { selector: '#currencyOfPreference', attribute: 'value' },
    {
      selector: '[name="currencyOfPreference"]',
      attribute: 'value',
    },
  ],
  image: [
    { selector: 'img#landingImage', attribute: 'src' },
    { selector: '#imgTagWrapperId img', attribute: 'src' },
    { selector: '[name="productImageUrl"]', attribute: 'value' },
  ],
  category: [
    {
      selector: '#productCategory',
      attribute: 'value',
    },
  ],
};
