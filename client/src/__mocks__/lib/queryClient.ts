import { vi } from 'vitest';

// Mock queryClient with all required methods
export const queryClient = {
  setQueryData: vi.fn(),
  invalidateQueries: vi.fn(),
  getQueryData: vi.fn(),
  refetchQueries: vi.fn(),
  clear: vi.fn(),
};

// Mock apiRequest function
export const apiRequest = vi.fn().mockImplementation(async (method, url, data) => {
  return {
    ok: true,
    json: async () => ({}),
    text: async () => '',
    status: 200,
    statusText: 'OK',
  };
});

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
}; 