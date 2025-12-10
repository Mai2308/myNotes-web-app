import { render, screen } from '@testing-library/react';
import { AuthProvider } from './auth/AuthProvider';
import App from './App';

// Temporarily remove the mock for debugging
// jest.mock('react-router-dom', () => ({
//   __esModule: true,
//   Routes: ({ children }) => <div>{children}</div>,
//   Route: ({ element }) => <div>{element}</div>,
//   Navigate: () => <div>Navigate</div>,
// }));

test('renders learn react link', () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders App component', () => {
  render(<App />);
});
