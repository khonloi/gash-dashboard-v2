import React from 'react';
import type { Metadata } from 'next';
import { OverviewClientView } from './OverviewClientView';

export const metadata: Metadata = {
  title: 'Operations Overview | GASH Dashboard',
  description: 'Executive e-commerce operations, revenue analytics, and fulfillment health.',
};

export default function OverviewPage() {
  return <OverviewClientView />;
}
