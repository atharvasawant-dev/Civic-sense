import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Civic Sense title', () => {
  render(<App />);
  const titleElements = screen.getAllByText(/Civic Sense/i);
  expect(titleElements.length).toBeGreaterThan(0);
});
