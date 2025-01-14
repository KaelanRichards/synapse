import { useCallback } from 'react';
import { toast as showToast } from '@/components/ui/Toast';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export function useToast() {
  const toast = useCallback(
    ({
      title,
      description,
      variant = 'default',
      duration = 3000,
    }: ToastOptions) => {
      showToast({
        title,
        description,
        variant,
        duration,
      });
    },
    []
  );

  return { toast };
}
