import { vi } from 'vitest';

/**
 * Helper function to create a typed mock function
 * @param implementation Optional default implementation
 * @returns A vitest mock function with the correct type
 */
export function createMockFn<T extends (...args: any[]) => any>(
  implementation?: T
): T & ReturnType<typeof vi.fn> {
  return implementation 
    ? vi.fn().mockImplementation(implementation) 
    : vi.fn() as any;
}

/**
 * Creates a mock hook with the correct types
 * @param defaultValue The default return value for the hook
 * @returns A vitest mock function that returns the provided value
 */
export function createMockHook<T>(defaultValue: T): () => T & ReturnType<typeof vi.fn> {
  return () => vi.fn().mockReturnValue(defaultValue) as any;
}

/**
 * Type for API responses in tests
 */
export interface MockApiResponse<T = any> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  response?: T;
  error?: Error;
}

/**
 * Utility function to reset all mocks
 * @param mocks Array of mock functions to reset
 */
export function resetAllMocks(mocks: ReturnType<typeof vi.fn>[]) {
  mocks.forEach(mock => mock.mockReset());
} 