'use client';

import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox } from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import clsx from 'clsx';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string;
  isLoading?: boolean;
  skeletonRows?: number;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectRow?: (id: string) => void;
  onSelectAll?: () => void;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T extends object>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  skeletonRows = 5,
  emptyTitle = 'No records found',
  emptyMessage = 'There are no items to display right now.',
  emptyAction,
  sortColumn,
  sortDirection,
  onSort,
  selectable = false,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const getKey = (item: T, index: number): string => {
    if (keyExtractor) return keyExtractor(item, index);
    const itemRecord = item as Record<string, unknown>;
    if ('_id' in itemRecord && typeof itemRecord._id === 'string') return itemRecord._id;
    if ('id' in itemRecord && typeof itemRecord.id === 'string') return itemRecord.id;
    return `row-${index}`;
  };

  const handleSortClick = (key: string) => {
    if (!onSort) return;
    if (sortColumn === key) {
      onSort(key, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  const isAllSelected =
    data.length > 0 && data.every((item, idx) => selectedIds.includes(getKey(item, idx)));

  const isSomeSelected =
    data.length > 0 &&
    !isAllSelected &&
    data.some((item, idx) => selectedIds.includes(getKey(item, idx)));

  return (
    <div className={clsx(styles.tableWrapper, className)}>
      <div className={styles.scrollContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {selectable && (
                <th className={clsx(styles.th, styles.thSelect)} scope="col">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isSomeSelected}
                    onChange={() => onSelectAll?.()}
                    aria-label="Select all rows"
                  />
                </th>
              )}

              {columns.map((col) => {
                const isSorted = sortColumn === col.key;
                return (
                  <th
                    key={col.key}
                    className={clsx(styles.th, col.sortable && styles.thSortable)}
                    style={{
                      width: col.width,
                      textAlign: col.align || 'left',
                    }}
                    scope="col"
                    onClick={col.sortable ? () => handleSortClick(col.key) : undefined}
                    aria-sort={
                      isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined
                    }
                  >
                    <div
                      className={styles.sortContent}
                      style={{
                        justifyContent:
                          col.align === 'right'
                            ? 'flex-end'
                            : col.align === 'center'
                              ? 'center'
                              : 'flex-start',
                      }}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className={clsx(styles.sortIcon, isSorted && styles.sortIconActive)}>
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp size={14} />
                            ) : (
                              <ArrowDown size={14} />
                            )
                          ) : (
                            <ArrowUpDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: skeletonRows }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className={styles.tr}>
                  {selectable && (
                    <td className={clsx(styles.td, styles.tdSelect)}>
                      <div
                        className={styles.skeletonCell}
                        style={{ width: 18, margin: '0 auto' }}
                      />
                    </td>
                  )}
                  {columns.map((col, cIdx) => (
                    <td key={`skeleton-cell-${cIdx}`} className={styles.td}>
                      <div
                        className={styles.skeletonCell}
                        style={{ width: `${Math.max(40, (cIdx * 25 + 50) % 90)}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <Inbox size={22} />
                    </div>
                    <div className={styles.emptyTitle}>{emptyTitle}</div>
                    <div className={styles.emptySubtitle}>{emptyMessage}</div>
                    {emptyAction && (
                      <div style={{ marginTop: 'var(--space-2)' }}>{emptyAction}</div>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const rowKey = getKey(item, index);
                const isSelected = selectedIds.includes(rowKey);

                return (
                  <tr
                    key={rowKey}
                    className={clsx(
                      styles.tr,
                      styles.trHoverable,
                      isSelected && styles.trSelected,
                      onRowClick && styles.trClickable
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {selectable && (
                      <td
                        className={clsx(styles.td, styles.tdSelect)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => onSelectRow?.(rowKey)}
                          aria-label={`Select row ${index + 1}`}
                        />
                      </td>
                    )}

                    {columns.map((col) => {
                      const value = (item as Record<string, unknown>)[col.key];
                      return (
                        <td
                          key={col.key}
                          className={styles.td}
                          style={{
                            textAlign: col.align || 'left',
                            width: col.width,
                          }}
                        >
                          {col.render
                            ? col.render(item, index)
                            : ((value as React.ReactNode) ?? '—')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default DataTable;
