import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface DebouncedPromiseFunction<
  T extends (...args: any[]) => Promise<any>,
> {
  (...args: Parameters<T>): Promise<ReturnType<T>>;
  cancel: () => void;
  flush: () => Promise<ReturnType<T> | undefined>;
}

export function debouncedPromise<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onError?: (error: Error, attempt: number) => void;
  } = {}
): DebouncedPromiseFunction<T> {
  const { maxRetries = 3, retryDelay = 1000, onError = () => {} } = options;

  let timeout: NodeJS.Timeout | null = null;
  let latestResolve: ((value: any) => void) | null = null;
  let latestReject: ((reason?: any) => void) | null = null;
  let latestArgs: Parameters<T> | null = null;

  const executeFunction = async (
    args: Parameters<T>
  ): Promise<ReturnType<T>> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await func(...args);
      } catch (error) {
        if (attempt === maxRetries) throw error;
        onError(error as Error, attempt);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
    throw new Error('Max retries exceeded');
  };

  const debouncedFn = (...args: Parameters<T>): Promise<ReturnType<T>> => {
    latestArgs = args;

    return new Promise((resolve, reject) => {
      latestResolve = resolve;
      latestReject = reject;

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(async () => {
        if (!latestArgs) return;

        try {
          const result = await executeFunction(latestArgs);
          latestResolve?.(result);
        } catch (error) {
          latestReject?.(error);
        } finally {
          timeout = null;
          latestArgs = null;
          latestResolve = null;
          latestReject = null;
        }
      }, wait);
    });
  };

  debouncedFn.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    latestReject?.(new Error('Debounced function cancelled'));
    latestArgs = null;
    latestResolve = null;
    latestReject = null;
  };

  debouncedFn.flush = async () => {
    if (!latestArgs) return undefined;

    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }

    try {
      return await executeFunction(latestArgs);
    } finally {
      latestArgs = null;
      latestResolve = null;
      latestReject = null;
    }
  };

  return debouncedFn;
}
