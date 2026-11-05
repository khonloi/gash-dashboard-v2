'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Boxes, Trash2, Search } from 'lucide-react';
import {
  DataTable,
  Column,
  Button,
  Input,
  Select,
  StatusBadge,
  Pagination,
  ConfirmDialog,
} from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { StockAdjustmentDrawer } from '@/components/inventory/StockAdjustmentDrawer/StockAdjustmentDrawer';
import { ProductIdentityCell } from '@/components/products/ProductIdentityCell';
import { useAdminProductsQuery, useDeleteProductMutation } from '@/hooks/useProducts';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { BackendProduct } from '@/types/product';
import { formatCurrency } from '@/lib/format';
import styles from './products.module.css';

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'Footwear', label: 'Footwear' },
  { value: 'Apparel', label: 'Apparel' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'Accessories', label: 'Accessories' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

export function ProductsClientView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');

  // Modal and Drawer states
  const [adjustingProduct, setAdjustingProduct] = useState<BackendProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<BackendProduct | null>(null);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'admin';
  const addToast = useToastStore((state) => state.addToast);

  const queryParams = {
    page,
    limit: 10,
    search: search.trim() || undefined,
    category: category !== 'all' ? category : undefined,
    status: status !== 'all' ? status : undefined,
  };

  const { data, isLoading } = useAdminProductsQuery(queryParams);
  const deleteMutation = useDeleteProductMutation();

  const products = data?.products || [];
  const totalCount = data?.total || products.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / 10));

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    try {
      await deleteMutation.mutateAsync(deletingProduct._id || deletingProduct.id || '');
      addToast(`Product "${deletingProduct.name}" removed successfully`, 'success');
      setDeletingProduct(null);
    } catch {
      addToast('Failed to delete product', 'error');
    }
  };

  const columns: Column<BackendProduct>[] = [
    {
      key: 'name',
      header: 'Product',
      width: '32%',
      render: (product) => <ProductIdentityCell product={product} />,
    },
    {
      key: 'category',
      header: 'Category / Brand',
      width: '16%',
      render: (p) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: 500 }}>{p.category}</span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {p.brand || 'GASH'}
          </span>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Retail Price',
      align: 'right',
      width: '14%',
      render: (p) => (
        <div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}
        >
          <span style={{ fontWeight: 600 }}>{formatCurrency(p.price)}</span>
          {p.compareAtPrice && p.compareAtPrice > p.price && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                textDecoration: 'line-through',
              }}
            >
              {formatCurrency(p.compareAtPrice)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Stock Status',
      width: '14%',
      render: (p) => {
        const qty = p.quantity ?? 0;
        const threshold = p.lowStockThreshold ?? 5;
        const stockStatus =
          qty === 0 ? 'out_of_stock' : qty <= threshold ? 'low_stock' : 'in_stock';

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, minWidth: '24px' }}>{qty}</span>
            <StatusBadge status={stockStatus} />
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Catalog Status',
      width: '12%',
      render: (p) => <StatusBadge status={p.status || 'active'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '12%',
      render: (p) => (
        <div className={styles.actionsCell} style={{ justifyContent: 'flex-end' }}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => setAdjustingProduct(p)}
            title="Adjust inventory stock"
            aria-label={`Adjust stock for ${p.name}`}
          >
            <Boxes size={15} />
          </button>

          <Link
            href={`/products/${p._id || p.id}/edit`}
            className={styles.actionBtn}
            title="Edit product"
            aria-label={`Edit ${p.name}`}
          >
            <Edit size={15} />
          </Link>

          {isAdmin && (
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
              onClick={() => setDeletingProduct(p)}
              title="Delete product"
              aria-label={`Delete ${p.name}`}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* Page Title & Add Button */}
      <PageHeader
        title="Products Catalog"
        subtitle="Manage inventory availability, variants, pricing margins, and catalog statuses."
        actions={
          <Button
            as={Link}
            href="/products/new"
            variant="primary"
            size="md"
            leftIcon={<Plus size={16} />}
          >
            New Product
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className={styles.controls}>
        <div className={styles.searchInput}>
          <Input
            id="productSearch"
            placeholder="Search products by name, SKU, or brand..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search size={16} />}
          />
        </div>

        <div className={styles.filterSelect}>
          <Select
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by category"
          />
        </div>

        <div className={styles.filterSelect}>
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by catalog status"
          />
        </div>

        {(search || category !== 'all' || status !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('');
              setCategory('all');
              setStatus('all');
              setPage(1);
            }}
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyTitle="No products found"
        emptyMessage="Try adjusting your search criteria or create a new product."
        emptyAction={
          <Button as={Link} href="/products/new" variant="primary" size="sm">
            Add Your First Product
          </Button>
        }
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalCount={totalCount}
        itemsPerPage={10}
        itemLabel="products"
      />

      {/* Stock Adjustment Drawer */}
      <StockAdjustmentDrawer
        isOpen={Boolean(adjustingProduct)}
        onClose={() => setAdjustingProduct(null)}
        product={adjustingProduct}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        description={`Are you sure you want to permanently remove "${deletingProduct?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Product"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
export default ProductsClientView;
