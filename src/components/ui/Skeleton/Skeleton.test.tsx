import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders single skeleton element with aria-hidden', () => {
    const { container } = render(<Skeleton width={100} height={20} />);
    const el = container.querySelector('div[aria-hidden="true"]');
    expect(el).toBeDefined();
    expect(el?.getAttribute('style')).toContain('width: 100px');
    expect(el?.getAttribute('style')).toContain('height: 20px');
  });

  it('renders multiple skeleton elements when count is greater than 1', () => {
    const { container } = render(<Skeleton count={4} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeDefined();
    expect(wrapper.children.length).toBe(4);
  });

  it('applies avatar preset correctly', () => {
    const { container } = render(<Skeleton preset="avatar" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute('style')).toContain('width: 40px');
    expect(el.getAttribute('style')).toContain('height: 40px');
  });
});
