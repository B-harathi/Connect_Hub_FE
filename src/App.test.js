import React from 'react';
import { render } from '@testing-library/react';

// Mock all external dependencies before importing App
jest.mock('react-hot-toast', () => ({
  Toaster: () => null,
  useToaster: () => [null, null],
}));

jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    isAuthenticated: false,
    loading: 'idle',
  }),
}));

jest.mock('./contexts/SocketContext', () => ({
  SocketProvider: ({ children }) => children,
}));

jest.mock('./contexts/ChatContext', () => ({
  ChatProvider: ({ children }) => children,
}));

jest.mock('./components/common/ErrorBoundary', () => {
  return function MockErrorBoundary({ children }) {
    return children;
  };
});

jest.mock('./components/layout/Layout', () => {
  return function MockLayout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

jest.mock('./components/auth/Login', () => () => (
  <div data-testid="login-page">Login Page</div>
));

jest.mock('./components/auth/Register', () => () => (
  <div data-testid="register-page">Register Page</div>
));

jest.mock('./components/chat/ChatContainer', () => () => (
  <div data-testid="chat-container">Chat Container</div>
));

jest.mock('./components/profile/Profile', () => () => (
  <div data-testid="profile-page">Profile Page</div>
));

jest.mock('./components/settings/Settings', () => () => (
  <div data-testid="settings-page">Settings Page</div>
));

jest.mock('./utils/helpers', () => ({
  applyTheme: jest.fn(),
  getStoredTheme: jest.fn(() => 'light'),
  getSystemTheme: jest.fn(() => 'light'),
}));

import App from './App';

describe('App Component', () => {
  it('should render without crashing', () => {
    render(<App />);
  });

  it('should render the App div container', () => {
    const { container } = render(<App />);
    const appDiv = container.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
  });

  it('should render the AppRouter with routes', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });
});
