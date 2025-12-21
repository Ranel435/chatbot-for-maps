import { Component, type ReactNode } from 'react';
import { Button, Card } from '../../shared/ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
          <Card className="max-w-md text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Что-то пошло не так
            </h1>
            <p className="text-gray-600 mb-4">
              Произошла непредвиденная ошибка. Пожалуйста, попробуйте перезагрузить страницу.
            </p>
            {this.state.error && (
              <pre className="text-xs text-left bg-surface-100 p-3 rounded mb-4 overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <Button onClick={this.handleReset}>
              Вернуться на главную
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}






