import { render, screen } from '@testing-library/react';
import App from './App';

test('renders H1 correctly', () => {
  render(<App />);
  const nasaHeader = screen.getByRole('heading', { name: /nasa astronomy picture of the day picker/i });
  expect(nasaHeader).toBeInTheDocument();
});


test('renders link to APOD about', () => {
  render(<App />);
  const nasaAbout = screen.getByRole('link', { name: /about nasa's astronomy picture of the day/i });
  expect(nasaAbout).toBeInTheDocument();
});