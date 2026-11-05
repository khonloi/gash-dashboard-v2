import { Metadata } from 'next';
import OrdersClientView from './OrdersClientView';

export const metadata: Metadata = {
  title: 'Orders & Fulfillment | GASH Dashboard',
  description:
    'Manage store orders, inspect customer shipping details, and track fulfillment at GASH Dashboard.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersPage() {
  return <OrdersClientView />;
}
