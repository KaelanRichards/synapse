import React from 'react';
import type { EditorState } from '../types';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class EditorErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log the error to an error reporting service
    console.error('Editor Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
            Editor Error
          </h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">
            <p>An error occurred in the editor. Here's what you can try:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Refresh the page</li>
              <li>Clear your browser cache</li>
              <li>Try again in a few minutes</li>
            </ul>
          </div>
          <div className="mt-4">
            <button
              onClick={this.handleReset}
              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4">
              <details className="text-sm text-red-700 dark:text-red-300">
                <summary className="cursor-pointer">Error Details</summary>
                <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/40 rounded overflow-auto">
                  {this.state.error?.toString()}
                  {'\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
