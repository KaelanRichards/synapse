import React from 'react';
import { NoteServiceError } from '@/features/notes/services/noteService';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  private getErrorMessage(error: Error): string {
    if (error instanceof NoteServiceError) {
      switch (error.code) {
        case 'UNAUTHORIZED':
          return 'Please sign in to continue';
        case 'NOT_FOUND':
          return 'Note not found';
        case 'VALIDATION_ERROR':
          return 'Invalid input. Please check your data.';
        case 'DATABASE_ERROR':
          return 'Database operation failed. Please try again.';
        case 'UNKNOWN_ERROR':
          return 'An unexpected error occurred';
        default:
          return 'An unexpected error occurred';
      }
    }
    return error.message || 'An unexpected error occurred';
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center p-4">
          <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
          <p className="text-sm text-gray-600 mb-4">
            {this.state.error
              ? this.getErrorMessage(this.state.error)
              : 'Unknown error'}
          </p>
          {this.props.onReset && (
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onReset?.();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Try again
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
