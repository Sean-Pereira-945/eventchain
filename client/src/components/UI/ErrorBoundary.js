import { Component } from 'react';
import Button from './Button';
import Modal from './Modal';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught an error', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children } = this.props;

    if (!hasError) return children;

    return (
      <Modal isOpen onClose={this.handleReset} title="Something went wrong">
        <div className="error-boundary">
          <p>We encountered an unexpected issue. You can try to continue or refresh the page.</p>
          {error && <pre className="error-boundary__message">{error.message}</pre>}
          {errorInfo && errorInfo.componentStack && (
            <details className="error-boundary__details">
              <summary>Technical details</summary>
              <pre>{errorInfo.componentStack}</pre>
            </details>
          )}
          <div className="error-boundary__actions">
            <Button variant="primary" onClick={this.handleReset}>
              Try again
            </Button>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
}

export default ErrorBoundary;
