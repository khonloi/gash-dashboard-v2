import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatCard } from './StatCard';

describe('StatCard Component', () => {
  it('renders title, value, and positive trend', () => {
    render(
      <StatCard
        title="Total Revenue"
        value="$48,250"
        trend={{ value: 12.5, isPositive: true, label: 'vs last month' }}
      />
    );

    expect(screen.getByText('Total Revenue')).toBeDefined();
    expect(screen.getByText('$48,250')).toBeDefined();
    expect(screen.getByText('12.5%')).toBeDefined();
    expect(screen.getByText('vs last month')).toBeDefined();
  });
});
