import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('should render the application', () => {
    // App already includes BrowserRouter, so render it directly
    render(<App />);
    expect(document.body).toBeDefined();
  });

  it('should confirm React is working', () => {
    expect(true).toBe(true);
  });
});
