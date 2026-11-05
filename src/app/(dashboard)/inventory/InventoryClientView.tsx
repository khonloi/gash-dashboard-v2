'use client';

import React, { useState, useMemo } from 'react';
import { Boxes, DollarSign, AlertTriangle, AlertCircle, Search } from 'lucide-react';
import { DataTable, Column, StatCard, Input, StatusBadge, Pagination } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { StockAdjustmentDrawer } from '@/components/inventory/StockAdjustmentDrawer/StockAdjustmentDrawer';
import { ProductIdentityCell } from '@/components/products/ProductIdentityCell';
import { useAdminProductsQuery } from '@/hooks/useProducts';
import { BackendProduct } from '@/types/product';
import { formatCurrency } from '@/lib/format';
import clsx from 'clsx';
import styles from './inventory.module.css';

type StockFilterTab = 'all' | 'low_stock' | 'out_of_stock';

export function InventoryClientView() {
  const [activeTab, setActiveTab] = useState<StockFilterTab>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [adjustingProduct, setAdjustingProduct] = useState<BackendProduct | null>(null);

  // Fetch all products for stock management
  const { data, isLoading } = useAdminProductsQuery({ limit: 100 });
  const allProducts = useMemo(() => data?.products || [], [data?.products]);

  // Metrics computation across entire inventory
  const { totalUnits, totalValuation, lowStockCount, outOfStockCount } = useMemo(() => {
    let units = 0;
    let valuation = 0;
    let lowCount = 0;
    let outCount = 0;

    allProducts.forEach((p) => {
      const q = p.quantity ?? 0;
      const threshold = p.lowStockThreshold ?? 5;
      units += q;
      valuation += q * (p.costPrice || p.price || 0);

      if (q === 0) {
        outCount += 1;
      } else if (q <= threshold) {
        lowCount += 1;
      }
    });

    return {
      totalUnits: units,
      totalValuation: valuation,
      lowStockCount: lowCount,
      outOfStockCount: outCount,
    };
  }, [allProducts]);

  // Tab & search filtering
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const q = p.quantity ?? 0;
      const threshold = p.lowStockThreshold ?? 5;

      if (activeTab === 'low_stock' && (q > threshold || q === 0)) {
        return false;
      }
      if (activeTab === 'out_of_stock' && q > 0) {
        return false;
      }

      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesSku = p.sku?.toLowerCase().includes(query);
        const matchesCategory = p.category.toLowerCase().includes(query);
        if (!matchesName && !matchesSku && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [allProducts, activeTab, search]);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = filteredProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const columns: Column<BackendProduct>[] = [
    {
      key: 'name',
      header: 'Product',
      width: '32%',
      render: (product) => <ProductIdentityCell product={product} />,
    },
    {
      key: 'category',
      header: 'Category',
      width: '14%',
      render: (p) => <span>{p.category}</span>,
    },
    {
      key: 'price',
      header: 'Retail Price',
      align: 'right',
      width: '13%',
      render: (p) => <span>{formatCurrency(p.price)}</span>,
    },
    {
      key: 'quantity',
      header: 'On Hand',
      width: '16%',
      render: (p) => {
        const qty = p.quantity ?? 0;
        const threshold = p.lowStockThreshold ?? 5;
        const status = qty === 0 ? 'out_of_stock' : qty <= threshold ? 'low_stock' : 'in_stock';

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, minWidth: '24px' }}>{qty}</span>
            <StatusBadge status={status} />
          </div>
        );
      },
    },
    {
      key: 'valuation',
      header: 'Asset Value',
      align: 'right',
      width: '13%',
      render: (p) => {
        const value = (p.quantity ?? 0) * p.price;
        return <span style={{ fontWeight: 600 }}>{formatCurrency(value)}</span>;
      },
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      width: '12%',
      render: (p) => (
        <button
          type="button"
          className={styles.adjustBtn}
          onClick={() => setAdjustingProduct(p)}
          aria-label={`Adjust stock for ${p.name}`}
        >
          <Boxes size={14} />
          <span>Adjust Stock</span>
        </button>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* Title */}
      <PageHeader
        title="Inventory Operations"
        subtitle="Real-time stock valuation, low-stock threshold monitoring, and warehouse adjustments."
      />

      {/* KPI Cards */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Total Stock On Hand"
          value={totalUnits.toLocaleString()}
          isLoading={isLoading}
          icon={<Boxes size={20} />}
          description="Units stored across facilities"
        />

        <StatCard
          title="Inventory Valuation"
          value={formatCurrency(totalValuation)}
          isLoading={isLoading}
          icon={<DollarSign size={20} />}
          description="Estimated assets value"
        />

        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount}
          isLoading={isLoading}
          icon={<AlertTriangle size={20} color="var(--color-warning)" />}
          description="Items at or below restock limit"
        />

        <StatCard
          title="Out of Stock"
          value={outOfStockCount}
          isLoading={isLoading}
          icon={<AlertCircle size={20} color="var(--color-danger)" />}
          description="Catalog items with 0 units"
        />
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className={styles.controls}>
        <div className={styles.filterTabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            className={clsx(styles.tabButton, activeTab === 'all' && styles.tabButtonActive)}
            onClick={() => {
              setActiveTab('all');
              setPage(1);
            }}
          >
            All Inventory
            <span className={styles.tabBadge}>{allProducts.length}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'low_stock'}
            className={clsx(styles.tabButton, activeTab === 'low_stock' && styles.tabButtonActive)}
            onClick={() => {
              setActiveTab('low_stock');
              setPage(1);
            }}
          >
            Low Stock Alerts
            <span className={clsx(styles.tabBadge, lowStockCount > 0 && styles.tabBadgeAlert)}>
              {lowStockCount}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'out_of_stock'}
            className={clsx(
              styles.tabButton,
              activeTab === 'out_of_stock' && styles.tabButtonActive
            )}
            onClick={() => {
              setActiveTab('out_of_stock');
              setPage(1);
            }}
          >
            Out of Stock
            <span className={clsx(styles.tabBadge, outOfStockCount > 0 && styles.tabBadgeAlert)}>
              {outOfStockCount}
            </span>
          </button>
        </div>

        <div className={styles.searchInput}>
          <Input
            id="inventorySearch"
            placeholder="Search inventory by product or SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search size={16} />}
          />
        </div>
      </div>

      {/* Inventory Table */}
      <DataTable
        columns={columns}
        data={paginatedProducts}
        isLoading={isLoading}
        emptyTitle="No inventory matches found"
        emptyMessage="No items match your active tab and search criteria."
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        totalCount={filteredProducts.length}
        itemsPerPage={itemsPerPage}
        itemLabel="items"
      />

      {/* Stock Adjustment Drawer */}
      <StockAdjustmentDrawer
        isOpen={Boolean(adjustingProduct)}
        onClose={() => setAdjustingProduct(null)}
        product={adjustingProduct}
      />
    </div>
  );
}
export default InventoryClientView;
