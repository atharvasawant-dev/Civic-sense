import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          issues: [],
          total: 0,
          totalIssues: 0,
          resolvedIssues: 0,
          pendingIssues: 0,
          activeUsers: 0,
          unreadCount: 0,
        }),
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders Civic Sense title', () => {
  render(<App />);
  const titleElements = screen.getAllByText(/Civic Sense/i);
  expect(titleElements.length).toBeGreaterThan(0);
});

