import React from 'react';

interface LoadingProps {
  message?: string;
  className?: string;
  variant?: 'default' | 'skeleton';
}

export const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  className = '',
  variant = 'default',
}) => {
  if (variant === 'skeleton') {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-accent-100 dark:bg-accent-800 rounded w-3/4"></div>
            <div className="h-16 bg-accent-50 dark:bg-accent-900 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center h-full text-accent-500 dark:text-accent-400 ${className}`}
    >
      <div className="flex items-center space-x-2">
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Loading;
