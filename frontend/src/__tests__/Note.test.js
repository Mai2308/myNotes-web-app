import { render, screen, fireEvent } from '@testing-library/react';
import Note from '../components/Note';

test('creates and saves a note', () => {
  render(<Note />);
  fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: 'Test Note' } });
  fireEvent.change(screen.getByPlaceholderText(/Content/i), { target: { value: 'Hello World' } });
  fireEvent.click(screen.getByText(/Save/i));
  expect(screen.getByText('Test Note')).toBeInTheDocument();
});

test('locks and unlocks a note', () => {
  render(<Note />);
  fireEvent.click(screen.getByText(/Lock/i));
  fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: '1234' } });
  fireEvent.click(screen.getByText(/Unlock/i));
  expect(screen.getByText(/Unlocked/i)).toBeInTheDocument();
});

test('adds note to favorites', () => {
  render(<Note />);
  fireEvent.click(screen.getByText(/Add to Favorites/i));
  expect(screen.getByText(/Favorite/i)).toBeInTheDocument();
});
