import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

export type ShowToastParams = Omit<Toast, 'id'>;

interface ToastContextType {
  toasts: Toast[];
  showToast: (params: ShowToastParams) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = ({ title, description, type, duration = 5000 }: ShowToastParams) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast = { id, title, description, type, duration };
    
    setToasts((prevToasts) => [...prevToasts, toast]);
    
    if (duration !== Infinity) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
    
    return id;
  };

  const hideToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer() {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded shadow-md max-w-md flex items-start gap-3 ${getToastColorClass(
            toast.type
          )}`}
        >
          <div className="flex-1">
            <h3 className="font-medium">{toast.title}</h3>
            {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
          </div>
          <button
            onClick={() => hideToast(toast.id)}
            className="text-gray-700 hover:text-gray-900"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function getToastColorClass(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'info':
    default:
      return 'bg-blue-100 text-blue-800';
  }
} 