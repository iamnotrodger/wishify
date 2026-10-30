import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  CreateLabel,
  LabelBadge,
  LabelPicker,
  type LabelIconSet,
  type LabelOption,
} from '../label';

const testIcon = (name: string) =>
  function TestIcon() {
    return <svg data-testid={`icon-${name}`} />;
  };

const iconSet: LabelIconSet<'star' | 'moon'> = {
  icons: { star: testIcon('star'), moon: testIcon('moon') },
  fallback: testIcon('fallback'),
};

const noun = { one: 'category', other: 'categories' };

const labels: LabelOption[] = [
  { id: '1', name: 'Clothes', icon: 'star' },
  { id: '2', name: 'Books', icon: 'moon' },
  { id: '3', name: 'Games', icon: null },
];

describe('LabelBadge', () => {
  describe('when the label has a known icon', () => {
    it('should show that icon next to the name', () => {
      render(<LabelBadge label={labels[0]!} iconSet={iconSet} />);

      expect(screen.getByText('Clothes')).toBeInTheDocument();
      expect(screen.getByTestId('icon-star')).toBeInTheDocument();
    });
  });

  describe('when the label has no icon or an unknown one', () => {
    it('should show the fallback icon', () => {
      render(
        <>
          <LabelBadge label={{ name: 'A', icon: null }} iconSet={iconSet} />
          <LabelBadge
            label={{ name: 'B', icon: 'unknown' }}
            iconSet={iconSet}
          />
        </>
      );

      expect(screen.getAllByTestId('icon-fallback')).toHaveLength(2);
    });
  });

  describe('when no icon set is given', () => {
    it('should show only the name', () => {
      const { container } = render(<LabelBadge label={labels[0]!} />);

      expect(container.querySelector('svg')).toBeNull();
      expect(screen.getByText('Clothes')).toBeInTheDocument();
    });
  });
});

