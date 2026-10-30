import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductFound } from '../product-found';

describe('ProductFound', () => {
  describe('when a named product has a store URL', () => {
    it('should name the store without www', () => {
      render(
        <ProductFound
          product={{ name: 'Runner', url: 'https://www.store.test/shoe' }}
        />
      );

      expect(
        screen.getByText('Product found on store.test')
      ).toBeInTheDocument();
    });
  });

  describe('when the product has no name or a bad URL', () => {
    it('should show nothing', () => {
      const { container } = render(
        <>
          <ProductFound product={{ url: 'https://store.test/shoe' }} />
          <ProductFound product={{ name: 'Runner', url: 'not a url' }} />
        </>
      );

      expect(container).toBeEmptyDOMElement();
    });
  });
});
