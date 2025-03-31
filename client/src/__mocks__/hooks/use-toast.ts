import { vi } from 'vitest';
import { createMockFn } from '../mockUtils';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface MockToastState {
  toast: ReturnType<typeof vi.fn>;
  dismiss: ReturnType<typeof vi.fn>;
}

export const createMockToastHook = (initialState?: Partial<MockToastState>) => {
  const defaultState: MockToastState = {
    toast: createMockFn((options: ToastOptions) => {
      // Return a unique ID for each toast
      return Date.now().toString();
    }),
    dismiss: createMockFn((toastId?: string) => {
      // Mock dismissing a toast
      return;
    })
  };

  const mockState = { ...defaultState, ...initialState };
  return vi.fn().mockReturnValue(mockState);
};

// Default export for auto-mocking
const useToast = createMockToastHook();

export default { useToast }; 