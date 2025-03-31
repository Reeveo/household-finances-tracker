import { QueryClient } from '@tanstack/react-query';
import { getSession } from './supabase-client';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Constructs the API request with proper authentication
 */
export async function apiRequest<T = any>(
  endpoint: string,
  { params, ...customConfig }: FetchOptions = {}
): Promise<T> {
  // Get the current session from Supabase
  const session = await getSession();
  
  // Prepare headers with auth token if session exists
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  // Build the URL with query parameters if they exist
  const searchParams = params ? new URLSearchParams(params).toString() : '';
  const url = `${endpoint}${searchParams ? `?${searchParams}` : ''}`;
  
  // Configure the request
  const config: RequestInit = {
    method: customConfig.method || 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };
  
  // Add request body if data is provided
  if (customConfig.body) {
    config.body = JSON.stringify(customConfig.body);
  }
  
  // Make the request
  try {
    const response = await fetch(url, config);
    
    // Handle unauthorized errors
    if (response.status === 401) {
      // Session might be expired
      throw new Error('Unauthorized: Please login again');
    }
    
    // Parse the response
    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      return Promise.reject(data);
    }
  } catch (error) {
    return Promise.reject(error);
  }
}

/**
 * Creates a query function for react-query
 */
export function getQueryFn<T = any>(
  endpoint: string,
  options: FetchOptions = {},
  unauthorizedBehavior: 'throw' | 'return' = 'throw'
) {
  return async (): Promise<T> => {
    try {
      return await apiRequest<T>(endpoint, options);
    } catch (error: any) {
      if (error.message?.includes('Unauthorized') && unauthorizedBehavior === 'return') {
        return null as any;
      }
      throw error;
    }
  };
}

/**
 * Configure and export the query client
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.message?.includes('Unauthorized')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});
