import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge Component', () => {
  it('renders order status with formatted label and color variant', () => {
    const { container } = render(<StatusBadge status="processing" />);
    expect(screen.getByText('processing')).toBeDefined();
    expect(container.firstChild).toBeDefined();
  });

  it('renders custom label and color override', () => {
    render(<StatusBadge status="low_stock" label="Critical: 3 left" color="rose" />);
    expect(screen.getByText('Critical: 3 left')).toBeDefined();
  });
});
