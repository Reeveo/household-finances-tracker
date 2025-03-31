import { vi } from 'vitest';

// Mock queryClient with all required methods
export const queryClient = {
  setQueryData: vi.fn(),
  invalidateQueries: vi.fn(),
  getQueryData: vi.fn(),
  refetchQueries: vi.fn(),
  clear: vi.fn(),
};

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

/**
 * Mock implementation of the apiRequest function
 */
export const apiRequest = vi.fn().mockImplementation(
  <T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> => {
    return Promise.resolve({} as T);
  }
);

/**
 * Creates a mock API request function with predefined responses
 * @param mockResponses Map of endpoints to their responses
 * @returns Mock function that returns responses based on the endpoint
 */
export const createMockApiRequest = <T = any>(
  mockResponses: Record<string, T> = {}
) => {
  return vi.fn().mockImplementation(
    (endpoint: string, options: ApiRequestOptions = {}): Promise<T> => {
      // Check if we have a predefined response for this endpoint
      if (mockResponses[endpoint]) {
        return Promise.resolve(mockResponses[endpoint]);
      }
      
      // Return empty object by default
      return Promise.resolve({} as T);
    }
  );
};

/**
 * Configure the mock API to return an error for a specific endpoint
 * @param mockApiRequest The mock API function
 * @param endpoint The endpoint that should return an error
 * @param error The error to return
 */
export const mockApiError = (
  mockApiRequest: ReturnType<typeof vi.fn>,
  endpoint: string,
  error: Error
) => {
  mockApiRequest.mockImplementationOnce(
    (path: string, options: ApiRequestOptions = {}) => {
      if (path === endpoint) {
        return Promise.reject(error);
      }
      return Promise.resolve({});
    }
  );
};

// Mock getQueryFn with options for handling 401 responses
export const getQueryFn = vi.fn().mockImplementation(({ on401 } = { on401: "throw" }) => {
  return async ({ queryKey }: { queryKey: string[] }) => {
    // Default implementation returns null for user queries
    if (queryKey[0] === '/api/user') {
      return null;
    }
    return {};
  };
});

// Default export for modules that import the entire file
export default {
  queryClient,
  apiRequest,
  getQueryFn,
  createMockApiRequest,
  mockApiError,
}; 