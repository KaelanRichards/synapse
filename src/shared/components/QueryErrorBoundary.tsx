import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from './ErrorBoundary';
import { ReactNode } from 'react';

interface QueryErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function QueryErrorBoundary({
  children,
  fallback,
}: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={
            fallback ?? (
              <div className="flex flex-col items-center justify-center p-4">
                <h3 className="text-lg font-medium mb-2">
                  Something went wrong
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  There was an error loading the data
                </p>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Try again
                </button>
              </div>
            )
          }
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
