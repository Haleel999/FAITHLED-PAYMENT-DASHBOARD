import React from 'react';
export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error?: Error }> {
  state = { hasError: false as boolean, error: undefined as any };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return <div className="container">
        <h2>Something went wrong.</h2>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error)}</pre>
      </div>
    }
    return this.props.children;
  }
}
