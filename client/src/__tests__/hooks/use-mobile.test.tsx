import { renderHook, act } from '@testing-library/react';
import { useIsMobile, MOBILE_BREAKPOINT } from '@/hooks/use-mobile';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupMatchMediaMock } from '../../__mocks__/browserAPIs';

describe('useIsMobile', () => {
  // Clean up function for mock
  let cleanupMock: () => void;

  beforeEach(() => {
    // Set up mock with default state (non-mobile)
    cleanupMock = setupMatchMediaMock(false);
  });

  afterEach(() => {
    cleanupMock();
    vi.clearAllMocks();
  });

  it('returns false for non-mobile screen by default', () => {
    // Set up mock to return false for matches
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList));

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true for mobile screen sizes', () => {
    // Set up mock to return true for matches 
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList));

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

    // Also mock window.innerWidth for the onChange handler
    Object.defineProperty(window, 'innerWidth', { 
      value: MOBILE_BREAKPOINT + 100, // Desktop size
      writable: true 
    });

    const { result } = renderHook(() => useIsMobile());
    
    // Initial state should be false (non-mobile)
    expect(result.current).toBe(false);

    // Simulate a screen resize to mobile
    act(() => {
      // Update the inner width
      Object.defineProperty(window, 'innerWidth', { value: MOBILE_BREAKPOINT - 100 });
      
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
      } as unknown as MediaQueryList;
    });

    // Default breakpoint
    renderHook(() => useIsMobile());
    expect(lastQuery).toBe(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Custom breakpoint
    const customBreakpoint = 480;
    renderHook(() => useIsMobile(customBreakpoint));
    expect(lastQuery).toBe(`(max-width: ${customBreakpoint - 1}px)`);
  });

  it('handles the case where matchMedia is not available', () => {
    // Simulate a browser without matchMedia support
    const originalMatchMedia = window.matchMedia;
    (window as any).matchMedia = undefined;

    // Run the hook
    const { result } = renderHook(() => useIsMobile());
    
    // Should default to false when matchMedia is unavailable
    expect(result.current).toBe(false);

    // Restore original
    window.matchMedia = originalMatchMedia;
  });
}); 