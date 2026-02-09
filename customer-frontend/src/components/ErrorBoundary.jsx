import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
            예기치 않은 오류가 발생했습니다
          </h1>
          <p style={{ marginBottom: '24px', color: '#6b7280' }}>
            페이지를 새로고침해주세요.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '16px',
              minHeight: '44px',
            }}
          >
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
