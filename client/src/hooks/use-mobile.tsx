import * as React from "react"

export const MOBILE_BREAKPOINT = 768

export function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Handle case where window doesn't exist (SSR) or matchMedia not available (tests)
    if (typeof window === 'undefined') return false;
    if (typeof window.matchMedia !== 'function') return false;
    
    // Initial state based on current viewport width
    return window.innerWidth < breakpoint;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined; // No cleanup needed if not in browser
    }
    
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    
    const onChange = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Set initial state
    setIsMobile(mql.matches);
    
    // Use modern event listener
    mql.addEventListener("change", onChange);
    
    // Cleanup
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
}