describe('LabelPicker', () => {
  const setup = (
    props: Partial<React.ComponentProps<typeof LabelPicker>> = {}
  ) => {
    const onChange = vi.fn();
    const onCreate = vi.fn(async ({ name }: { name: string }) => ({
      id: 'new',
      name,
    }));
    render(
      <LabelPicker
        labels={labels}
        value={[]}
        onChange={onChange}
        onCreate={onCreate}
        noun={noun}
        {...props}
      />
    );
    return { user: userEvent.setup(), onChange, onCreate };
  };

  describe('when nothing is selected', () => {
    it('should show an add button named after the noun', () => {
      setup();

      expect(
        screen.getByRole('combobox', { name: /add categories/i })
      ).toBeInTheDocument();
    });

    it('should fall back to "labels" when no noun is given', () => {
      setup({ noun: undefined });

      expect(
        screen.getByRole('combobox', { name: /add labels/i })
      ).toBeInTheDocument();
    });
  });

  describe('when labels are selected', () => {
    it('should show a badge for each selected label only', () => {
      setup({ value: ['1', '3'] });

      expect(screen.getByText('Clothes')).toBeInTheDocument();
      expect(screen.getByText('Games')).toBeInTheDocument();
      expect(screen.queryByText('Books')).not.toBeInTheDocument();
    });

    it('should replace the add button with a round plus button', () => {
      setup({ value: ['1'] });

      expect(
        screen.getByRole('combobox', { name: 'Add category' })
      ).toBeInTheDocument();
    });
  });

  describe('when a badge is clicked', () => {
    it('should open the picker', async () => {
      const { user } = setup({ value: ['1'] });

      await user.click(screen.getByText('Clothes'));

      expect(
        await screen.findByPlaceholderText('Change categories...')
      ).toBeInTheDocument();
    });
  });

  describe('when an unselected label is chosen', () => {
    it('should add it to the value', async () => {
      const { user, onChange } = setup({ value: ['1'] });

      await user.click(screen.getByRole('combobox', { name: 'Add category' }));
      await user.click(await screen.findByRole('option', { name: 'Books' }));

      expect(onChange).toHaveBeenCalledWith(['1', '2']);
    });
  });

  describe('when a selected label is chosen', () => {
    it('should remove it from the value', async () => {
      const { user, onChange } = setup({ value: ['1', '2'] });

      await user.click(screen.getByRole('combobox', { name: 'Add category' }));
      await user.click(await screen.findByRole('option', { name: 'Clothes' }));

      expect(onChange).toHaveBeenCalledWith(['2']);
    });
  });

  describe('when the search matches an existing label in any case', () => {
    it('should not offer to create it', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('combobox', { name: /add/i }));
      await user.type(
        await screen.findByPlaceholderText('Change categories...'),
        'clothes'
      );

      expect(
        screen.queryByRole('option', { name: /create new/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('when a new name is created without an icon set', () => {
    it('should create it straight away and select it', async () => {
      const { user, onChange, onCreate } = setup({ value: ['1'] });

      await user.click(screen.getByRole('combobox', { name: 'Add category' }));
      await user.type(
        await screen.findByPlaceholderText('Change categories...'),
        '  Toys '
      );
      await user.click(
        screen.getByRole('option', { name: /create new category: “Toys”/i })
      );

      expect(onCreate).toHaveBeenCalledWith({ name: 'Toys', icon: null });
      await waitFor(() => expect(onChange).toHaveBeenCalledWith(['1', 'new']));
    });
  });

  describe('when a new name is created with an icon set', () => {
    const createWithIconStep = async () => {
      const result = setup({ iconSet });
      await result.user.click(screen.getByRole('combobox', { name: /add/i }));
      await result.user.type(
        await screen.findByPlaceholderText('Change categories...'),
        'Toys'
      );
      await result.user.click(
        screen.getByRole('option', { name: /create new category/i })
      );
      return result;
    };

    it('should ask for an icon before creating', async () => {
      const { onCreate } = await createWithIconStep();

      expect(screen.getByText('Icon for “Toys”')).toBeInTheDocument();
      expect(onCreate).not.toHaveBeenCalled();
    });

    it('should create it with the picked icon', async () => {
      const { user, onCreate, onChange } = await createWithIconStep();

      await user.click(screen.getByRole('button', { name: 'moon' }));

      expect(onCreate).toHaveBeenCalledWith({ name: 'Toys', icon: 'moon' });
      await waitFor(() => expect(onChange).toHaveBeenCalledWith(['new']));
    });

    it('should create it without an icon when skipped', async () => {
      const { user, onCreate } = await createWithIconStep();

      await user.click(screen.getByRole('button', { name: 'Skip' }));

      expect(onCreate).toHaveBeenCalledWith({ name: 'Toys', icon: null });
    });

    it('should return to the search when going back', async () => {
      const { user } = await createWithIconStep();

      await user.click(screen.getByRole('button', { name: 'Back' }));

      expect(
        screen.getByPlaceholderText('Change categories...')
      ).toBeInTheDocument();
    });
  });

  describe('when creating fails', () => {
    it('should show the error and keep the value', async () => {
      const { user, onChange } = setup({
        onCreate: vi.fn().mockRejectedValue(new Error('Already exists')),
      });

      await user.click(screen.getByRole('combobox', { name: /add/i }));
      await user.type(
        await screen.findByPlaceholderText('Change categories...'),
        'Toys'
      );
      await user.click(
        screen.getByRole('option', { name: /create new category/i })
      );

      expect(await screen.findByText('Already exists')).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});

describe('CreateLabel', () => {
  const setup = (
    props: Partial<React.ComponentProps<typeof CreateLabel>> = {}
  ) => {
    const onCreate = vi.fn().mockResolvedValue({ id: 'new' });
    render(<CreateLabel onCreate={onCreate} noun={noun} {...props} />);
    return { user: userEvent.setup(), onCreate };
  };

  const startTyping = async (
    user: ReturnType<typeof userEvent.setup>,
    text: string
  ) => {
    await user.click(screen.getByRole('button', { name: /add category/i }));
    await user.type(
      screen.getByRole('textbox', { name: 'Category name' }),
      text
    );
  };

  describe('when idle', () => {
    it('should show an add button named after the noun', () => {
      setup();

      expect(
        screen.getByRole('button', { name: /add category/i })
      ).toBeInTheDocument();
    });
  });

  describe('when the add button is clicked', () => {
    it('should turn into a focused name input', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('button', { name: /add category/i }));

      expect(
        screen.getByRole('textbox', { name: 'Category name' })
      ).toHaveFocus();
    });
  });

  describe('when Enter is pressed with a name and no icon set', () => {
    it('should create the trimmed name and return to idle', async () => {
      const { user, onCreate } = setup();

      await startTyping(user, '  Toys {Enter}');

      expect(onCreate).toHaveBeenCalledWith({ name: 'Toys', icon: null });
      expect(
        await screen.findByRole('button', { name: /add category/i })
      ).toBeInTheDocument();
    });
  });

  describe('when Enter is pressed with a blank name', () => {
    it('should not create anything', async () => {
      const { user, onCreate } = setup();

      await startTyping(user, '   {Enter}');

      expect(onCreate).not.toHaveBeenCalled();
    });
  });

  describe('when Enter is pressed with an icon set', () => {
    it('should ask for an icon and create with the picked one', async () => {
      const { user, onCreate } = setup({ iconSet });

      await startTyping(user, 'Toys{Enter}');
      expect(onCreate).not.toHaveBeenCalled();
      await user.click(await screen.findByRole('button', { name: 'star' }));

      expect(onCreate).toHaveBeenCalledWith({ name: 'Toys', icon: 'star' });
    });
  });

  describe('when Escape is pressed', () => {
    it('should discard the name and return to idle', async () => {
      const { user, onCreate } = setup();

      await startTyping(user, 'Toys{Escape}');

      expect(onCreate).not.toHaveBeenCalled();
      expect(
        screen.getByRole('button', { name: /add category/i })
      ).toBeInTheDocument();
    });
  });

  describe('when the empty input loses focus', () => {
    it('should return to idle', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('button', { name: /add category/i }));
      await user.click(document.body);

      expect(
        screen.getByRole('button', { name: /add category/i })
      ).toBeInTheDocument();
    });
  });

  describe('when creating fails', () => {
    it('should show the error and keep the name', async () => {
      const { user } = setup({
        onCreate: vi.fn().mockRejectedValue(new Error('Already exists')),
      });

      await startTyping(user, 'Toys{Enter}');

      expect(await screen.findByText('Already exists')).toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: 'Category name' })
      ).toHaveValue('Toys');
    });
  });
});
