import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginForm } from './components/auth';

// Mock the auth service to avoid axios issues in tests
jest.mock('./services/authService', () => ({
  __esModule: true,
  default: {
    getCurrentUser: () => null,
    isAuthenticated: () => false,
    getToken: () => null,
    isAdmin: () => false,
  },
}));

// Mock the API service
jest.mock('./services/api', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

test('renders login form', () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </MemoryRouter>
  );
  const usernameInput = screen.getByLabelText(/username/i);
  const passwordInput = screen.getByLabelText(/password/i);
  expect(usernameInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
});
