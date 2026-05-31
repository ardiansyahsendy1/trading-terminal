import '@testing-library/jest-dom/vitest';

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: TestResizeObserver,
});

Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  value: TestResizeObserver,
});
