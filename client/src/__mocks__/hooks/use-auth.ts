import { vi } from 'vitest';
import { createMockFn } from '../mockUtils';

export type MockAuthUser = {
  id: number;
  name: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  [key: string]: any;
};

export interface MockAuthState {
  user: MockAuthUser | null;
  isLoading: boolean;
  loginMutation: {
    mutate: ReturnType<typeof vi.fn>;
    isSuccess: boolean;
    isError: boolean;
    error: any;
  };
  logoutMutation: {
    mutate: ReturnType<typeof vi.fn>;
    isSuccess: boolean;
  };
}

const defaultUser: MockAuthUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashedpassword',
  createdAt: new Date()
};

export const createMockAuthHook = (initialState?: Partial<MockAuthState>) => {
  const defaultState: MockAuthState = {
    user: null,
    isLoading: false,
    loginMutation: {
      mutate: createMockFn((credentials: any) => Promise.resolve(defaultUser)),
      isSuccess: false,
      isError: false,
      error: null
    },
    logoutMutation: {
      mutate: createMockFn(() => Promise.resolve()),
      isSuccess: false
    }
  };

  const mockState = { ...defaultState, ...initialState };
  return vi.fn().mockReturnValue(mockState);
};

// Default export for auto-mocking
const useAuth = createMockAuthHook({
  user: defaultUser,
  loginMutation: {
    mutate: createMockFn((credentials: any) => Promise.resolve(defaultUser)),
    isSuccess: true,
    isError: false,
    error: null
  },
  logoutMutation: {
    mutate: createMockFn(() => Promise.resolve()),
    isSuccess: true
  }
});

export default useAuth; 