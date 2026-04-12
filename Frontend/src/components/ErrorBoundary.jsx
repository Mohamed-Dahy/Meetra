import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

// ErrorBoundary is a React class component — function components cannot catch
// render errors. It wraps each dashboard tab so that if one tab crashes
// (e.g. bad data, a missing prop, or a rendering bug), only that tab shows
// an error UI. The rest of the dashboard — sidebar, header, other tabs —
// keep working normally. Without this, a single crash takes down the entire page.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Called by React when a descendant throws during render.
  // Returns the new state to merge — this is how we flip into error mode.
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Called after getDerivedStateFromError — good place to log to an error
  // tracking service (e.g. Sentry) in the future.
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Tab crashed:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '60vh', gap: 16, textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#f87171',
          }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
              Something went wrong
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: "'DM Sans',sans-serif", maxWidth: 300, lineHeight: 1.6 }}>
              {this.state.error?.message || 'An unexpected error occurred in this tab.'}
            </div>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 18px', borderRadius: 9, cursor: 'pointer',
              background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
              color: '#818cf8', fontFamily: "'DM Sans',sans-serif", fontSize: 13,
            }}
          >
            <RotateCcw size={13} /> Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
