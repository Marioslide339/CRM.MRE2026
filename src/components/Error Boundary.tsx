/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[CRM ErrorBoundary] Caught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            fontFamily: 'Inter, sans-serif',
            padding: '2rem',
            gap: '1rem',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '1.5rem',
              padding: '2.5rem 3rem',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              border: '1px solid #e2e8f0',
              maxWidth: 480,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: 8,
              }}
            >
              Đã xảy ra lỗi hiển thị
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 20 }}>
              Ứng dụng gặp lỗi không mong muốn. Vui lòng thử tải lại trang hoặc
              nhấn nút bên dưới để khôi phục.
            </p>
            {this.state.error && (
              <pre
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '0.75rem 1rem',
                  fontSize: '0.7rem',
                  color: '#ef4444',
                  textAlign: 'left',
                  overflowX: 'auto',
                  marginBottom: 20,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {this.state.error.toString()}
              </pre>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: '0.75rem',
                  background: '#FF3B30',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Thử lại
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: '0.75rem',
                  background: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
              >
                Tải lại trang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
