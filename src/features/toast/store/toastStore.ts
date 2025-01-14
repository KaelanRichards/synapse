import { ToastProps } from '@/features/toast/components/Toast';
import { create } from 'zustand';

interface Toast extends Omit<ToastProps, 'onClose'> {
  id: string;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<ToastProps, 'onClose'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>(set => ({
  toasts: [],
  addToast: toast => {
    const id = Math.random().toString(36).substring(2, 9);
    set(state => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    // Auto remove toast after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        set(state => ({
          toasts: state.toasts.filter(t => t.id !== id),
        }));
      }, toast.duration || 5000);
    }
  },
  removeToast: id =>
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id),
    })),
}));
