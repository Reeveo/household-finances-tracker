import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useIsMobile', () => {
  // Store original window.matchMedia
  let originalMatchMedia: typeof window.matchMedia;
  let originalInnerWidth: number;

  beforeEach(() => {
    // Store the original values
    originalMatchMedia = window.matchMedia;
    originalInnerWidth = window.innerWidth;
    
    // Mock window.matchMedia function
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(max-width: 768px)' && window.innerWidth <= 768,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    // Restore original values
    window.matchMedia = originalMatchMedia;
    window.innerWidth = originalInnerWidth;
  });

  it('returns false for non-mobile screen by default', () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true for mobile screen sizes', () => {
    window.innerWidth = 767;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('updates when the screen size changes', () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      window.innerWidth = 767;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(true);
  });

  it('handles custom breakpoint when provided', () => {
    window.innerWidth = 500;
    const { result } = renderHook(() => useIsMobile(480));
    expect(result.current).toBe(false);

    act(() => {
      window.innerWidth = 400;
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current).toBe(true);
  });

  it('handles the case where matchMedia is not available', () => {
    // Simulate a browser without matchMedia support
    window.matchMedia = undefined as any;
    window.innerWidth = 1024;
    
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
}); 