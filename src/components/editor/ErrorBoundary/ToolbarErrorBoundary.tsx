import React from 'react';

interface Props {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ToolbarErrorBoundary extends React.Component<Props, State> {
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

    this.props.onError?.(error, errorInfo);
    console.error('Toolbar Error:', error, errorInfo);
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
      return (
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-4 py-2 bg-orange-50 dark:bg-orange-900/20">
          <div className="flex items-center space-x-2 text-sm text-orange-800 dark:text-orange-200">
            <span>Toolbar Error</span>
            <button
              onClick={this.handleReset}
              className="px-2 py-1 text-xs font-medium bg-orange-100 hover:bg-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:bg-orange-800 dark:hover:bg-orange-700"
            >
              Reset Toolbar
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-orange-700 dark:text-orange-300">
              <summary className="cursor-pointer">Error Details</summary>
              <pre className="mt-1 p-2 bg-orange-100 dark:bg-orange-900/40 rounded overflow-auto text-[10px]">
                {this.state.error?.toString()}
                {'\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
