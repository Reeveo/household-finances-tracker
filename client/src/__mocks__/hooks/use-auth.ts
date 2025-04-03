import { vi } from 'vitest';
import { createMockFn } from '../mockUtils';

export type MockAuthUser = {
  id: number;
  name: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  role: string;
  [key: string]: any;
};

export interface MockAuthState {
  user: MockAuthUser | null;
  isLoading: boolean;
  error?: any;
  isAuthenticated?: boolean;
  loginMutation: {
    mutate: ReturnType<typeof vi.fn>;
    isSuccess: boolean;
    isError: boolean;
    error: any;
    isPending?: boolean;
  };
  logoutMutation: {
    mutate: ReturnType<typeof vi.fn>;
    isSuccess: boolean;
    isError?: boolean;
    error?: any;
    isPending?: boolean;
  };
  registerMutation?: {
    mutate: ReturnType<typeof vi.fn>;
    isSuccess: boolean;
    isError?: boolean;
    error?: any;
    isPending?: boolean;
  };
}

const defaultUser: MockAuthUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashedpassword',
  createdAt: new Date(),
  role: 'user'
};

export const createMockAuthHook = (initialState?: Partial<MockAuthState>) => {
  const defaultState: MockAuthState = {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    loginMutation: {
      mutate: createMockFn((credentials: any) => Promise.resolve(defaultUser)),
      isSuccess: false,
      isError: false,
      error: null,
      isPending: false
    },
    logoutMutation: {
      mutate: createMockFn(() => Promise.resolve()),
      isSuccess: false,
      isError: false,
      error: null,
      isPending: false
    },
    registerMutation: {
      mutate: createMockFn((userData: any) => Promise.resolve(defaultUser)),
      isSuccess: false,
      isError: false,
      error: null,
      isPending: false
    }
  };

  const mockState = { ...defaultState, ...initialState };
  
  // Automatically set isAuthenticated based on user presence if not explicitly provided
  if (initialState?.user && initialState?.isAuthenticated === undefined) {
    mockState.isAuthenticated = true;
  }
  
  return vi.fn().mockReturnValue(mockState);
};

// Default export for auto-mocking
const useAuth = createMockAuthHook({
  user: defaultUser,
  isAuthenticated: true,
  loginMutation: {
    mutate: createMockFn((credentials: any) => Promise.resolve(defaultUser)),
    isSuccess: true,
    isError: false,
    error: null,
    isPending: false
  },
  logoutMutation: {
    mutate: createMockFn(() => Promise.resolve()),
    isSuccess: true,
    isError: false,
    error: null,
    isPending: false
  },
  registerMutation: {
    mutate: createMockFn((userData: any) => Promise.resolve(defaultUser)),
    isSuccess: true,
    isError: false,
    error: null,
    isPending: false
  }
});

export default useAuth; 