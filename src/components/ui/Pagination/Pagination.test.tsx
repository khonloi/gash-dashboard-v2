import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination Component', () => {
  it('renders nothing when totalPages is <= 1 and totalCount is within itemsPerPage', () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        onPageChange={vi.fn()}
        totalCount={10}
        itemsPerPage={30}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders product range summary accurately when totalCount is provided', () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={4}
        onPageChange={vi.fn()}
        totalCount={95}
        itemsPerPage={30}
        itemLabel="products"
      />
    );

    expect(screen.getByText(/Showing/i)).toBeDefined();
    expect(screen.getByText('31')).toBeDefined();
    expect(screen.getByText('60')).toBeDefined();
    expect(screen.getByText('95')).toBeDefined();
    expect(screen.getByText(/products/i)).toBeDefined();
  });

  it('renders all page buttons when totalPages <= 7', () => {
    const handlePageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={handlePageChange} />);

    for (let p = 1; p <= 5; p++) {
      const pageBtn = screen.getByRole('button', { name: `Page ${p}` });
      expect(pageBtn).toBeDefined();
      if (p === 3) {
        expect(pageBtn.getAttribute('aria-current')).toBe('page');
      } else {
        expect(pageBtn.getAttribute('aria-current')).toBeNull();
      }
    }

    fireEvent.click(screen.getByRole('button', { name: 'Page 4' }));
    expect(handlePageChange).toHaveBeenCalledWith(4);
  });

  it('disables previous and first buttons on page 1', () => {
    const handlePageChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={handlePageChange} />);

    const firstBtn = screen.getByRole('button', { name: /Go to first page/i });
    const prevBtn = screen.getByRole('button', { name: /Go to previous page/i });
    const nextBtn = screen.getByRole('button', { name: /Go to next page/i });
    const lastBtn = screen.getByRole('button', { name: /Go to last page/i });

    expect(firstBtn).toBeDisabled();
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).not.toBeDisabled();
    expect(lastBtn).not.toBeDisabled();

    fireEvent.click(nextBtn);
    expect(handlePageChange).toHaveBeenCalledWith(2);

    fireEvent.click(lastBtn);
    expect(handlePageChange).toHaveBeenCalledWith(5);
  });

  it('disables next and last buttons on the final page', () => {
    const handlePageChange = vi.fn();
    render(<Pagination currentPage={5} totalPages={5} onPageChange={handlePageChange} />);

    const firstBtn = screen.getByRole('button', { name: /Go to first page/i });
    const prevBtn = screen.getByRole('button', { name: /Go to previous page/i });
    const nextBtn = screen.getByRole('button', { name: /Go to next page/i });
    const lastBtn = screen.getByRole('button', { name: /Go to last page/i });

    expect(nextBtn).toBeDisabled();
    expect(lastBtn).toBeDisabled();
    expect(firstBtn).not.toBeDisabled();
    expect(prevBtn).not.toBeDisabled();

    fireEvent.click(prevBtn);
    expect(handlePageChange).toHaveBeenCalledWith(4);

    fireEvent.click(firstBtn);
    expect(handlePageChange).toHaveBeenCalledWith(1);
  });

  it('renders ellipses properly when totalPages > 7 and navigated to middle page', () => {
    render(<Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Page 1' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Page 4' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Page 5' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Page 6' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Page 10' })).toBeDefined();

    // Two ellipsis markers should be present
    const ellipses = screen.getAllByText('…');
    expect(ellipses.length).toBe(2);
  });
});
