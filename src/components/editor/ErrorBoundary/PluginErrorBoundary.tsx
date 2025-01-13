import React from 'react';
import type { Plugin } from '../types/plugin';

interface Props {
  children: React.ReactNode;
  plugin: Plugin;
  onError?: (error: Error, errorInfo: React.ErrorInfo, plugin: Plugin) => void;
  onDisablePlugin?: (pluginId: string) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class PluginErrorBoundary extends React.Component<Props, State> {
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

    // Call the error handler with plugin info
    this.props.onError?.(error, errorInfo, this.props.plugin);

    // Log the plugin error
    console.error(`Plugin Error (${this.props.plugin.id}):`, error, errorInfo);
  }

  private handleDisablePlugin = () => {
    this.props.onDisablePlugin?.(this.props.plugin.id);
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Plugin Error: {this.props.plugin.name}
          </h4>
          <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
            <p>An error occurred in this plugin. You can:</p>
            <ul className="list-disc list-inside mt-1 text-xs">
              <li>Disable the plugin and continue</li>
              <li>Refresh the page to try again</li>
            </ul>
          </div>
          <div className="mt-2">
            <button
              onClick={this.handleDisablePlugin}
              className="px-2 py-1 text-xs font-medium text-yellow-900 bg-yellow-100 hover:bg-yellow-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:bg-yellow-800 dark:text-yellow-100 dark:hover:bg-yellow-700"
            >
              Disable Plugin
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2">
              <details className="text-xs text-yellow-700 dark:text-yellow-300">
                <summary className="cursor-pointer">Error Details</summary>
                <pre className="mt-1 p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded overflow-auto text-[10px]">
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
