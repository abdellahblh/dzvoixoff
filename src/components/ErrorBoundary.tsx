import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirestoreOffline = false;
      
      try {
        if (this.state.error?.message.includes('client is offline')) {
          isFirestoreOffline = true;
        } else {
          const parsed = JSON.parse(this.state.error?.message || '{}');
          if (parsed.error?.includes('client is offline')) {
            isFirestoreOffline = true;
          }
        }
      } catch (e) {
        // Not a JSON error
      }

      if (isFirestoreOffline) {
        errorMessage = "Could not connect to the database. Please make sure you have enabled Firestore Database in your Firebase Console.";
      } else if (this.state.error?.message) {
        try {
          const parsed = JSON.parse(this.state.error.message);
          errorMessage = parsed.error || this.state.error.message;
        } catch {
          errorMessage = this.state.error.message;
        }
      }

      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full border border-red-100">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="w-8 h-8" />
              <h2 className="text-xl font-bold">Something went wrong</h2>
            </div>
            <p className="text-neutral-600 mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-xl transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
