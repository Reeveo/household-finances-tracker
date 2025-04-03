import '@testing-library/jest-dom';
import { expect, vi, afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { setupMatchMediaMock, setupResizeObserverMock } from './__mocks__/browserAPIs';

// Add custom jest-dom matchers
expect.extend(matchers);

// Mock console.error and console.warn to keep output clean and fail on warnings/errors
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    // Only throw errors for React-related warnings
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (
      message.includes('Warning: ') &&
      (message.includes('React') || message.includes('component'))
    ) {
      throw new Error(args.join(' '));
    }
    originalConsoleError(...args);
  };

  console.warn = (...args: any[]) => {
    // Only throw errors for React-related warnings
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (
      message.includes('Warning: ') &&
      (message.includes('React') || message.includes('component'))
    ) {
      throw new Error(args.join(' '));
    }
    originalConsoleWarn(...args);
  };

  // Setup global mocks
  setupMatchMediaMock(false);
  setupResizeObserverMock();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock IntersectionObserver which isn't available in test environment
if (!window.IntersectionObserver) {
  class IntersectionObserverMock {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];
    
    constructor() {}
    
    disconnect() {
      return null;
    }
    
    observe() {
      return null;
    }
    
    takeRecords() {
      return [];
    }
    
    unobserve() {
      return null;
    }
  }
  
  window.IntersectionObserver = IntersectionObserverMock as any;
}

// Prevent matchMedia errors in tests
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
} 
