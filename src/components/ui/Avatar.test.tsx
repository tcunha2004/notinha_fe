import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('shows the store logo, falling back to initials when it fails to load', () => {
    const { container } = render(<Avatar name="Mercado Bom Dia" logo="https://x.test/logo.png" />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', 'https://x.test/logo.png');

    if (img) fireEvent.error(img);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('MB')).toBeInTheDocument();
  });

  it('renders the small sizes', () => {
    const { container } = render(<Avatar name="Pilão" size="xs" />);
    expect(container.firstChild).toHaveClass('size-6');
  });

  it('shows initials when the store has no logo', () => {
    render(<Avatar name="Mercado Bom Dia" logo={null} />);
    expect(screen.getByText('MB')).toBeInTheDocument();
  });
});
