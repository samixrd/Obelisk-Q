import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Logo from './Logo';

describe('Logo Component', () => {
  it('renders the Obelisk logo text', () => {
    render(<Logo />);
    const logoText = screen.getByText(/OBELISK/i);
    expect(logoText).toBeInTheDocument();
  });

  it('renders the "Q" insignia', () => {
    render(<Logo />);
    const insignia = screen.getByText(/Q/i);
    expect(insignia).toBeInTheDocument();
  });
});
