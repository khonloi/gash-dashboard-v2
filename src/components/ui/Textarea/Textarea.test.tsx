import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Textarea } from './Textarea';

describe('Textarea Component', () => {
  it('renders label and handles typing', () => {
    const handleChange = vi.fn();
    render(
      <Textarea
        id="description"
        label="Description"
        placeholder="Enter description"
        onChange={handleChange}
      />
    );

    const textarea = screen.getByLabelText('Description');
    expect(textarea).toBeDefined();

    fireEvent.change(textarea, { target: { value: 'New text' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders error message when errorText is present', () => {
    render(<Textarea errorText="Description is required" />);
    expect(screen.getByText('Description is required')).toBeDefined();
  });
});
