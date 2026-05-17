import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Logo } from './Logo';

describe('Logo Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<Logo size={32} />);
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute('width', '32');
    expect(svgElement).toHaveAttribute('height', '32');
  });
});
