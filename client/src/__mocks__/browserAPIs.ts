import { vi } from 'vitest';

/**
 * Setup mock for window.matchMedia
 * This can be imported in test files or setup files
 */
export function setupMatchMediaMock(defaultMatches = false) {
  // Store original if it exists
  const originalMatchMedia = window.matchMedia;
  
  // Create mock implementation
  window.matchMedia = vi.fn().mockImplementation((query) => {
    return {
      matches: defaultMatches,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
  
  // Return cleanup function
  return () => {
    window.matchMedia = originalMatchMedia;
  };
}

/**
 * Setup mock for localStorage
 */
export function setupLocalStorageMock() {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      key: vi.fn((index: number) => Object.keys(store)[index] || null),
      length: 0,
    };
  })();
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  
  // Return cleanup function
  return () => {
    delete (window as any).localStorage;
  };
}

/**
 * Setup mock for ResizeObserver
 */
export function setupResizeObserverMock() {
  class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  
  window.ResizeObserver = ResizeObserverMock as any;
  
  // Return cleanup function
  return () => {
    delete (window as any).ResizeObserver;
  };
}

// Export all setup functions
export default {
  setupMatchMediaMock,
  setupLocalStorageMock,
  setupResizeObserverMock,
}; 