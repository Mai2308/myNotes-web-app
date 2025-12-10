import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Calendar from './Calendar';

// Mock fetch API
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Calendar Component', () => {
  test('renders real-time clock', async () => {
    await act(async () => {
      render(<Calendar />);
    });
    const clockElement = screen.getByText(/Current Time:/);
    expect(clockElement).toBeInTheDocument();
  });

  test('navigates between months', async () => {
    await act(async () => {
      render(<Calendar />);
    });

    const nextButton = screen.getByRole('button', { name: 'Next Month' });
    const prevButton = screen.getByRole('button', { name: 'Previous Month' });

    // Click next month
    await act(async () => {
      fireEvent.click(nextButton);
    });
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    // Click previous month
    await act(async () => {
      fireEvent.click(prevButton);
    });
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  test('adds a new event', async () => {
    await act(async () => {
      render(<Calendar />);
    });

    const addEventButton = screen.getByText(/Add Event/i);
    fireEvent.click(addEventButton);

    const titleInput = screen.getByPlaceholderText(/Event title/i);
    const submitButton = screen.getByRole('button', { name: /Create Event/i });

    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/calendar'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  test('deletes an event', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: 1, title: 'Test Event', date: '2025-12-10', time: '10:00' },
          ]),
      })
    );

    await act(async () => {
      render(<Calendar />);
    });

    await waitFor(() => {
      const deleteButton = screen.getByText(/Delete/i);
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/calendar/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});