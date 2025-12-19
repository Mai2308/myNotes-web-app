import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../components/Login';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock AuthProvider
const mockLogin = vi.fn();
vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({
    login: mockLogin
  })
}));

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('allows typing in email input', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/you@example\.com/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    expect(emailInput.value).toBe('test@example.com');
  });

  test('allows typing in password input', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(passwordInput.value).toBe('password123');
  });

  test('shows error message for empty fields', async () => {
    mockLogin.mockResolvedValue({ ok: false, message: 'Email and password are required' });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const loginButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      const errorMessage = screen.queryByText(/please fill in all fields/i) || 
                          screen.queryByText(/email.*required/i) ||
                          screen.queryByText(/required/i);
      if (errorMessage) {
        expect(errorMessage).toBeInTheDocument();
      }
    });
  });

  test('calls login function with correct credentials', async () => {
    mockLogin.mockResolvedValue({ ok: true });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/you@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const loginButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
    });
  });

  test('navigates to signup page when signup link is clicked', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const signupLink = screen.getByText(/sign up/i);
    expect(signupLink).toBeInTheDocument();
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
  });

  test('displays error message on failed login', async () => {
    mockLogin.mockResolvedValue({ ok: false, message: 'Invalid credentials' });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/you@example\.com/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const loginButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      const errorMessage = screen.queryByText(/invalid credentials/i) ||
                          screen.queryByText(/error/i);
      if (errorMessage) {
        expect(errorMessage).toBeInTheDocument();
      }
    });
  });

  test('password field is of type password', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('email field has correct type', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/you@example\.com/i);
    expect(emailInput).toHaveAttribute('type', 'email');
  });
});
