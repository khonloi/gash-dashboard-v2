import React from 'react';
import type { Metadata } from 'next';
import { CustomersClientView } from './CustomersClientView';

export const metadata: Metadata = {
  title: 'Customers & Users | GASH Dashboard',
  description: 'Manage customers directory, staff roles, and administrative permissions.',
};

export default function CustomersPage() {
  return <CustomersClientView />;
}
