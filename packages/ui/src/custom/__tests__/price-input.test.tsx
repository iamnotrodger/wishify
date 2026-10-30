import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PriceInput } from '../price-input';

const setup = (
  props: Partial<React.ComponentProps<typeof PriceInput>> = {}
) => {
  const onCurrencyChange = vi.fn();
  render(
    <PriceInput
      aria-label='Price'
      value=''
      onChange={vi.fn()}
      currency='CAD'
      onCurrencyChange={onCurrencyChange}
      {...props}
    />
  );
  return { user: userEvent.setup(), onCurrencyChange };
};

describe('PriceInput', () => {
  describe('when no currency is set', () => {
    it('should pick the default currency', () => {
      const { onCurrencyChange } = setup({ currency: '' });

      expect(onCurrencyChange).toHaveBeenCalledWith('CAD');
    });

    it('should pick a configured default currency', () => {
      const { onCurrencyChange } = setup({
        currency: null,
        defaultCurrency: 'EUR',
      });

      expect(onCurrencyChange).toHaveBeenCalledWith('EUR');
      expect(
        screen.getByRole('combobox', { name: 'Currency' })
      ).toHaveTextContent('EUR');
    });
  });

  describe('when a currency is set', () => {
    it('should show it and keep it', () => {
      const { onCurrencyChange } = setup({ currency: 'USD' });

      expect(
        screen.getByRole('combobox', { name: 'Currency' })
      ).toHaveTextContent('USD');
      expect(onCurrencyChange).not.toHaveBeenCalled();
    });
  });

  describe('when a currency is searched by name and chosen', () => {
    it('should report its code and close the list', async () => {
      const { user, onCurrencyChange } = setup();

      await user.click(screen.getByRole('combobox', { name: 'Currency' }));
      await user.type(
        await screen.findByPlaceholderText('Search currency...'),
        'japanese'
      );
      await user.click(screen.getByRole('option', { name: /JPY/ }));

      expect(onCurrencyChange).toHaveBeenCalledWith('JPY');
      expect(
        screen.queryByPlaceholderText('Search currency...')
      ).not.toBeInTheDocument();
    });
  });

  describe('when the search matches no currency', () => {
    it('should say so', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('combobox', { name: 'Currency' }));
      await user.type(
        await screen.findByPlaceholderText('Search currency...'),
        '###'
      );

      expect(screen.getByText('No currency found.')).toBeInTheDocument();
    });
  });

  describe('when a price is typed', () => {
    it('should pass input props through to the number field', async () => {
      // The field is controlled, so read the typed value inside the handler.
      const typed: string[] = [];
      const { user } = setup({
        onChange: (event) => typed.push(event.target.value),
      });

      await user.type(screen.getByRole('spinbutton', { name: 'Price' }), '7');

      expect(typed).toEqual(['7']);
    });
  });

  describe('when the value is null', () => {
    it('should show an empty field', () => {
      setup({ value: null });

      expect(screen.getByRole('spinbutton', { name: 'Price' })).toHaveValue(
        null
      );
    });
  });

  describe('when disabled', () => {
    it('should disable both the currency and the price', () => {
      setup({ disabled: true });

      expect(screen.getByRole('combobox', { name: 'Currency' })).toBeDisabled();
      expect(screen.getByRole('spinbutton', { name: 'Price' })).toBeDisabled();
    });
  });
});
