import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Logo } from './Logo';

describe('Logo Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<Logo size={32} />);
    const imgElement = container.querySelector('img');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('width', '32');
    expect(imgElement).toHaveAttribute('height', '32');
    expect(imgElement).toHaveAttribute('alt', 'Obelisk Logo');
  });
});
