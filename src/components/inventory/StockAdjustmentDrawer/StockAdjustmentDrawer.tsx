'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer/Drawer';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { BackendProduct } from '@/types/product';
import { useUpdateStockMutation } from '@/hooks/useProducts';
import { useToastStore } from '@/store/useToastStore';
import clsx from 'clsx';
import styles from './StockAdjustmentDrawer.module.css';

export interface StockAdjustmentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: BackendProduct | null;
  onSuccess?: () => void;
}

type AdjustmentMode = 'set' | 'increment' | 'decrement';

interface StockAdjustmentFormProps {
  product: BackendProduct;
  onClose: () => void;
  onSuccess?: () => void;
}

function StockAdjustmentForm({ product, onClose, onSuccess }: StockAdjustmentFormProps) {
  const [mode, setMode] = useState<AdjustmentMode>('increment');
  const [amount, setAmount] = useState<number>(10);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  const updateStockMutation = useUpdateStockMutation();
  const addToast = useToastStore((state) => state.addToast);

  const currentStock = product.quantity ?? 0;

  let newStock = currentStock;
  if (mode === 'increment') {
    newStock = currentStock + (amount || 0);
  } else if (mode === 'decrement') {
    newStock = Math.max(0, currentStock - (amount || 0));
  } else {
    newStock = Math.max(0, amount || 0);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 0) {
      setError('Adjustment quantity cannot be negative');
      return;
    }

    try {
      await updateStockMutation.mutateAsync({
        id: product._id || product.id || '',
        payload: {
          quantity: amount,
          operation: mode,
        },
      });

      addToast(`Stock for ${product.name} updated to ${newStock} units`, 'success');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust stock');
    }
  };

  const imageUrl =
    Array.isArray(product.images) && product.images.length > 0
      ? typeof product.images[0] === 'string'
        ? product.images[0]
        : product.images[0].url
      : '/icon.svg';

  return (
    <form onSubmit={handleSubmit} className={styles.drawerContent}>
      {/* Product Overview Header */}
      <div className={styles.productOverview}>
        <Image
          src={imageUrl}
          alt={product.name}
          width={52}
          height={52}
          className={styles.productThumb}
          unoptimized
        />
        <div className={styles.productMeta}>
          <span className={styles.productName} title={product.name}>
            {product.name}
          </span>
          <span className={styles.productSku}>SKU: {product.sku || 'N/A'}</span>
        </div>
      </div>

      {/* Operation Mode Selector */}
      <div className={styles.modeSelector} role="radiogroup" aria-label="Adjustment operation">
        <button
          type="button"
          className={clsx(styles.modeButton, mode === 'increment' && styles.modeButtonActive)}
          onClick={() => setMode('increment')}
        >
          + Add Stock
        </button>
        <button
          type="button"
          className={clsx(styles.modeButton, mode === 'decrement' && styles.modeButtonActive)}
          onClick={() => setMode('decrement')}
        >
          - Remove Stock
        </button>
        <button
          type="button"
          className={clsx(styles.modeButton, mode === 'set' && styles.modeButtonActive)}
          onClick={() => setMode('set')}
        >
          = Set Exact Count
        </button>
      </div>

      {/* Live Stock Calculation Preview */}
      <div className={styles.previewBox}>
        <div className={styles.previewItem}>
          <span className={styles.previewLabel}>Current Stock</span>
          <span className={styles.previewValue}>{currentStock}</span>
        </div>
        <ArrowRight size={20} color="var(--color-primary)" />
        <div className={styles.previewItem}>
          <span className={styles.previewLabel}>New Resulting Stock</span>
          <span className={clsx(styles.previewValue, styles.previewValueNew)}>{newStock}</span>
        </div>
      </div>

      {/* Inputs */}
      <Input
        id="stockAmount"
        type="number"
        min={0}
        label={
          mode === 'increment'
            ? 'Units to Add'
            : mode === 'decrement'
              ? 'Units to Remove'
              : 'New Total Units'
        }
        value={amount}
        onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
        errorText={error}
        required
      />

      {/* Quick Amount Presets */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginRight: '4px',
          }}
        >
          Presets:
        </span>
        {[5, 10, 25, 50, 100].map((preset) => (
          <button
            key={preset}
            type="button"
            className={styles.presetChip}
            onClick={() => setAmount(preset)}
          >
            {mode === 'increment'
              ? `+${preset}`
              : mode === 'decrement'
                ? `-${preset}`
                : `${preset}`}
          </button>
        ))}
      </div>

      {newStock <= (product.lowStockThreshold ?? 5) && (
        <div className={styles.thresholdWarning}>
          ⚠️ Resulting stock ({newStock}) will be at or below low-stock threshold (
          {product.lowStockThreshold ?? 5}).
        </div>
      )}

      <Input
        id="stockReason"
        type="text"
        label="Reason / Audit Note"
        placeholder="e.g. Received shipment, inventory count, damage"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          marginTop: 'var(--space-4)',
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={updateStockMutation.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" isLoading={updateStockMutation.isPending}>
          Apply Adjustment
        </Button>
      </div>
    </form>
  );
}

export function StockAdjustmentDrawer({
  isOpen,
  onClose,
  product,
  onSuccess,
}: StockAdjustmentDrawerProps) {
  if (!product) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Adjust Inventory Stock" size="md">
      <StockAdjustmentForm
        key={product._id || product.id}
        product={product}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Drawer>
  );
}
export default StockAdjustmentDrawer;
