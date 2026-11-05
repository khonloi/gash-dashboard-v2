import React from 'react';
import type { Metadata } from 'next';
import { ProductsClientView } from './ProductsClientView';

export const metadata: Metadata = {
  title: 'Products Catalog | GASH Dashboard',
  description: 'Manage products, stock availability, pricing, and catalog statuses.',
};

export default function ProductsPage() {
  return <ProductsClientView />;
}
