import { Metadata } from 'next';
import OrderDetailClientView from './OrderDetailClientView';

export const metadata: Metadata = {
  title: 'Order Details | GASH Dashboard',
  description: 'View order items, fulfillment transitions, and customer details at GASH Dashboard.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailClientView orderId={id} />;
}
