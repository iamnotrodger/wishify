import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ImageInput } from '../image-input';

const GOOD_URL = 'https://cdn.test/shoe.jpg';
const BROKEN_URL = 'https://cdn.test/missing.jpg';

// jsdom never loads images, so loading succeeds only for GOOD_URL.
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  set src(url: string) {
    queueMicrotask(() => (url === GOOD_URL ? this.onload : this.onerror)?.());
  }
}

beforeEach(() => {
  vi.stubGlobal('Image', FakeImage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const setup = (
  props: Partial<React.ComponentProps<typeof ImageInput>> = {}
) => {
  const onChange = vi.fn();
  render(<ImageInput onChange={onChange} {...props} />);
  return { user: userEvent.setup(), onChange };
};

const submitLink = async (
  user: ReturnType<typeof userEvent.setup>,
  link: string
) => {
  await user.click(screen.getByRole('button', { name: /image$/i }));
  await user.type(
    await screen.findByRole('textbox', { name: 'Image link' }),
    link
  );
  await user.keyboard('{Enter}');
};

describe('ImageInput', () => {
  describe('when there is no image', () => {
    it('should offer to add one', () => {
      setup();

      expect(
        screen.getByRole('button', { name: 'Add image' })
      ).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('when there is an image', () => {
    it('should preview it and offer to change it', () => {
      const { container } = render(
        <ImageInput value={GOOD_URL} onChange={vi.fn()} />
      );

      expect(container.querySelector('img')).toHaveAttribute('src', GOOD_URL);
      expect(
        screen.getByRole('button', { name: 'Change image' })
      ).toBeInTheDocument();
    });
  });

  describe('when a link to a loadable image is submitted', () => {
    it('should report the link and close', async () => {
      const { user, onChange } = setup();

      await submitLink(user, `  ${GOOD_URL} `);

      await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith(GOOD_URL));
      expect(
        screen.queryByRole('textbox', { name: 'Image link' })
      ).not.toBeInTheDocument();
    });
  });

  describe('when the link is not http or https', () => {
    it('should show an error without loading it', async () => {
      const { user, onChange } = setup();

      await submitLink(user, 'ftp://cdn.test/shoe.jpg');

      expect(
        screen.getByText('Paste a link that starts with http or https')
      ).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('when the image fails to load', () => {
    it('should show an error and keep the popover open', async () => {
      const { user, onChange } = setup();

      await submitLink(user, BROKEN_URL);

      expect(
        await screen.findByText("Couldn't load an image from that link")
      ).toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: 'Image link' })
      ).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('when the link is empty', () => {
    it('should disable submitting', async () => {
      const { user } = setup();

      await user.click(screen.getByRole('button', { name: 'Add image' }));

      expect(await screen.findByRole('button', { name: 'Add' })).toBeDisabled();
    });
  });

  describe('when the image is removed', () => {
    it('should report null', async () => {
      const { user, onChange } = setup({ value: GOOD_URL });

      await user.click(screen.getByRole('button', { name: 'Change image' }));
      await user.click(
        await screen.findByRole('button', { name: 'Remove image' })
      );

      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe('when used inside another form', () => {
    it('should not submit the outer form', async () => {
      const onSubmit = vi.fn();
      const onChange = vi.fn();
      render(
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <ImageInput onChange={onChange} />
        </form>
      );
      const user = userEvent.setup();

      await submitLink(user, GOOD_URL);

      await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith(GOOD_URL));
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
