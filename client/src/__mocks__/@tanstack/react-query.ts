import { vi } from 'vitest';
import React from 'react';

// Mock mutation functions
const mockMutate = vi.fn();
export const useMutation = vi.fn().mockReturnValue({
  mutate: mockMutate,
  isLoading: false,
  isError: false,
  isSuccess: false,
});

// Mock query functions
export const useQuery = vi.fn().mockReturnValue({
  data: {},
  isLoading: false,
  isError: false,
});

// Mock query client 
export class QueryClient {
  defaultOptions = {};
  mount = vi.fn();
  unmount = vi.fn();
  isFetching = vi.fn();
  getDefaultOptions = vi.fn();
  setDefaultOptions = vi.fn();
  getQueryCache = vi.fn();
  getMutationCache = vi.fn();
  getQueryData = vi.fn();
  setQueryData = vi.fn();
  getQueryState = vi.fn();
  removeQueries = vi.fn();
  resetQueries = vi.fn();
  cancelQueries = vi.fn();
  invalidateQueries = vi.fn();
  refetchQueries = vi.fn();
  fetchQuery = vi.fn();
  prefetchQuery = vi.fn();
  getQueriesData = vi.fn();
  setQueriesData = vi.fn();
  getQueriesState = vi.fn();
  suspense = vi.fn();
  executeMutation = vi.fn();
}

// Mock query client provider
export const QueryClientProvider = ({ children }: { children: React.ReactNode }) => {
  return React.createElement('div', { 'data-testid': 'mock-query-provider' }, children);
};

// Mock useQueryClient
export const useQueryClient = vi.fn(() => ({
  setQueryData: vi.fn(),
  invalidateQueries: vi.fn(),
})); 