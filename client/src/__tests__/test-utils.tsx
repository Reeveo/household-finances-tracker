import React, { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

// Import our mock creators
import { createMockAuthHook, MockAuthState } from '../__mocks__/hooks/use-auth';
import { createMockToastHook } from '../__mocks__/hooks/use-toast';
import { createMockIsMobileHook } from '../__mocks__/hooks/use-mobile';
import { createMockUseMutation, createMockUseQuery, createMockQueryClient } from '../__mocks__/tanstack-query';
import { MockApiResponse } from '../__mocks__/mockUtils';

// Import the actual hooks (which will be mocked)
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Include jest-dom matchers
import '@testing-library/jest-dom';

vi.mock('@/hooks/use-auth');
vi.mock('@/hooks/use-toast');
vi.mock('@/hooks/use-mobile');
vi.mock('@tanstack/react-query');
vi.mock('@/lib/queryClient');

/**
 * Helper function to set up all mocks for a test
 */
export interface SetupMocksOptions {
  authState?: Partial<MockAuthState>;
  isMobile?: boolean;
  apiResponses?: MockApiResponse[];
  queryData?: Record<string, any>;
}

export const setupMocks = (options: SetupMocksOptions = {}) => {
  const {
    authState,
    isMobile = false,
    apiResponses = [],
    queryData = {},
  } = options;

  // Setup auth mock
  if (authState) {
    (useAuth as any).mockImplementation(createMockAuthHook(authState));
  }

  // Setup isMobile mock
  (useIsMobile as any).mockImplementation(createMockIsMobileHook(isMobile));

  // Setup toast mock
  (useToast as any).mockImplementation(createMockToastHook());

  // Setup API responses
  apiResponses.forEach(({ endpoint, method = 'GET', response, error }) => {
    if (error) {
      (apiRequest as any).mockRejectedValueOnce(error);
    } else {
      (apiRequest as any).mockResolvedValueOnce(response);
    }
  });

  // Setup query data
  Object.entries(queryData).forEach(([queryKey, data]) => {
    (useQuery as any).mockImplementation(
      createMockUseQuery(data, false, false, null)
    );
  });

  // Return cleanup function
  return () => {
    vi.resetAllMocks();
  };
};

/**
 * Custom render function with providers
 */
export const renderWithProviders = (ui: ReactElement) => {
  return render(ui);
};

/**
 * Custom test helpers
 */
export const testHelpers = {
  getByTestClass: (container: HTMLElement, className: string) => {
    const elements = container.getElementsByClassName(className);
    if (elements.length === 0) {
      throw new Error(`No elements found with class: ${className}`);
    }
    return elements[0];
  },
  getAllByTestClass: (container: HTMLElement, className: string) => {
    const elements = container.getElementsByClassName(className);
    if (elements.length === 0) {
      throw new Error(`No elements found with class: ${className}`);
    }
    return Array.from(elements);
  },
};