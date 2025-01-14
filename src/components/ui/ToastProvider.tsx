import React, { useEffect, useState } from 'react';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProviderPrimitive,
  ToastTitle,
  ToastViewport,
  setToastFunction,
} from './Toast';

interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    setToastFunction(({ title, description, variant, duration }) => {
      const id = Math.random().toString(36).slice(2);
      setToasts(prev => [
        ...prev,
        { id, title, description, variant, duration },
      ]);

      if (duration !== 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, duration || 3000);
      }
    });

    return () => setToastFunction(() => {});
  }, []);

  return (
    <ToastProviderPrimitive>
      {children}
      {toasts.map(({ id, title, description, variant, duration }) => (
        <Toast key={id} variant={variant}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose
            onClick={() => setToasts(prev => prev.filter(t => t.id !== id))}
          />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProviderPrimitive>
  );
}
