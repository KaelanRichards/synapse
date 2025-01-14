import { Component, type ErrorInfo } from 'react';

interface Props {
  children: JSX.Element;
  onError: (error: Error) => void;
}

export class EditorErrorBoundary extends Component<Props> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError(error);
  }

  render(): JSX.Element {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          Something went wrong with the editor. Please refresh the page.
        </div>
      );
    }

    return this.props.children;
  }
}
