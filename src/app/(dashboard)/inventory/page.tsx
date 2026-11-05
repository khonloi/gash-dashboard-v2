import React from 'react';
import type { Metadata } from 'next';
import { InventoryClientView } from './InventoryClientView';

export const metadata: Metadata = {
  title: 'Inventory Operations | GASH Dashboard',
  description: 'Real-time stock valuation, inventory tracking, and warehouse adjustments.',
};

export default function InventoryPage() {
  return <InventoryClientView />;
}
