import { vi } from 'vitest';
import { createMockFn } from '../mockUtils';

// Types for mutation hooks
export interface MutationOptions<TData = any, TError = any, TVariables = any> {
  onSuccess?: (data: TData, variables: TVariables, context?: unknown) => void | Promise<unknown>;
  onError?: (error: TError, variables: TVariables, context?: unknown) => void | Promise<unknown>;
  onSettled?: (data: TData | undefined, error: TError | undefined, variables: TVariables, context?: unknown) => void | Promise<unknown>;
  onMutate?: (variables: TVariables) => Promise<unknown> | unknown;
}

export interface MockMutationResult<TData = any, TError = any, TVariables = any> {
  data?: TData;
  error?: TError;
  variables?: TVariables;
  isLoading: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  status: 'idle' | 'pending' | 'success' | 'error';
  mutate: ReturnType<typeof vi.fn>;
  mutateAsync: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
}

// Types for query hooks
export interface QueryOptions<TData = any, TError = Error> {
  queryKey: unknown[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean | number | ((failureCount: number, error: TError) => boolean);
  retryDelay?: number | ((retryAttempt: number, error: TError) => number);
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onSettled?: (data: TData | undefined, error: TError | undefined) => void;
  select?: (data: TData) => unknown;
}

export interface MockQueryResult<TData = any, TError = Error> {
  data: TData | undefined;
  error: TError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  status: 'idle' | 'loading' | 'error' | 'success';
  isFetching: boolean;
  refetch: ReturnType<typeof vi.fn>;
}

/**
 * Creates a mock mutation result object
 */
export const createMockMutation = <TData = any, TError = any, TVariables = any>(
  options: Partial<MockMutationResult<TData, TError, TVariables>> = {}
): MockMutationResult<TData, TError, TVariables> => {
  const defaultState: MockMutationResult = {
    isLoading: false,
    isPending: false,
    isSuccess: false,
    isError: false,
    status: 'idle',
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue({}),
    reset: vi.fn(),
  };

  return { ...defaultState, ...options };
};

/**
 * Creates a mock useMutation hook
 */
export const createMockUseMutation = <TData = any, TError = any, TVariables = any>(
  defaultState: Partial<MockMutationResult<TData, TError, TVariables>> = {}
) => {
  return vi.fn().mockImplementation((options?: MutationOptions<TData, TError, TVariables>) => {
    const mutate = createMockFn((variables?: TVariables, context?: unknown) => {
      if (options?.onSuccess) {
        options.onSuccess({} as TData, variables as TVariables, context);
      }
    });
    
    const mutateAsync = createMockFn((variables?: TVariables, context?: unknown) => {
      return Promise.resolve({} as TData);
    });
    
    return createMockMutation<TData, TError, TVariables>({
      ...defaultState,
      mutate,
      mutateAsync,
    });
  });
};

/**
 * Creates a mock for useQuery hook
 */
export const createMockUseQuery = <TData = any, TError = Error>(
  defaultValue: TData | undefined = undefined,
  isLoading = false,
  isError = false,
  error: TError | null = null
) => {
  return vi.fn().mockImplementation((options: QueryOptions<TData, TError>) => {
    const mockResult: MockQueryResult<TData, TError> = {
      data: defaultValue,
      error,
      isLoading,
      isError,
      isSuccess: !isLoading && !isError && defaultValue !== undefined,
      status: isLoading ? 'loading' : isError ? 'error' : defaultValue !== undefined ? 'success' : 'idle',
      isFetching: isLoading,
      refetch: vi.fn().mockResolvedValue({ data: defaultValue }),
    };
    
    if (options.onSuccess && defaultValue !== undefined && !isLoading && !isError) {
      options.onSuccess(defaultValue);
    }
    
    if (options.onError && isError && error) {
      options.onError(error);
    }
    
    return mockResult;
  });
};

/**
 * Creates a mock for useQueryClient
 */
export const createMockQueryClient = () => {
  return vi.fn().mockReturnValue({
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
    fetchQuery: vi.fn().mockImplementation(() => Promise.resolve({})),
    prefetchQuery: vi.fn().mockImplementation(() => Promise.resolve()),
    resetQueries: vi.fn(),
    cancelQueries: vi.fn(),
    clear: vi.fn(),
  });
};

// Default exports for automatic mocking
export const useMutation = createMockUseMutation();
export const useQuery = createMockUseQuery();
export const useQueryClient = createMockQueryClient();

export default {
  useMutation,
  useQuery,
  useQueryClient,
}; 