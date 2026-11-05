import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { DataTable, Column } from './DataTable';

interface TestItem {
  id: string;
  name: string;
  category: string;
  price: number;
}

const mockData: TestItem[] = [
  { id: '1', name: 'Product A', category: 'Running', price: 99 },
  { id: '2', name: 'Product B', category: 'Training', price: 149 },
];

const mockColumns: Column<TestItem>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'category', header: 'Category' },
  {
    key: 'price',
    header: 'Price',
    render: (item) => `$${item.price}`,
    align: 'right',
  },
];

describe('DataTable Component', () => {
  it('renders table headers and data correctly', () => {
    render(<DataTable columns={mockColumns} data={mockData} />);

    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Category')).toBeDefined();
    expect(screen.getByText('Price')).toBeDefined();
    expect(screen.getByText('Product A')).toBeDefined();
    expect(screen.getByText('Product B')).toBeDefined();
    expect(screen.getByText('$99')).toBeDefined();
    expect(screen.getByText('$149')).toBeDefined();
  });

  it('triggers onSort when clicking a sortable column header', () => {
    const handleSort = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        sortColumn="name"
        sortDirection="asc"
        onSort={handleSort}
      />
    );

    const nameHeader = screen.getByText('Name').closest('th');
    expect(nameHeader).toBeDefined();
    fireEvent.click(nameHeader!);

    expect(handleSort).toHaveBeenCalledWith('name', 'desc');
  });

  it('renders empty state when data is empty and not loading', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={[]}
        emptyTitle="No products found"
        emptyMessage="Try adjusting your filters"
      />
    );

    expect(screen.getByText('No products found')).toBeDefined();
    expect(screen.getByText('Try adjusting your filters')).toBeDefined();
  });

  it('handles row selection properly', () => {
    const handleSelectRow = vi.fn();
    const handleSelectAll = vi.fn();

    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        selectable
        selectedIds={['1']}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
      />
    );

    const rowCheckboxes = screen.getAllByRole('checkbox');
    // First is select-all, 2nd is row 1, 3rd is row 2
    expect(rowCheckboxes.length).toBe(3);

    fireEvent.click(rowCheckboxes[2]);
    expect(handleSelectRow).toHaveBeenCalledWith('2');

    fireEvent.click(rowCheckboxes[0]);
    expect(handleSelectAll).toHaveBeenCalled();
  });
});
