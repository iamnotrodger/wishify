import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';

// Without vitest globals, testing-library can't register its own cleanup.
afterEach(cleanup);

beforeEach(() => {
  fakeBrowser.reset();
});

// jsdom lacks the layout APIs that Radix popovers and cmdk call.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
Element.prototype.scrollIntoView ??= () => {};
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.releasePointerCapture ??= () => {};
