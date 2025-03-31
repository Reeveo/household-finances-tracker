import { vi } from 'vitest';

/**
 * Creates a mock hook for useIsMobile
 * @param isMobile Default value for the mobile state
 * @returns A mock function that returns the isMobile value
 */
export const createMockIsMobileHook = (isMobile = false) => {
  return vi.fn().mockReturnValue(isMobile);
};

// Default export for auto-mocking
const useIsMobile = createMockIsMobileHook();

export default { useIsMobile }; 