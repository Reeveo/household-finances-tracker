import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useIsMobile', () => {
  // Store original window.matchMedia
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    // Store the original implementation before tests
    originalMatchMedia = window.matchMedia;
    
    // Mock window.matchMedia function
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    // Restore original function after tests
    window.matchMedia = originalMatchMedia;
  });

  it('returns false for non-mobile screen by default', () => {
    // Set the mock to return non-mobile (false)
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as MediaQueryList));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true for mobile screen sizes', () => {
    // Set the mock to return mobile (true)
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as MediaQueryList));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('updates when the screen size changes', () => {
    // Create a mock for MediaQueryList that allows triggering event listeners
    let listeners: Array<(e: MediaQueryListEvent) => void> = [];
    
    const mediaQueryList = {
      matches: false,
      addEventListener: vi.fn((event, listener) => {
        listeners.push(listener);
      }),
      removeEventListener: vi.fn((event, listener) => {
        listeners = listeners.filter(l => l !== listener);
      }),
    };

    window.matchMedia = vi.fn().mockImplementation(() => mediaQueryList);

    const { result } = renderHook(() => useIsMobile());
    
    // Initial state should be false (non-mobile)
    expect(result.current).toBe(false);

    // Simulate a screen resize to mobile
    act(() => {
      // Update the matches value
      Object.defineProperty(mediaQueryList, 'matches', { value: true });
      
      // Trigger the change event
      listeners.forEach(listener => {
        listener({ matches: true } as MediaQueryListEvent);
      });
    });

    // After resize, should return true (mobile)
    expect(result.current).toBe(true);
  });

  it('properly cleans up event listeners on unmount', () => {
    // Create mockable implementation
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();

    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener,
      removeEventListener,
    } as unknown as MediaQueryList));

    const { unmount } = renderHook(() => useIsMobile());
    
    // Verify addEventListener was called when the hook mounted
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    
    // Unmount the hook
    unmount();
    
    // Verify removeEventListener was called when unmounting
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('handles custom breakpoint when provided', () => {
    // Create a setup that records what query is used
    let lastQuery = '';
    
    window.matchMedia = vi.fn().mockImplementation((query) => {
      lastQuery = query;
      return {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as MediaQueryList;
    });

    // Default breakpoint
    renderHook(() => useIsMobile());
    expect(lastQuery).toBe('(max-width: 768px)');
    
    // Custom breakpoint
    renderHook(() => useIsMobile(480));
    expect(lastQuery).toBe('(max-width: 480px)');
  });

  it('handles the case where matchMedia is not available', () => {
    // Simulate a browser without matchMedia support
    window.matchMedia = undefined as any;
    
    const { result } = renderHook(() => useIsMobile());
    
    // Should default to false when matchMedia is unavailable
    expect(result.current).toBe(false);
  });
}); 