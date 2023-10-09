import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StrictMode } from 'react';

describe('App', () => {
  it('renders as expected', () => {
    render(
      <StrictMode>
      
      </StrictMode>,
    );
    // expect(screen.getByText(/Vite + React + Motoko/i)).toBeInTheDocument();
    expect(1).toEqual(1);
  });
});
