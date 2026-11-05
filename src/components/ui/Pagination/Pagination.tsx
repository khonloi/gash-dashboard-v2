'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import styles from './Pagination.module.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount?: number;
  itemsPerPage?: number;
  itemLabel?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  itemsPerPage = 30,
  itemLabel = 'items',
}: PaginationProps) {
  if (totalPages <= 1 && (!totalCount || totalCount <= itemsPerPage)) {
    return null;
  }

  // Calculate items range (e.g., Showing 1-30 of 45 products)
  const startItem = totalCount ? Math.min((currentPage - 1) * itemsPerPage + 1, totalCount) : 0;
  const endItem = totalCount ? Math.min(currentPage * itemsPerPage, totalCount) : 0;

  // Generate page numbers with ellipses
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={styles.paginationContainer} aria-label="Pagination Navigation">
      {totalCount !== undefined && totalCount > 0 && (
        <div className={styles.info}>
          Showing <span className={styles.highlight}>{startItem}</span>–
          <span className={styles.highlight}>{endItem}</span> of{' '}
          <span className={styles.highlight}>{totalCount}</span> {itemLabel}
        </div>
      )}

      {totalPages > 1 && (
        <nav className={styles.paginationNav}>
          {/* First page button */}
          <button
            type="button"
            className={`${styles.pageBtn} ${styles.navBtn}`}
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="Go to first page"
            title="First Page"
          >
            <ChevronsLeft size={16} />
          </button>

          {/* Previous page button */}
          <button
            type="button"
            className={`${styles.pageBtn} ${styles.navBtn}`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          <div className={styles.pageNumbers}>
            {pages.map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                    &hellip;
                  </span>
                );
              }

              const pageNum = page as number;
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={pageNum}
                  type="button"
                  className={`${styles.pageBtn} ${styles.numberBtn} ${isActive ? styles.active : ''}`}
                  onClick={() => onPageChange(pageNum)}
                  aria-label={`Page ${pageNum}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next page button */}
          <button
            type="button"
            className={`${styles.pageBtn} ${styles.navBtn}`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>

          {/* Last page button */}
          <button
            type="button"
            className={`${styles.pageBtn} ${styles.navBtn}`}
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Go to last page"
            title="Last Page"
          >
            <ChevronsRight size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}
