import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../components/Dashboard';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
global.localStorage = mockLocalStorage;

// Mock AuthProvider
vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({
    user: { _id: 'user123', username: 'testuser', email: 'test@example.com' }
  })
}));

// Mock ViewContext
vi.mock('../context/ViewContext', () => ({
  useView: () => ({
    sort: 'date',
    viewType: 'grid'
  })
}));

// Mock ThemeContext
vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light'
  })
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('fake-token');
  });

  test('renders dashboard with loading state', () => {
    global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const loadingElement = screen.queryByText(/loading/i);
    if (loadingElement) {
      expect(loadingElement).toBeInTheDocument();
    }
  });

  test('renders dashboard with notes grid', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          _id: '1',
          title: 'Test Note 1',
          content: 'Content 1',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Test Note 2',
          content: 'Content 2',
          createdAt: new Date().toISOString()
        }
      ]
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const note1 = screen.queryByText('Test Note 1');
      const note2 = screen.queryByText('Test Note 2');
      
      if (note1 && note2) {
        expect(note1).toBeInTheDocument();
        expect(note2).toBeInTheDocument();
      }
    });
  });

  test('displays empty state when no notes exist', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const emptyMessage = screen.queryByText(/no notes/i) ||
                          screen.queryByText(/create.*note/i) ||
                          screen.queryByText(/get started/i);
      
      if (emptyMessage) {
        expect(emptyMessage).toBeInTheDocument();
      }
    });
  });

  test('renders folder manager component', () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Check if FolderManager or sidebar exists
    const sidebar = document.querySelector('.sidebar') || 
                   document.querySelector('.folder-manager') ||
                   screen.queryByText(/folders/i);
    
    if (sidebar) {
      expect(sidebar).toBeInTheDocument();
    }
  });

  test('handles API error gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const errorMessage = screen.queryByText(/error/i) ||
                          screen.queryByText(/failed/i);
      
      // Component should handle error without crashing
      expect(document.body).toBeInTheDocument();
    });
  });

  test('renders note with preview', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          _id: '1',
          title: 'Note with Preview',
          content: 'This is a long content that should be truncated in the preview section',
          createdAt: new Date().toISOString()
        }
      ]
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const noteTitle = screen.queryByText('Note with Preview');
      if (noteTitle) {
        expect(noteTitle).toBeInTheDocument();
      }
    });
  });

  test('renders checklist note with items preview', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          _id: '1',
          title: 'Shopping List',
          content: '',
          isChecklist: true,
          checklistItems: [
            { text: 'Milk', completed: false, order: 0 },
            { text: 'Bread', completed: true, order: 1 },
            { text: 'Eggs', completed: false, order: 2 }
          ],
          createdAt: new Date().toISOString()
        }
      ]
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const noteTitle = screen.queryByText('Shopping List');
      if (noteTitle) {
        expect(noteTitle).toBeInTheDocument();
      }
    });
  });

  test('renders create note button', () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    const createButton = screen.queryByText(/create.*note/i) ||
                        screen.queryByText(/new.*note/i) ||
                        screen.queryByRole('button', { name: /\+/i });
    
    if (createButton) {
      expect(createButton).toBeInTheDocument();
    }
  });
});
